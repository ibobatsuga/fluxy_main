<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Services\Meta\MetaAssetSyncService;
use Illuminate\Console\Command;

class SyncMetaAssets extends Command
{
    protected $signature = 'meta:sync-assets {tenant : Tenant ID or slug}';

    protected $description = 'Import assigned Facebook, Instagram, and WhatsApp assets from Meta Business';

    public function handle(MetaAssetSyncService $sync): int
    {
        $identifier = (string) $this->argument('tenant');
        $tenant = Tenant::query()
            ->where('id', $identifier)
            ->orWhere('slug', $identifier)
            ->first();

        if (! $tenant) {
            $this->error('Tenant tidak ditemukan. Gunakan ID atau slug tenant.');

            return self::FAILURE;
        }

        try {
            $result = $sync->sync($tenant);
        } catch (\Throwable $exception) {
            report($exception);
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->table(['Facebook', 'Instagram', 'WhatsApp'], [[
            $result['facebook_accounts'],
            $result['instagram_accounts'],
            $result['whatsapp_numbers'],
        ]]);

        return self::SUCCESS;
    }
}
