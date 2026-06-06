<?php

namespace App\Http\Controllers;

use App\Services\FirestoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function __construct(private FirestoreService $firestore) {}

    public function estimate(Request $request): JsonResponse
    {
        $uid  = $request->firebase_uid;
        $docs = $this->firestore->runQuery(
            "users/{$uid}",
            'measurements',
            [['field' => 'measured_at', 'direction' => 'ASCENDING']]
        );

        $grouped = [];
        foreach ($docs as $doc) {
            $grouped[$doc['body_part']][] = $doc;
        }

        $estimates = [];
        foreach ($grouped as $part => $entries) {
            if (count($entries) < 2) {
                continue;
            }

            $values          = array_column($entries, 'value_cm');
            $count           = count($values);
            $current         = end($values);
            $avgMonthlyChange = round(($values[$count - 1] - $values[0]) / ($count - 1), 2);

            $estimates[$part] = [
                'current_cm'         => $current,
                'avg_monthly_change' => $avgMonthlyChange,
                'estimated_3mo_cm'   => round($current + ($avgMonthlyChange * 3), 1),
            ];
        }

        return response()->json($estimates);
    }
}
