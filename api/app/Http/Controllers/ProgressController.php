<?php

namespace App\Http\Controllers;

use App\Models\Measurement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function estimate(Request $request): JsonResponse
    {
        $grouped = Measurement::where('user_id', $request->user()->id)
            ->orderBy('measured_at')
            ->get()
            ->groupBy('body_part');

        $estimates = [];
        foreach ($grouped as $part => $entries) {
            if ($entries->count() < 2) {
                continue;
            }

            $values           = $entries->pluck('value_cm')->values();
            $count            = $values->count();
            $current          = $values->last();
            $avgMonthlyChange = round(($values->last() - $values->first()) / ($count - 1), 2);

            $estimates[$part] = [
                'current_cm'         => $current,
                'avg_monthly_change' => $avgMonthlyChange,
                'estimated_3mo_cm'   => round($current + ($avgMonthlyChange * 3), 1),
            ];
        }

        return response()->json($estimates);
    }
}
