<?php

namespace App\Services\Meta;

use App\Exceptions\MetaApiException;
use App\Models\SocialAccount;

class MetaMessagingApi
{
    public function __construct(private readonly MetaGraphClient $graph) {}

    public function sendText(SocialAccount $account, string $recipient, string $message): string
    {
        if (! in_array($account->provider, ['facebook', 'instagram'], true) || ! $account->access_token) {
            throw new MetaApiException('Akun Facebook atau Instagram belum terhubung.');
        }

        $payload = $this->graph->postJson(
            $account->provider_account_id.'/messages',
            $account->access_token,
            [
                'recipient' => ['id' => $recipient],
                'message' => ['text' => $message],
            ],
        );
        $messageId = $payload['message_id'] ?? null;
        if (! is_string($messageId) || $messageId === '') {
            throw new MetaApiException('Meta tidak mengembalikan ID pesan.');
        }

        return $messageId;
    }
}
