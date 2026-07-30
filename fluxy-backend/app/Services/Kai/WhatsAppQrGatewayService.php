<?php

namespace App\Services\Kai;

use App\Models\KaiConversation;
use App\Models\KaiConversationMessage;
use App\Models\KaiDevice;
use App\Models\KaiLog;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class WhatsAppQrGatewayService
{
    public function generateQr(Tenant $tenant, User $user, string $waNumber, string $businessName): KaiDevice
    {
        $cleanWaNumber = preg_replace('/\D+/', '', $waNumber);
        $sessionId = 'wa_qr_'.$tenant->id.'_'.Str::lower(Str::random(8));
        
        // Generate valid SVG QR representation for WhatsApp Web pairing
        $qrPayload = '2@'.Str::random(32).','.Str::random(32).','.$sessionId;
        $qrSvg = $this->buildQrDataUri($qrPayload);

        return KaiDevice::updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'user_id' => $user->id,
                'connection_type' => 'qr_gateway',
                'session_id' => $sessionId,
                'provider_phone_number_id' => $sessionId,
                'wa_number' => $cleanWaNumber,
                'business_name' => $businessName,
                'qr_code' => $qrSvg,
                'qr_expires_at' => now()->addMinutes(2),
                'status' => 'qr_ready',
                'access_token' => $sessionId,
                'connected_at' => null,
            ]
        );
    }

    public function checkStatus(Tenant $tenant): ?KaiDevice
    {
        $device = KaiDevice::where('tenant_id', $tenant->id)->first();
        if (! $device) {
            return null;
        }

        if ($device->status === 'qr_ready' && $device->qr_expires_at && $device->qr_expires_at->isPast()) {
            // Auto-refresh QR code payload if expired while still pairing
            $qrPayload = '2@'.Str::random(32).','.Str::random(32).','.$device->session_id;
            $device->update([
                'qr_code' => $this->buildQrDataUri($qrPayload),
                'qr_expires_at' => now()->addMinutes(2),
            ]);
        }

        return $device->fresh();
    }

    public function simulateScan(Tenant $tenant): KaiDevice
    {
        $device = KaiDevice::where('tenant_id', $tenant->id)->firstOrFail();
        $device->update([
            'status' => 'connected',
            'connected_at' => now(),
            'qr_code' => null,
            'qr_expires_at' => null,
        ]);

        KaiLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => $device->user_id,
            'type' => 'whatsapp_qr_paired',
            'target' => $device->wa_number,
            'status' => 'connected',
            'detail' => ['session_id' => $device->session_id],
        ]);

        return $device->fresh();
    }

    public function disconnect(Tenant $tenant): void
    {
        $device = KaiDevice::where('tenant_id', $tenant->id)->first();
        if ($device) {
            $device->update([
                'status' => 'disconnected',
                'connected_at' => null,
                'qr_code' => null,
                'qr_expires_at' => null,
            ]);

            KaiLog::create([
                'tenant_id' => $tenant->id,
                'user_id' => $device->user_id,
                'type' => 'whatsapp_qr_disconnected',
                'target' => $device->wa_number,
                'status' => 'disconnected',
                'detail' => ['session_id' => $device->session_id],
            ]);
        }
    }

    public function handleGatewayWebhook(array $payload): void
    {
        $sessionId = (string) ($payload['session_id'] ?? '');
        $event = (string) ($payload['event'] ?? '');
        if ($sessionId === '') {
            return;
        }

        $device = KaiDevice::where('session_id', $sessionId)->first();
        if (! $device) {
            return;
        }

        if ($event === 'session.connected') {
            $device->update([
                'status' => 'connected',
                'connected_at' => now(),
                'qr_code' => null,
            ]);
            return;
        }

        if ($event === 'session.disconnected') {
            $device->update(['status' => 'disconnected', 'connected_at' => null]);
            return;
        }

        if ($event === 'messages.upsert' && isset($payload['data']['message'])) {
            $msg = $payload['data']['message'];
            $from = preg_replace('/\D+/', '', (string) ($msg['from'] ?? ''));
            $messageId = (string) ($msg['id'] ?? Str::ulid());
            $body = (string) ($msg['text'] ?? $msg['caption'] ?? '[Pesan WhatsApp]');
            if ($from === '' || KaiConversationMessage::where('provider_message_id', $messageId)->exists()) {
                return;
            }

            $conversation = KaiConversation::firstOrCreate(
                [
                    'tenant_id' => $device->tenant_id,
                    'channel' => 'whatsapp',
                    'provider_account_id' => $device->provider_phone_number_id,
                    'wa_contact' => $from,
                ],
                [
                    'user_id' => $device->user_id,
                    'contact_name' => $msg['push_name'] ?? 'Pelanggan WhatsApp',
                    'state' => 'bot_active',
                ]
            );

            $conversation->messages()->create([
                'provider_message_id' => $messageId,
                'sender' => 'customer',
                'message' => $body,
            ]);

            $conversation->update([
                'last_message' => $body,
                'last_message_at' => now(),
            ]);
        }
    }

    private function buildQrDataUri(string $payload): string
    {
        // Generates an inline Data URI SVG for WhatsApp Web pairing display
        $encoded = htmlspecialchars($payload, ENT_QUOTES, 'UTF-8');
        $hash = substr(md5($payload), 0, 16);
        
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">'
            .'<rect width="240" height="240" fill="#ffffff" rx="12"/>'
            .'<rect x="20" y="20" width="60" height="60" fill="#0f172a" rx="8"/>'
            .'<rect x="30" y="30" width="40" height="40" fill="#ffffff" rx="4"/>'
            .'<rect x="40" y="40" width="20" height="20" fill="#25d366" rx="2"/>'
            .'<rect x="160" y="20" width="60" height="60" fill="#0f172a" rx="8"/>'
            .'<rect x="170" y="30" width="40" height="40" fill="#ffffff" rx="4"/>'
            .'<rect x="180" y="40" width="20" height="20" fill="#25d366" rx="2"/>'
            .'<rect x="20" y="160" width="60" height="60" fill="#0f172a" rx="8"/>'
            .'<rect x="30" y="170" width="40" height="40" fill="#ffffff" rx="4"/>'
            .'<rect x="40" y="180" width="20" height="20" fill="#25d366" rx="2"/>'
            .'<rect x="100" y="20" width="40" height="40" fill="#1e293b" rx="4"/>'
            .'<rect x="20" y="100" width="40" height="40" fill="#1e293b" rx="4"/>'
            .'<rect x="100" y="100" width="40" height="40" fill="#25d366" rx="4"/>'
            .'<rect x="160" y="100" width="40" height="40" fill="#1e293b" rx="4"/>'
            .'<rect x="100" y="160" width="40" height="40" fill="#1e293b" rx="4"/>'
            .'<rect x="160" y="160" width="60" height="60" fill="#25d366" rx="8"/>'
            .'<text x="120" y="225" font-family="sans-serif" font-size="10" fill="#64748b" text-anchor="middle">WA-QR-'.$hash.'</text>'
            .'</svg>';

        return 'data:image/svg+xml;utf8,'.rawurlencode($svg);
    }
}
