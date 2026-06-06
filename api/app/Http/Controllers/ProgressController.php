<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Kreait\Firebase\Contract\Firestore;

class ProgressController extends Controller
{
    public function __construct(protected Firestore $firestore) {}

    public function estimate(Request $request): JsonResponse
    {
        $uid = $request->firebase_uid;
        $docs = $this->firestore->database()
            ->collection('users')->document($uid)
            ->collection('measurements')
            ->orderBy('measured_at', 'ASC')
            ->documents();

        $grouped = [];
        foreach ($docs as $doc) {
            if ($doc->exists()) {
                $data = $doc->data();
                $grouped[$data['body_part']][] = $data;
            }
        }

        $estimates = [];
        foreach ($grouped as $part => $entries) {
            if (count($entries) < 2) {
                continue;
            }

            $values = array_column($entries, 'value_cm');
            $current = end($values);
            $count = count($values);

            // Average monthly change across all recorded deltas
            $totalDelta = $values[$count - 1] - $values[0];
            $avgMonthlyChange = round($totalDelta / ($count - 1), 2);

            $estimates[$part] = [
                'current_cm'          => $current,
                'avg_monthly_change'  => $avgMonthlyChange,
                'estimated_3mo_cm'    => round($current + ($avgMonthlyChange * 3), 1),
            ];
        }

        return response()->json($estimates);
    }
}
