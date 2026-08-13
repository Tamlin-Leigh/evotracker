<?php

namespace App\Http\Controllers;

use App\Models\Measurement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeasurementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $measurements = Measurement::where('user_id', $request->user()->id)
            ->orderByDesc('measured_at')
            ->get();

        return response()->json($measurements);
    }

    public function byPart(Request $request, string $part): JsonResponse
    {
        $measurements = Measurement::where('user_id', $request->user()->id)
            ->where('body_part', $part)
            ->orderBy('measured_at')
            ->get();

        return response()->json($measurements);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'body_part' => 'required|string',
            'value_cm'  => 'required|numeric',
        ]);

        $userId = $request->user()->id;
        $now    = now();

        $measurement = Measurement::where('user_id', $userId)
            ->where('body_part', $request->body_part)
            ->whereDate('measured_at', $now->toDateString())
            ->first();

        if ($measurement) {
            $measurement->update([
                'value_cm'    => $request->value_cm,
                'measured_at' => $now,
            ]);
        } else {
            $measurement = Measurement::create([
                'user_id'     => $userId,
                'body_part'   => $request->body_part,
                'value_cm'    => $request->value_cm,
                'measured_at' => $now,
            ]);
        }

        return response()->json(['id' => $measurement->id, 'message' => 'Measurement saved.'], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        Measurement::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->delete();

        return response()->json(['message' => 'Measurement deleted.']);
    }
}
