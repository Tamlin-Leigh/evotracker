<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = Profile::where('user_id', $request->user()->id)->first();

        return $profile
            ? response()->json($profile)
            : response()->json(null, 404);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => 'nullable|string|max:100',
            'last_name'  => 'nullable|string|max:100',
            'age'        => 'nullable|integer',
            'height'     => 'nullable|numeric',
            'weight'     => 'nullable|numeric',
            'gender'     => 'nullable|string',
            'goal_note'  => 'nullable|string|max:500',
        ]);

        $fields = array_filter(
            $request->only(['first_name', 'last_name', 'age', 'height', 'weight', 'gender', 'goal_note']),
            fn ($v) => !is_null($v)
        );

        Profile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $fields
        );

        return response()->json(['message' => 'Profile updated.']);
    }
}
