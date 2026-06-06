<?php

namespace App\Http\Controllers;

use App\Services\FirestoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private FirestoreService $firestore) {}

    public function show(Request $request): JsonResponse
    {
        $uid  = $request->firebase_uid;
        $data = $this->firestore->getDocument("users/{$uid}/profile/data");

        return $data
            ? response()->json($data)
            : response()->json(null, 404);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'height'    => 'nullable|numeric',
            'age'       => 'nullable|integer',
            'gender'    => 'nullable|string',
            'goal_note' => 'nullable|string|max:500',
        ]);

        $uid = $request->firebase_uid;
        $fields = array_filter([
            'height'     => $request->height,
            'age'        => $request->age,
            'gender'     => $request->gender,
            'goal_note'  => $request->goal_note,
            'updated_at' => now()->toDateTimeString(),
        ], fn($v) => !is_null($v));

        $this->firestore->setDocument("users/{$uid}/profile/data", $fields, true);

        return response()->json(['message' => 'Profile updated.']);
    }
}
