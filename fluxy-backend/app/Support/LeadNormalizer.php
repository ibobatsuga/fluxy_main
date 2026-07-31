<?php

namespace App\Support;

final class LeadNormalizer
{
    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    public static function fromGoogleMaps(array $item): array
    {
        return [
            'type' => 'business',
            'name' => self::first($item, ['title', 'name', 'placeName']) ?? 'Unknown',
            'company' => null,
            'title' => null,
            'phone' => self::first($item, ['phone', 'phoneNumber', 'phoneUnformatted']),
            'email' => self::first($item, ['email', 'primaryEmail']) ?? self::firstOfArray($item, ['emails']),
            'website' => self::first($item, ['website', 'url']),
            'address' => self::first($item, ['address', 'fullAddress']),
            'category' => self::first($item, ['category', 'categoryName']) ?? self::firstOfArray($item, ['categories']),
            'rating' => self::first($item, ['rating', 'totalScore']),
            'linkedin_url' => self::firstOfArray($item, ['socials.linkedin', 'linkedin']),
        ];
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    public static function fromLinkedInPerson(array $item): array
    {
        $position = $item['currentPosition'] ?? $item['position'] ?? [];
        $position = is_array($position) ? $position : [];

        return [
            'type' => 'person',
            'name' => self::first($item, ['name', 'fullName']) ?? 'Unknown',
            'company' => self::first($position, ['company', 'companyName']) ?? self::first($item, ['company', 'companyName']),
            'title' => self::first($item, ['headline', 'title']) ?? self::first($position, ['title']),
            'phone' => null,
            'email' => self::first($item, ['email']),
            'website' => null,
            'address' => self::first($item, ['location', 'locationName']),
            'category' => null,
            'rating' => null,
            'linkedin_url' => self::first($item, ['linkedinUrl', 'profileUrl', 'url']),
        ];
    }

    private static function first(array $item, array $keys): ?string
    {
        foreach ($keys as $key) {
            $value = $item[$key] ?? null;
            if (is_string($value) && $value !== '') {
                return $value;
            }
            if (is_numeric($value)) {
                return (string) $value;
            }
        }

        return null;
    }

    private static function firstOfArray(array $item, array $keys): ?string
    {
        foreach ($keys as $key) {
            $value = data_get($item, $key);
            if (is_array($value) && $value !== []) {
                $first = reset($value);

                return is_string($first) ? $first : null;
            }
            if (is_string($value) && $value !== '') {
                return $value;
            }
        }

        return null;
    }
}
