<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class ForgotPasswordController extends Controller
{
    /**
     * Send a password-reset link to the given email. To avoid leaking which
     * emails have accounts, this endpoint always returns the same generic
     * 200 response regardless of whether the email exists. Real failures
     * (validation / throttling) are still surfaced as 422.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_THROTTLED) {
            throw ValidationException::withMessages([
                'email' => [__('passwords.throttled')],
            ]);
        }

        // Both RESET_LINK_SENT and INVALID_USER fall through to the generic
        // success response — by design, to prevent user enumeration.
        return response()->json([
            'status' => 'password-reset-link-sent',
            'message' => 'If an account exists for that email, a reset link has been sent.',
        ]);
    }
}
