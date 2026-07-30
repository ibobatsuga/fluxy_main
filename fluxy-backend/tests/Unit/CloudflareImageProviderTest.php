<?php

namespace Tests\Unit;

use App\Exceptions\ImageGenerationException;
use App\Services\Images\CloudflareImageProvider;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CloudflareImageProviderTest extends TestCase
{
    public function test_it_generates_and_validates_an_image(): void
    {
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zr1sAAAAASUVORK5CYII=', true);

        Http::fake([
            'api.cloudflare.com/*' => Http::response([
                'result' => ['image' => base64_encode($png)],
                'success' => true,
                'errors' => [],
                'messages' => [],
            ], 200, ['cf-ray' => 'test-ray']),
        ]);

        $provider = new CloudflareImageProvider(
            accountId: 'account-id',
            token: 'secret-token',
            model: '@cf/black-forest-labs/flux-1-schnell',
            steps: 4,
        );
        $image = $provider->generate('A premium product photograph', 'feed');

        $this->assertSame('cloudflare', $provider->name());
        $this->assertSame($png, $image->bytes);
        $this->assertSame('image/png', $image->mimeType);
        $this->assertSame('png', $image->extension);
        $this->assertSame('test-ray', $image->metadata['cf_ray']);

        Http::assertSent(fn (Request $request) => $request->url() === 'https://api.cloudflare.com/client/v4/accounts/account-id/ai/run/@cf/black-forest-labs/flux-1-schnell'
            && $request->hasHeader('Authorization', 'Bearer secret-token')
            && $request['prompt'] === 'A premium product photograph'
            && $request['steps'] === 4
            && is_int($request['seed']));
    }

    public function test_it_rejects_a_success_response_without_an_image(): void
    {
        Http::fake([
            'api.cloudflare.com/*' => Http::response(['result' => [], 'success' => true]),
        ]);

        $provider = new CloudflareImageProvider(
            accountId: 'account-id',
            token: 'secret-token',
            model: '@cf/black-forest-labs/flux-1-schnell',
        );

        $this->expectException(ImageGenerationException::class);
        $this->expectExceptionMessage('returned no image');

        $provider->generate('A premium product photograph', 'feed');
    }
}
