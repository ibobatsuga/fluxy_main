<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\KaiBroadcast;
use App\Models\KaiChatbotSetting;
use App\Models\KaiConversation;
use App\Models\KaiDevice;
use App\Models\KaiGroup;
use App\Models\KaiLog;
use App\Models\SocialAccount;
use App\Services\Kai\WhatsAppQrGatewayService;
use App\Services\Meta\MetaMessagingApi;
use App\Services\Meta\WhatsAppCloudApi;
use App\Services\UsageService;
use App\Support\ModulePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KaiController extends ApiController
{
    public function device(Request $request): JsonResponse
    {
        $device = KaiDevice::where('tenant_id', $this->tenantId($request))->latest()->first();

        return $this->data(ModulePresenter::kaiDevice($device));
    }

    public function generateQr(Request $request, WhatsAppQrGatewayService $qrService): JsonResponse
    {
        abort_unless(config('services.kai.qr_gateway_enabled'), 503, 'Koneksi WhatsApp via QR belum dikonfigurasi. Gunakan Meta Cloud API.');
        $validated = $request->validate([
            'wa_number' => ['required', 'regex:/^[0-9]{8,20}$/'],
            'business_name' => ['required', 'string', 'max:160'],
        ]);

        $tenant = $request->user()->currentTenant;
        $device = $qrService->generateQr($tenant, $request->user(), $validated['wa_number'], $validated['business_name']);

        return $this->data(ModulePresenter::kaiDevice($device), 201);
    }

    public function qrStatus(Request $request, WhatsAppQrGatewayService $qrService): JsonResponse
    {
        abort_unless(config('services.kai.qr_gateway_enabled'), 503, 'Koneksi WhatsApp via QR belum dikonfigurasi.');
        $tenant = $request->user()->currentTenant;
        $device = $qrService->checkStatus($tenant);

        return $this->data(ModulePresenter::kaiDevice($device));
    }

    public function simulateScan(Request $request, WhatsAppQrGatewayService $qrService): JsonResponse
    {
        abort_unless(app()->environment(['local', 'testing']), 404);
        $tenant = $request->user()->currentTenant;
        $device = $qrService->simulateScan($tenant);

        return $this->data(ModulePresenter::kaiDevice($device));
    }

    public function disconnectDevice(Request $request, WhatsAppQrGatewayService $qrService): JsonResponse
    {
        $tenant = $request->user()->currentTenant;
        $qrService->disconnect($tenant);

        return $this->message('WhatsApp device disconnected.');
    }

    public function gatewayWebhook(Request $request, WhatsAppQrGatewayService $qrService): JsonResponse
    {
        $secret = (string) config('services.kai.gateway_webhook_secret');
        abort_if($secret === '', 503, 'Kai gateway webhook secret belum dikonfigurasi.');
        $provided = (string) $request->header('X-Fluxy-Signature', '');
        $expected = 'sha256='.hash_hmac('sha256', $request->getContent(), $secret);
        abort_unless($provided !== '' && hash_equals($expected, $provided), 403);
        $qrService->handleGatewayWebhook($request->all());

        return response()->json(['status' => 'success']);
    }

    public function requestDevice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wa_number' => ['required', 'regex:/^[0-9]{8,20}$/'],
            'business_name' => ['required', 'string', 'max:160'],
            'provider_phone_number_id' => ['nullable', 'string', 'max:255'],
            'waba_id' => ['nullable', 'string', 'max:255'],
            'access_token' => ['nullable', 'string'],
        ]);
        KaiDevice::where('tenant_id', $this->tenantId($request))->where('status', 'pending')->delete();
        $isConnected = ! empty($validated['provider_phone_number_id']) && ! empty($validated['access_token']);
        $device = KaiDevice::create(array_merge($validated, [
            'tenant_id' => $this->tenantId($request),
            'user_id' => $request->user()->id,
            'status' => $isConnected ? 'connected' : 'pending',
            'connected_at' => $isConnected ? now() : null,
        ]));

        return $this->data(ModulePresenter::kaiDevice($device), 201);
    }

    public function groups(Request $request): JsonResponse
    {
        return $this->data(KaiGroup::where('tenant_id', $this->tenantId($request))->latest()->get());
    }

    public function createGroup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'alias' => ['required', 'string', 'max:160'],
            'wa_group_id' => ['required', 'string', 'max:255'],
        ]);
        $group = KaiGroup::create($validated + [
            'tenant_id' => $this->tenantId($request), 'user_id' => $request->user()->id,
        ]);

        return $this->data($group, 201);
    }

    public function deleteGroup(Request $request, KaiGroup $group): JsonResponse
    {
        abort_unless($group->tenant_id === $this->tenantId($request), 404);
        $group->delete();

        return $this->message('Group deleted.');
    }

    public function broadcasts(Request $request): JsonResponse
    {
        return $this->data(KaiBroadcast::where('tenant_id', $this->tenantId($request))->latest()->get());
    }

    public function createBroadcast(Request $request, UsageService $usage): JsonResponse
    {
        abort_unless(app()->environment(['local', 'testing']), 501, 'Pengiriman broadcast belum tersedia sampai gateway WhatsApp grup dikonfigurasi.');
        $validated = $request->validate([
            'group_ids' => ['required', 'array', 'min:1', 'max:100'], 'group_ids.*' => ['string'],
            'message' => ['required', 'string', 'max:4096'], 'image_url' => ['nullable', 'url'],
            'scheduled_at' => ['nullable', 'date'],
        ]);
        $groupCount = KaiGroup::where('tenant_id', $this->tenantId($request))->whereIn('id', $validated['group_ids'])->count();
        abort_unless($groupCount === count(array_unique($validated['group_ids'])), 422, 'One or more groups are invalid.');
        $usage->record(
            $request->user()->currentTenant, 'kai', 'broadcast', count($validated['group_ids']),
            'kai-broadcast:'.($request->header('Idempotency-Key') ?: Str::ulid()),
        );
        $scheduled = ! empty($validated['scheduled_at']);
        $broadcast = KaiBroadcast::create($validated + [
            'tenant_id' => $this->tenantId($request), 'user_id' => $request->user()->id,
            'status' => $scheduled ? 'scheduled' : 'sent', 'sent_at' => $scheduled ? null : now(),
        ]);
        KaiLog::create([
            'tenant_id' => $this->tenantId($request), 'user_id' => $request->user()->id,
            'type' => 'broadcast', 'target' => implode(',', $validated['group_ids']),
            'status' => $scheduled ? 'pending' : 'success', 'detail' => ['broadcast_id' => $broadcast->id],
        ]);

        return $this->data($broadcast, 201);
    }

    public function cancelBroadcast(Request $request, KaiBroadcast $broadcast): JsonResponse
    {
        $this->authorizeBroadcast($request, $broadcast);
        abort_unless($broadcast->status === 'scheduled', 409, 'Only scheduled broadcasts can be cancelled.');
        $broadcast->update(['status' => 'cancelled']);

        return $this->data($broadcast);
    }

    public function retryBroadcast(Request $request, KaiBroadcast $broadcast): JsonResponse
    {
        abort_unless(app()->environment(['local', 'testing']), 501, 'Pengiriman broadcast belum tersedia sampai gateway WhatsApp grup dikonfigurasi.');
        $this->authorizeBroadcast($request, $broadcast);
        abort_unless($broadcast->status === 'failed', 409, 'Only failed broadcasts can be retried.');
        $broadcast->update(['status' => 'sent', 'sent_at' => now(), 'error_message' => null]);

        return $this->data($broadcast);
    }

    public function settings(Request $request): JsonResponse
    {
        $settings = KaiChatbotSetting::firstOrCreate(
            ['tenant_id' => $this->tenantId($request)],
            ['user_id' => $request->user()->id, 'is_active' => false, 'csv_sync_status' => 'idle'],
        );

        return $this->data($settings);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['sometimes', 'boolean'], 'greeting_msg' => ['sometimes', 'nullable', 'string', 'max:4000'],
            'payment_keywords' => ['sometimes', 'nullable', 'array'], 'payment_keywords.*' => ['string', 'max:100'],
            'admin_wa_number' => ['sometimes', 'nullable', 'regex:/^[0-9]{8,20}$/'],
            'handoff_notify_msg' => ['sometimes', 'nullable', 'string', 'max:4000'],
            'resume_keywords' => ['sometimes', 'nullable', 'array'], 'resume_keywords.*' => ['string', 'max:100'],
            'resume_msg' => ['sometimes', 'nullable', 'string', 'max:4000'],
            'csv_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
        ]);
        $settings = KaiChatbotSetting::updateOrCreate(
            ['tenant_id' => $this->tenantId($request)],
            $validated + ['user_id' => $request->user()->id],
        );

        return $this->data($settings);
    }

    public function syncCsv(Request $request): JsonResponse
    {
        $settings = KaiChatbotSetting::where('tenant_id', $this->tenantId($request))->firstOrFail();
        abort_unless($settings->csv_url, 422, 'CSV URL belum dikonfigurasi.');
        $settings->update(['csv_sync_status' => 'success', 'csv_last_synced' => now()]);

        return $this->data($settings);
    }

    public function conversations(Request $request): JsonResponse
    {
        $items = KaiConversation::where('tenant_id', $this->tenantId($request))
            ->with('messages')->orderByDesc('last_message_at')->get();

        return $this->data($items);
    }

    public function resume(Request $request, KaiConversation $conversation): JsonResponse
    {
        abort_unless($conversation->tenant_id === $this->tenantId($request), 404);
        $conversation->update(['state' => 'bot_active', 'resumed_at' => now()]);
        KaiLog::create([
            'tenant_id' => $this->tenantId($request), 'user_id' => $request->user()->id,
            'type' => 'resume', 'target' => $conversation->wa_contact, 'status' => 'success',
            'detail' => ['conversation_id' => $conversation->id],
        ]);

        return $this->data($conversation->fresh()->load('messages'));
    }

    public function sendMessage(
        Request $request,
        KaiConversation $conversation,
        WhatsAppCloudApi $whatsapp,
        MetaMessagingApi $messaging,
    ): JsonResponse {
        abort_unless($conversation->tenant_id === $this->tenantId($request), 404);
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:4096'],
        ]);
        if (($conversation->channel ?: 'whatsapp') === 'whatsapp') {
            $device = KaiDevice::query()
                ->where('tenant_id', $this->tenantId($request))
                ->when(
                    $conversation->provider_account_id,
                    fn ($query) => $query->where('provider_phone_number_id', $conversation->provider_account_id),
                )
                ->where('status', 'connected')
                ->latest('connected_at')
                ->firstOrFail();
            $providerMessageId = $whatsapp->sendText($device, $conversation->wa_contact, $validated['message']);
        } else {
            $account = SocialAccount::query()
                ->where('tenant_id', $this->tenantId($request))
                ->where('provider', $conversation->channel)
                ->where('provider_account_id', $conversation->provider_account_id)
                ->where('is_active', true)
                ->firstOrFail();
            $providerMessageId = $messaging->sendText($account, $conversation->wa_contact, $validated['message']);
        }
        $message = $conversation->messages()->create([
            'provider_message_id' => $providerMessageId,
            'sender' => 'admin',
            'message' => $validated['message'],
        ]);
        $conversation->update([
            'last_message' => $validated['message'],
            'last_message_at' => now(),
        ]);
        KaiLog::create([
            'tenant_id' => $this->tenantId($request),
            'user_id' => $request->user()->id,
            'type' => ($conversation->channel ?: 'whatsapp').'_outbound',
            'target' => $conversation->wa_contact,
            'status' => 'sent',
            'detail' => ['message_id' => $providerMessageId, 'conversation_id' => $conversation->id],
        ]);

        return $this->data($message, 201);
    }

    public function logs(Request $request): JsonResponse
    {
        $query = KaiLog::where('tenant_id', $this->tenantId($request));
        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return $this->data($query->latest()->limit(200)->get());
    }

    private function authorizeBroadcast(Request $request, KaiBroadcast $broadcast): void
    {
        abort_unless($broadcast->tenant_id === $this->tenantId($request), 404);
    }

    private function tenantId(Request $request): string
    {
        return (string) $request->user()->current_tenant_id;
    }
}
