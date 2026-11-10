<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendOtpEmail extends Notification implements ShouldQueue
{
    use Queueable;

    public $otpCode;

    /**
     * Create a new notification instance.
     */
    public function __construct($otpCode)
    {
        $this->otpCode = $otpCode;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Verify Your Email Address')
                    ->greeting('Hello ' . $notifiable->name . ',')
                    ->line('Please use the following 6-digit code to verify your email address:')
                    ->line(new \Illuminate\Support\HtmlString('<div style="text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; background-color: #f3f4f6; border-radius: 8px; margin: 20px 0;">' . $this->otpCode . '</div>'))
                    ->line('This code will expire in 10 minutes.')
                    ->line('If you did not create an account, no further action is required.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
