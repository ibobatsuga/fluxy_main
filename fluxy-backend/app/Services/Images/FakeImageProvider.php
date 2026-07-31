<?php

namespace App\Services\Images;

use App\Contracts\ImageProvider;
use App\Data\GeneratedImage;

class FakeImageProvider implements ImageProvider
{
    public function name(): string
    {
        return 'fake';
    }

    public function generate(
        string $prompt,
        string $contentType,
        array $referenceImages = [],
    ): GeneratedImage {
        [$width, $height] = $contentType === 'story' ? [1080, 1920] : [1080, 1080];
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'.$width.'" height="'.$height.'"><defs><linearGradient id="g"><stop stop-color="#7c3aed"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="54">Fluxy Pixel Preview</text></svg>';

        return new GeneratedImage($svg, 'image/svg+xml', 'svg');
    }
}
