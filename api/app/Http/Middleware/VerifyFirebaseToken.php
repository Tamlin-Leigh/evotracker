<?php

namespace App\Http\Middleware;

use Beste\Clock\SystemClock;
use Closure;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Kreait\Firebase\JWT\Action\FetchGooglePublicKeys\WithGuzzle;
use Kreait\Firebase\JWT\Action\VerifyIdToken\WithLcobucciJWT;
use Kreait\Firebase\JWT\Error\IdTokenVerificationFailed;
use Kreait\Firebase\JWT\GooglePublicKeys;
use Kreait\Firebase\JWT\IdTokenVerifier;
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
            $verifier = $this->buildVerifier();
            $verified  = $verifier->verifyIdToken($token);
            $request->merge(['firebase_uid' => $verified->payload()['sub']]);
        } catch (IdTokenVerificationFailed $e) {
            return response()->json(['error' => 'Invalid token.'], 401);
        }

        return $next($request);
    }

    private function buildVerifier(): IdTokenVerifier
    {
        $clock  = SystemClock::create();
        $caFile = ini_get('curl.cainfo') ?: true;

        $guzzle     = new Client(['http_errors' => false, 'verify' => $caFile]);
        $keyHandler = new WithGuzzle($guzzle, $clock);
        $keys       = new GooglePublicKeys($keyHandler, $clock);
        $handler    = new WithLcobucciJWT(config('firebase.project_id'), $keys, $clock);

        return new IdTokenVerifier($handler);
    }
}
