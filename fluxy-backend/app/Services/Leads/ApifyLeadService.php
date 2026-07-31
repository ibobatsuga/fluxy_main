<?php

namespace App\Services\Leads;

use App\Exceptions\LeadSearchException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Throwable;

class ApifyLeadService
{
    private const ACTOR_GOOGLE_MAPS = 'lurkapi~google-maps-business-leads-scraper';

    private const ACTOR_LINKEDIN_COMPANY = 'harvestapi~linkedin-company-employees';

    private const ACTOR_LINKEDIN_PEOPLE = 'harvestapi~linkedin-profile-search';

    /**
     * @return list<array<string, mixed>>
     */
    public function searchGoogleMaps(string $keyword, string $location, int $maxItems): array
    {
        return $this->runActor(self::ACTOR_GOOGLE_MAPS, [
            'searchTerms' => [$keyword],
            'location' => $location,
            'maxPlacesPerSearch' => $maxItems,
            'language' => 'en',
        ]);
    }

    /**
     * @param  list<string>  $companyUrls
     * @return list<array<string, mixed>>
     */
    public function searchLinkedInCompanyEmployees(array $companyUrls, ?string $jobTitle, int $maxItems): array
    {
        $input = [
            'companies' => $companyUrls,
            'profileScraperMode' => 'Short ($4 per 1k)',
            'maxItems' => $maxItems,
        ];
        if ($jobTitle !== null && $jobTitle !== '') {
            $input['jobTitles'] = [$jobTitle];
        }

        return $this->runActor(self::ACTOR_LINKEDIN_COMPANY, $input);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function searchLinkedInPeople(string $query, ?string $location, ?string $jobTitle, int $maxItems): array
    {
        $input = [
            'searchQuery' => $query,
            'profileScraperMode' => 'Short ($4 per 1k)',
            'maxItems' => $maxItems,
        ];
        if ($location !== null && $location !== '') {
            $input['locations'] = [$location];
        }
        if ($jobTitle !== null && $jobTitle !== '') {
            $input['currentJobTitles'] = [$jobTitle];
        }

        return $this->runActor(self::ACTOR_LINKEDIN_PEOPLE, $input);
    }

    /**
     * @param  array<string, mixed>  $input
     * @return list<array<string, mixed>>
     */
    private function runActor(string $actorId, array $input): array
    {
        $token = (string) config('services.apify.api_token');
        if ($token === '') {
            throw new LeadSearchException('Apify API token is not configured.');
        }

        try {
            $response = Http::asJson()
                ->acceptJson()
                ->withToken($token)
                ->connectTimeout(10)
                ->timeout(120)
                ->retry([0, 1000], when: function (Throwable $exception): bool {
                    if ($exception instanceof ConnectionException) {
                        return true;
                    }

                    return $exception instanceof RequestException
                        && ($exception->response->status() === 429 || $exception->response->serverError());
                }, throw: false)
                ->post(sprintf(
                    'https://api.apify.com/v2/acts/%s/run-sync-get-dataset-items',
                    $actorId,
                ), $input);
        } catch (Throwable $exception) {
            throw new LeadSearchException('Apify could not be reached.', previous: $exception);
        }

        if ($response->failed()) {
            $message = (string) $response->json('error.message', '');

            throw new LeadSearchException(
                'Apify request failed with HTTP '.$response->status().'.'.($message !== '' ? ' '.$message : ''),
            );
        }

        $items = $response->json();

        return is_array($items) ? $items : [];
    }
}
