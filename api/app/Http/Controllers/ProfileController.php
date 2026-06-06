<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Kreait\Firebase\Contract\Firestore;

class ProfileController extends Controller
{
    public function __construct(protected Firestore $firestore) {}

    public function show(Request $request): JsonResponse
    {
        $uid = $request->firebase_uid;
        $doc = $this->firestore->database()
            ->collection('users')->document($uid)
            ->collection('profile')->document('data')
            ->snapshot();

        if (!$doc->exists()) {
            return response()->json(null, 404);
        }

        return response()->json($doc->data());
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'height' => 'nullable|numeric',
            'age'    => 'nullable|integer',
            'gender' => 'nullable|string',
            'goal_note' => 'nullable|string|max:500',
        ]);

        $uid = $request->firebase_uid;
        $this->firestore->database()
            ->collection('users')->document($uid)
            ->collection('profile')->document('data')
            ->set(array_filter([
                'height'    => $request->height,
                'age'       => $request->age,
                'gender'    => $request->gender,
                'goal_note' => $request->goal_note,
                'updated_at' => now()->toDateTimeString(),
            ], fn($v) => !is_null($v)), ['merge' => true]);

        return response()->json(['message' => 'Profile updated.']);
    }
}
