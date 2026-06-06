<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\JWT\IdTokenVerifier;
use Kreait\Firebase\JWT\Error\IdTokenVerificationFailed;
use Symfony\Component\HttpFoundation\Response;

class VerifyFirebaseToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        try {
            $verifier = IdTokenVerifier::createWithProjectId(config('firebase.project_id'));
            $verified = $verifier->verifyIdToken($token);
            $request->merge(['firebase_uid' => $verified->uid()]);
        } catch (IdTokenVerificationFailed $e) {
            return response()->json(['error' => 'Invalid token.'], 401);
        }

        return $next($request);
    }
}
