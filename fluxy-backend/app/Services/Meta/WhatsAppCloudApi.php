<?php

namespace App\Services\Meta;

use App\Exceptions\MetaApiException;
use App\Models\KaiDevice;

class WhatsAppCloudApi
{
    public function __construct(private readonly MetaGraphClient $graph) {}

    public function sendText(KaiDevice $device, string $recipient, string $message): string
    {
        if ($device->status !== 'connected' || ! $device->provider_phone_number_id || ! $device->access_token) {
            throw new MetaApiException('Nomor WhatsApp Cloud API belum terhubung.');
        }

        $payload = $this->graph->postJson(
            $device->provider_phone_number_id.'/messages',
            $device->access_token,
            [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => preg_replace('/\D+/', '', $recipient),
                'type' => 'text',
                'text' => [
                    'preview_url' => false,
                    'body' => $message,
                ],
            ],
        );

        $messageId = data_get($payload, 'messages.0.id');
        if (! is_string($messageId) || $messageId === '') {
            throw new MetaApiException('Meta tidak mengembalikan ID pesan WhatsApp.');
        }

        return $messageId;
    }
}
