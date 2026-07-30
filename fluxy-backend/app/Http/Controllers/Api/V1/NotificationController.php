<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\FluxyNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $notifications = FluxyNotification::where('user_id', $request->user()->id)
            ->latest()
            ->limit(100)
            ->get();

        return $this->data($notifications);
    }

    public function read(Request $request, FluxyNotification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 404);
        $notification->update(['read_at' => now()]);

        return $this->data($notification);
    }

    public function readAll(Request $request): JsonResponse
    {
        FluxyNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->data(null);
    }
}
