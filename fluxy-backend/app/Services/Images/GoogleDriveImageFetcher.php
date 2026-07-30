<?php

namespace App\Services\Images;

use App\Exceptions\ImageGenerationException;
use Illuminate\Support\Facades\Http;
use Throwable;

class GoogleDriveImageFetcher
{
    private const MAX_BYTES = 20 * 1024 * 1024;

    public function fetch(string $link): array
    {
        $fileId = $this->fileId($link);
        if ($fileId === null) {
            throw new ImageGenerationException('Link Google Drive tidak valid atau tidak berisi file ID.');
        }

        try {
            $response = Http::accept('image/*')
                ->connectTimeout(10)
                ->timeout(45)
                ->withOptions(['allow_redirects' => ['max' => 5, 'strict' => true]])
                ->get('https://drive.usercontent.google.com/download', [
                    'id' => $fileId,
                    'export' => 'download',
                    'confirm' => 't',
                ]);
        } catch (Throwable $exception) {
            throw new ImageGenerationException('Gambar Google Drive tidak dapat diunduh.', previous: $exception);
        }

        if (! $response->successful()) {
            throw new ImageGenerationException('Google Drive mengembalikan HTTP '.$response->status().'.');
        }

        $bytes = $response->body();
        if ($bytes === '' || strlen($bytes) > self::MAX_BYTES) {
            throw new ImageGenerationException('File Google Drive kosong atau melebihi batas 20 MB.');
        }

        $mimeType = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
        $extension = match ($mimeType) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => throw new ImageGenerationException('Link Google Drive harus dapat diakses publik dan berisi JPG, PNG, atau WebP.'),
        };

        return compact('bytes', 'mimeType', 'extension');
    }

    private function fileId(string $link): ?string
    {
        $host = strtolower((string) parse_url($link, PHP_URL_HOST));
        if (! in_array($host, ['drive.google.com', 'www.drive.google.com'], true)) {
            return null;
        }

        $path = (string) parse_url($link, PHP_URL_PATH);
        if (preg_match('~/file/d/([A-Za-z0-9_-]{10,})~', $path, $matches)) {
            return $matches[1];
        }

        parse_str((string) parse_url($link, PHP_URL_QUERY), $query);
        $id = (string) ($query['id'] ?? '');

        return preg_match('/^[A-Za-z0-9_-]{10,}$/', $id) ? $id : null;
    }
}
