<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Auth\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    /**
     * Consume a signed verification link. The route is protected by the
     * `signed` middleware, so by the time we reach this method the
     * `expires` + `signature` query params have already been validated
     * against APP_KEY. We still match the URL hash against the user's
     * email hash to defend against URL tampering / id swapping.
     */
    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            abort(404, 'User not found.');
        }

        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            abort(403, 'Invalid verification link.');
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.', 'already_verified' => true]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email verified.', 'already_verified' => false]);
    }

    /**
     * Re-send the verification email for the currently authenticated user.
     * Throttling lives on the route definition.
     */
    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            abort(401);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 204);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification email sent.']);
    }
}
