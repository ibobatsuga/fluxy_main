<?php

namespace Tests\Unit;

use App\Exceptions\ImageGenerationException;
use App\Services\Images\GeminiImageProvider;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GeminiImageProviderTest extends TestCase
{
    public function test_it_requests_and_returns_a_native_generated_image(): void
    {
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zr1sAAAAASUVORK5CYII=', true);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [[
                    'content' => ['parts' => [[
                        'inlineData' => ['mimeType' => 'image/png', 'data' => base64_encode($png)],
                    ]]],
                ]],
            ]),
        ]);

        $provider = new GeminiImageProvider('test-key', 'gemini-3.1-flash-image');
        $image = $provider->generate('Premium product on a marble table', 'story', $png, 'image/png');

        $this->assertSame($png, $image->bytes);
        $this->assertSame('image/png', $image->mimeType);
        $this->assertSame('png', $image->extension);
        $this->assertTrue($image->metadata['used_reference_image']);
        Http::assertSent(function (Request $request) use ($png): bool {
            return $request->hasHeader('X-goog-api-key', 'test-key')
                && $request['generationConfig']['responseModalities'] === ['IMAGE']
                && $request['generationConfig']['imageConfig']['aspectRatio'] === '9:16'
                && $request['contents'][0]['parts'][0]['inlineData']['data'] === base64_encode($png);
        });
    }

    public function test_it_rejects_a_response_without_an_image(): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [['content' => ['parts' => [['text' => 'No image']]]]],
            ]),
        ]);

        $this->expectException(ImageGenerationException::class);
        $this->expectExceptionMessage('returned no generated image');

        (new GeminiImageProvider('test-key'))->generate('Prompt', 'feed');
    }
}
