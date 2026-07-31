<?php

namespace App\Contracts;

use App\Data\GeneratedImage;

interface ImageProvider
{
    public function name(): string;

    /**
     * @param  list<array{bytes: string, mimeType: string}>  $referenceImages
     */
    public function generate(
        string $prompt,
        string $contentType,
        array $referenceImages = [],
    ): GeneratedImage;
}
