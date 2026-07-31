<?php

namespace App\Exceptions;

use RuntimeException;

class LeadSearchException extends RuntimeException
{
    // Keeps lead-provider failures distinct from validation and application errors.
}
