<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Auth;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;
use Symfony\Component\HttpFoundation\Response;

class VerifyFirebaseToken
{
    public function __construct(protected Auth $auth) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        try {
            $verifiedToken = $this->auth->verifyIdToken($token);
            $request->merge(['firebase_uid' => $verifiedToken->claims()->get('sub')]);
        } catch (FailedToVerifyToken) {
            return response()->json(['error' => 'Invalid token.'], 401);
        }

        return $next($request);
    }
}
