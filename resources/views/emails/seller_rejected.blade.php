<!DOCTYPE html>
<html>
<head>
    <title>Verification Update</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
    <h2>Hello {{ $seller->owner_name }},</h2>
    <p>Thank you for submitting your verification documents for <strong>{{ $seller->shop_name }}</strong>.</p>
    <p>Unfortunately, we could not approve your application at this time for the following reason:</p>
    <blockquote style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #d9534f; margin: 20px 0;">
        {{ $reason }}
    </blockquote>
    <p>Please log in to your account to review these details and submit updated documents.</p>
    <br>
    <p>Thank you,</p>
    <p>Bloom & Glow Administration</p>
</body>
</html>
