<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\KaiConversation;
use App\Models\KaiConversationMessage;
use App\Models\KaiDevice;
use App\Models\KaiLog;
use App\Models\SocialAccount;
use App\Services\Meta\MetaCredentials;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class MetaWebhookController extends ApiController
{
    public function verify(Request $request, MetaCredentials $credentials): Response
    {
        $mode = $request->query('hub.mode', $request->query('hub_mode'));
        $token = (string) $request->query('hub.verify_token', $request->query('hub_verify_token', ''));
        $challenge = (string) $request->query('hub.challenge', $request->query('hub_challenge', ''));
        $expected = $credentials->webhookVerifyToken();

        abort_unless($mode === 'subscribe' && $expected !== '' && hash_equals($expected, $token), 403);

        return response($challenge, 200)->header('Content-Type', 'text/plain');
    }

    public function receive(Request $request, MetaCredentials $credentials): Response
    {
        $secret = $credentials->appSecret();
        abort_if($secret === '', 503, 'Meta App Secret belum dikonfigurasi.');

        $provided = (string) $request->header('X-Hub-Signature-256', '');
        $expected = 'sha256='.hash_hmac('sha256', $request->getContent(), $secret);
        abort_unless($provided !== '' && hash_equals($expected, $provided), 403);

        $payload = $request->json()->all();
        if (($payload['object'] ?? null) === 'whatsapp_business_account') {
            $this->handleWhatsApp($payload);
        }
        if (in_array($payload['object'] ?? null, ['page', 'instagram'], true)) {
            $this->handleSocialMessaging($payload);
        }

        return response('EVENT_RECEIVED', 200)->header('Content-Type', 'text/plain');
    }

    private function handleWhatsApp(array $payload): void
    {
        foreach ($payload['entry'] ?? [] as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                if (($change['field'] ?? null) !== 'messages') {
                    continue;
                }

                $value = $change['value'] ?? [];
                $phoneNumberId = (string) data_get($value, 'metadata.phone_number_id', '');
                $device = KaiDevice::query()
                    ->where('provider_phone_number_id', $phoneNumberId)
                    ->where('status', 'connected')
                    ->first();
                if (! $device) {
                    continue;
                }

                $contacts = collect($value['contacts'] ?? [])->keyBy('wa_id');
                foreach ($value['messages'] ?? [] as $message) {
                    $messageId = (string) ($message['id'] ?? '');
                    $from = preg_replace('/\D+/', '', (string) ($message['from'] ?? ''));
                    if ($messageId === '' || $from === '' || KaiConversationMessage::where('provider_message_id', $messageId)->exists()) {
                        continue;
                    }

                    $conversation = KaiConversation::firstOrCreate(
                        [
                            'tenant_id' => $device->tenant_id,
                            'channel' => 'whatsapp',
                            'provider_account_id' => $phoneNumberId,
                            'wa_contact' => $from,
                        ],
                        [
                            'user_id' => $device->user_id,
                            'contact_name' => data_get($contacts->get($from), 'profile.name'),
                            'state' => 'bot_active',
                        ],
                    );
                    $body = $this->messageBody($message);
                    $conversation->messages()->create([
                        'provider_message_id' => $messageId,
                        'sender' => 'customer',
                        'message' => $body,
                    ]);
                    $conversation->update([
                        'contact_name' => $conversation->contact_name ?: data_get($contacts->get($from), 'profile.name'),
                        'last_message' => $body,
                        'last_message_at' => isset($message['timestamp'])
                            ? Carbon::createFromTimestamp((int) $message['timestamp'])
                            : now(),
                    ]);
                    KaiLog::create([
                        'tenant_id' => $device->tenant_id,
                        'user_id' => $device->user_id,
                        'type' => 'whatsapp_inbound',
                        'target' => $from,
                        'status' => 'received',
                        'detail' => ['message_id' => $messageId, 'message_type' => $message['type'] ?? null],
                    ]);
                }
            }
        }
    }

    private function handleSocialMessaging(array $payload): void
    {
        $provider = ($payload['object'] ?? null) === 'instagram' ? 'instagram' : 'facebook';

        foreach ($payload['entry'] ?? [] as $entry) {
            $account = SocialAccount::query()
                ->where('provider', $provider)
                ->where('provider_account_id', (string) ($entry['id'] ?? ''))
                ->where('is_active', true)
                ->first();
            if (! $account) {
                continue;
            }

            foreach ($entry['messaging'] ?? [] as $event) {
                $message = $event['message'] ?? null;
                $messageId = (string) ($message['mid'] ?? '');
                $sender = (string) data_get($event, 'sender.id', '');
                if (! is_array($message) || ($message['is_echo'] ?? false) || $messageId === '' || $sender === '') {
                    continue;
                }
                if (KaiConversationMessage::where('provider_message_id', $messageId)->exists()) {
                    continue;
                }

                $body = (string) ($message['text'] ?? '['.data_get($message, 'attachments.0.type', 'message').']');
                $conversation = KaiConversation::firstOrCreate(
                    [
                        'tenant_id' => $account->tenant_id,
                        'channel' => $provider,
                        'provider_account_id' => $account->provider_account_id,
                        'wa_contact' => $sender,
                    ],
                    [
                        'user_id' => $account->user_id,
                        'state' => 'bot_active',
                    ],
                );
                $conversation->messages()->create([
                    'provider_message_id' => $messageId,
                    'sender' => 'customer',
                    'message' => $body,
                ]);
                $conversation->update([
                    'last_message' => $body,
                    'last_message_at' => isset($event['timestamp'])
                        ? Carbon::createFromTimestampMs((int) $event['timestamp'])
                        : now(),
                ]);
                KaiLog::create([
                    'tenant_id' => $account->tenant_id,
                    'user_id' => $account->user_id,
                    'type' => $provider.'_inbound',
                    'target' => $sender,
                    'status' => 'received',
                    'detail' => ['message_id' => $messageId],
                ]);
            }
        }
    }

    private function messageBody(array $message): string
    {
        $type = (string) ($message['type'] ?? 'unknown');

        return match ($type) {
            'text' => (string) data_get($message, 'text.body', ''),
            'button' => (string) (data_get($message, 'button.text') ?: data_get($message, 'button.payload', '[button]')),
            'interactive' => (string) (
                data_get($message, 'interactive.button_reply.title')
                ?: data_get($message, 'interactive.list_reply.title')
                ?: '[interactive]'
            ),
            'image', 'video', 'document' => (string) (data_get($message, $type.'.caption') ?: '['.$type.']'),
            'audio', 'sticker', 'location', 'contacts' => '['.$type.']',
            default => '['.$type.']',
        };
    }
}
