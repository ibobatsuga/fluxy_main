<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\LeadSearchException;
use App\Models\Lead;
use App\Services\Leads\ApifyLeadService;
use App\Services\UsageService;
use App\Support\LeadNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LunaController extends ApiController
{
    public function search(Request $request, UsageService $usage, ApifyLeadService $apify): JsonResponse
    {
        $validated = $request->validate([
            'source' => ['required', 'in:google_maps,linkedin_company,linkedin_people'],
            'keyword' => ['required_if:source,google_maps,linkedin_people', 'nullable', 'string', 'max:200'],
            'location' => ['required_if:source,google_maps', 'nullable', 'string', 'max:200'],
            'job_title' => ['nullable', 'string', 'max:150'],
            'company_urls' => ['required_if:source,linkedin_company', 'nullable', 'array', 'max:5'],
            'company_urls.*' => ['url'],
            'max_items' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $tenant = $request->user()->currentTenant;
        $maxItems = min(50, (int) ($validated['max_items'] ?? 20));
        $usage->assertAvailable($tenant, 'luna', $maxItems);

        try {
            $rawItems = match ($validated['source']) {
                'google_maps' => $apify->searchGoogleMaps(
                    $validated['keyword'],
                    $validated['location'],
                    $maxItems,
                ),
                'linkedin_company' => $apify->searchLinkedInCompanyEmployees(
                    $validated['company_urls'],
                    $validated['job_title'] ?? null,
                    $maxItems,
                ),
                'linkedin_people' => $apify->searchLinkedInPeople(
                    $validated['keyword'],
                    $validated['location'] ?? null,
                    $validated['job_title'] ?? null,
                    $maxItems,
                ),
            };
        } catch (LeadSearchException $exception) {
            Log::warning('Luna lead search failed.', [
                'source' => $validated['source'],
                'exception' => $exception::class,
            ]);

            return response()->json([
                'message' => 'Luna belum berhasil mencari leads. Silakan coba kembali.',
                'error' => 'lead_search_failed',
            ], 502);
        }

        $searchQuery = collect($validated)->except(['company_urls'])->filter()->all();
        $tenantId = $tenant->id;
        $userId = $request->user()->id;
        $source = $validated['source'];

        $leads = collect($rawItems)
            ->filter(fn ($item) => is_array($item))
            ->map(function (array $item) use ($source, $tenantId, $userId, $searchQuery): Lead {
                $normalized = $source === 'google_maps'
                    ? LeadNormalizer::fromGoogleMaps($item)
                    : LeadNormalizer::fromLinkedInPerson($item);

                return Lead::create([
                    'tenant_id' => $tenantId,
                    'user_id' => $userId,
                    'source' => $source,
                    ...$normalized,
                    'raw_metadata' => $item,
                    'search_query' => $searchQuery,
                ]);
            })
            ->values();

        if ($leads->isNotEmpty()) {
            $usage->record($tenant, 'luna', 'search', $leads->count());
        }

        return $this->data($leads);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Lead::where('tenant_id', $this->tenantId($request));

        if ($source = $request->string('source')->toString()) {
            $query->where('source', $source);
        }

        $leads = $query->latest()->paginate(50);

        return $this->data($leads->items(), meta: ['total' => $leads->total(), 'per_page' => $leads->perPage()]);
    }

    public function destroy(Request $request, Lead $lead): JsonResponse
    {
        abort_unless($lead->tenant_id === $this->tenantId($request), 404);
        $lead->delete();

        return $this->message('Lead deleted.');
    }

    public function export(Request $request): StreamedResponse
    {
        $leads = Lead::where('tenant_id', $this->tenantId($request))->latest()->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="luna-leads-'.now()->format('Y-m-d').'.csv"',
        ];

        return response()->stream(function () use ($leads) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Name', 'Type', 'Company', 'Title', 'Phone', 'Email', 'Website', 'Address', 'Category', 'Rating', 'LinkedIn URL', 'Source', 'Created At']);
            foreach ($leads as $lead) {
                fputcsv($handle, [
                    $lead->name, $lead->type, $lead->company, $lead->title, $lead->phone,
                    $lead->email, $lead->website, $lead->address, $lead->category, $lead->rating,
                    $lead->linkedin_url, $lead->source, $lead->created_at?->toDateTimeString(),
                ]);
            }
            fclose($handle);
        }, 200, $headers);
    }

    private function tenantId(Request $request): string
    {
        return (string) $request->user()->current_tenant_id;
    }
}
