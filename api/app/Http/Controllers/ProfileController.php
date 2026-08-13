<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = Profile::where('user_id', $request->user()->id)->first();

        if (!$profile) {
            return response()->json(null, 404);
        }

        $photo = $profile->currentPhoto();

        return response()->json([
            ...$profile->toArray(),
            'photo_url' => $photo ? Storage::disk($photo->disk)->url($photo->path) : null,
        ]);
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

    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|max:2048',
        ]);

        $profile = Profile::firstOrCreate(['user_id' => $request->user()->id]);

        $file = $request->file('photo');
        $path = $file->store('profile-photos', 'public');

        $photo = Photo::create([
            'disk' => 'public',
            'path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        DB::table('profile_photo')->where('profile_id', $profile->id)->update(['is_current' => false]);
        $profile->photos()->attach($photo->id, ['is_current' => true]);

        return response()->json([
            'message' => 'Photo uploaded.',
            'photo_url' => Storage::disk('public')->url($path),
        ]);
    }

    public function deletePhoto(Request $request): JsonResponse
    {
        $profile = Profile::where('user_id', $request->user()->id)->first();
        $photo = $profile?->currentPhoto();

        if ($photo) {
            Storage::disk($photo->disk)->delete($photo->path);
            $photo->delete();
        }

        return response()->json(['message' => 'Photo removed.']);
    }
}
