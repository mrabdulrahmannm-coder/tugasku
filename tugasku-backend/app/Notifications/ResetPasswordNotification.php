<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    /**
     * Token reset password milik pengguna.
     */
    public string $token;

    public function __construct(string $token)
    {
        $this->token = $token;
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Build representasi email notifikasi.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('Atur Ulang Password TugasKu')
            ->greeting('Halo ' . $notifiable->name . ',')
            ->line('Kami menerima permintaan untuk mengatur ulang password akun TugasKu kamu.')
            ->action('Atur Ulang Password', $url)
            ->line('Tautan ini berlaku selama 60 menit. Abaikan email ini bila kamu tidak memintanya.');
    }

    /**
     * Tautan reset menuju halaman SPA, bukan route backend.
     */
    protected function resetUrl(object $notifiable): string
    {
        return rtrim(config('app.frontend_url'), '/')
            . '/reset-password?token=' . urlencode($this->token)
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
    }
}