<?php

namespace App\Data;

final readonly class GeneratedImage
{
    public function __construct(
        public string $bytes,
        public string $mimeType,
        public string $extension,
        public array $metadata = [],
    ) {}
}
