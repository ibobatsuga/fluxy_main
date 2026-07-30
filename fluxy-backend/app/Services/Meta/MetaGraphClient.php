<?php

namespace App\Services\Meta;

use App\Exceptions\MetaApiException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class MetaGraphClient
{
    public function __construct(private readonly MetaCredentials $credentials) {}

    public function get(string $path, string $accessToken, array $query = []): array
    {
        $response = $this->request($accessToken)->get($this->url($path), $this->withProof($query, $accessToken));

        return $this->payload($response);
    }

    public function getAll(string $path, string $accessToken, array $query = []): array
    {
        $items = [];
        $url = $this->url($path);
        $parameters = $this->withProof($query, $accessToken);

        do {
            $payload = $this->payload($this->request($accessToken)->get($url, $parameters));
            array_push($items, ...($payload['data'] ?? []));
            $url = $payload['paging']['next'] ?? null;
            $parameters = [];
        } while ($url);

        return $items;
    }

    public function post(string $path, string $accessToken, array $data = []): array
    {
        $response = $this->request($accessToken)
            ->asForm()
            ->post($this->url($path), $this->withProof($data, $accessToken));

        return $this->payload($response);
    }

    public function postJson(string $path, string $accessToken, array $data): array
    {
        $query = $this->withProof([], $accessToken);
        $response = $this->request($accessToken)->post($this->url($path).'?'.http_build_query($query), $data);

        return $this->payload($response);
    }

    private function request(string $accessToken): PendingRequest
    {
        if ($accessToken === '') {
            throw new MetaApiException('Meta access token belum dikonfigurasi.');
        }

        return Http::acceptJson()
            ->withToken($accessToken)
            ->timeout((int) config('services.meta.timeout', 30))
            ->retry(2, 250, throw: false);
    }

    private function url(string $path): string
    {
        if (str_starts_with($path, 'https://')) {
            return $path;
        }

        return rtrim((string) config('services.meta.graph_url'), '/')
            .'/'.trim((string) config('services.meta.graph_version'), '/')
            .'/'.ltrim($path, '/');
    }

    private function withProof(array $parameters, string $accessToken): array
    {
        $secret = $this->credentials->appSecret();
        if ($secret !== '') {
            $parameters['appsecret_proof'] = hash_hmac('sha256', $accessToken, $secret);
        }

        return $parameters;
    }

    private function payload(Response $response): array
    {
        if ($response->successful()) {
            return $response->json() ?? [];
        }

        $error = $response->json('error', []);
        $message = $error['message'] ?? 'Meta Graph API request gagal.';
        $code = $error['code'] ?? $response->status();

        throw new MetaApiException("{$message} (Meta code: {$code})", (int) $response->status());
    }
}
