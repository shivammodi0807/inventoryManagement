<?php

namespace App\Notifications\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

/**
 * Email-verification mail for SPA flows. The action link points at the
 * frontend `/verify-email/{id}/{hash}` page; the SPA forwards the signed
 * `expires` + `signature` query params to the backend verify endpoint
 * (which uses the `signed` middleware to validate them).
 */
class VerifyEmailNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verifyUrl = $this->verificationUrl($notifiable);
        $appName = config('app.name', 'Qollab');

        return (new MailMessage())
            ->subject("Verify your {$appName} email address")
            ->line("Thanks for signing up for {$appName}. Please confirm your email address by clicking the button below.")
            ->action('Verify Email', $verifyUrl)
            ->line('If you did not create an account, no further action is required.');
    }

    /**
     * Build a signed link to the backend verification route, then rewrite the
     * scheme + host so the user lands on the SPA. The signed query params are
     * preserved; the SPA replays them against the backend endpoint.
     */
    protected function verificationUrl(object $notifiable): string
    {
        $signed = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes((int) config('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');

        // Replace backend origin with frontend origin, keep path + query as-is.
        $parts = parse_url($signed);
        $query = $parts['query'] ?? '';

        // Backend route is /api/email/verify/{id}/{hash}; surface it on the SPA
        // as /verify-email/{id}/{hash}?expires=...&signature=...
        $path = preg_replace('#^/api/email/verify/#', '/verify-email/', $parts['path'] ?? '');

        return $frontendUrl . $path . ($query ? ('?' . $query) : '');
    }
}
