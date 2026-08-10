<?php

namespace App\Http\Controllers;

use App\Services\FirestoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeasurementController extends Controller
{
    public function __construct(private FirestoreService $firestore) {}

    public function index(Request $request): JsonResponse
    {
        $uid  = $request->firebase_uid;
        $docs = $this->firestore->runQuery(
            "users/{$uid}",
            'measurements',
            [['field' => 'measured_at', 'direction' => 'DESCENDING']]
        );

        return response()->json($docs);
    }

    public function byPart(Request $request, string $part): JsonResponse
    {
        $uid  = $request->firebase_uid;
        $docs = $this->firestore->runQuery(
            "users/{$uid}",
            'measurements',
            [['field' => 'measured_at', 'direction' => 'ASCENDING']],
            ['field' => 'body_part', 'op' => 'EQUAL', 'value' => $part]
        );

        return response()->json($docs);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'body_part' => 'required|string',
            'value_cm'  => 'required|numeric',
        ]);

        $uid   = $request->firebase_uid;
        $now   = now();
        $today = $now->toDateString();

        $existing = collect($this->firestore->runQuery(
            "users/{$uid}",
            'measurements',
            [],
            ['field' => 'body_part', 'op' => 'EQUAL', 'value' => $request->body_part]
        ))->first(fn ($doc) => str_starts_with($doc['measured_at'], $today));

        $data = [
            'body_part'   => $request->body_part,
            'value_cm'    => (float) $request->value_cm,
            'measured_at' => $now->toDateTimeString(),
        ];

        if ($existing) {
            $id = $existing['id'];
            $this->firestore->setDocument("users/{$uid}/measurements/{$id}", $data, merge: true);
        } else {
            $data['created_at'] = $now->toDateTimeString();
            $id = $this->firestore->addDocument("users/{$uid}/measurements", $data);
        }

        return response()->json(['id' => $id, 'message' => 'Measurement saved.'], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $uid = $request->firebase_uid;
        $this->firestore->deleteDocument("users/{$uid}/measurements/{$id}");

        return response()->json(['message' => 'Measurement deleted.']);
    }
}
