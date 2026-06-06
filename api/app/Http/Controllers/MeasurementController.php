<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Kreait\Firebase\Contract\Firestore;

class MeasurementController extends Controller
{
    public function __construct(protected Firestore $firestore) {}

    public function index(Request $request): JsonResponse
    {
        $uid = $request->firebase_uid;
        $docs = $this->firestore->database()
            ->collection('users')->document($uid)
            ->collection('measurements')
            ->orderBy('measured_at', 'DESC')
            ->documents();

        $measurements = [];
        foreach ($docs as $doc) {
            if ($doc->exists()) {
                $measurements[] = array_merge(['id' => $doc->id()], $doc->data());
            }
        }

        return response()->json($measurements);
    }

    public function byPart(Request $request, string $part): JsonResponse
    {
        $uid = $request->firebase_uid;
        $docs = $this->firestore->database()
            ->collection('users')->document($uid)
            ->collection('measurements')
            ->where('body_part', '=', $part)
            ->orderBy('measured_at', 'ASC')
            ->documents();

        $measurements = [];
        foreach ($docs as $doc) {
            if ($doc->exists()) {
                $measurements[] = array_merge(['id' => $doc->id()], $doc->data());
            }
        }

        return response()->json($measurements);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'body_part'   => 'required|string',
            'value_cm'    => 'required|numeric',
            'measured_at' => 'required|date',
        ]);

        $uid = $request->firebase_uid;
        $ref = $this->firestore->database()
            ->collection('users')->document($uid)
            ->collection('measurements')
            ->add([
                'body_part'   => $request->body_part,
                'value_cm'    => (float) $request->value_cm,
                'measured_at' => $request->measured_at,
                'created_at'  => now()->toDateTimeString(),
            ]);

        return response()->json(['id' => $ref->id(), 'message' => 'Measurement saved.'], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $uid = $request->firebase_uid;
        $this->firestore->database()
            ->collection('users')->document($uid)
            ->collection('measurements')->document($id)
            ->delete();

        return response()->json(['message' => 'Measurement deleted.']);
    }
}
