<?php

namespace App\Exceptions;

use RuntimeException;

class ImageGenerationException extends RuntimeException
{
    // Keeps provider failures distinct from validation and application errors.
}
