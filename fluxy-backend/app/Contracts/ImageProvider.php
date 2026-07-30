<?php

namespace App\Contracts;

use App\Data\GeneratedImage;

interface ImageProvider
{
    public function name(): string;

    public function generate(string $prompt, string $contentType): GeneratedImage;
}
