<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
    $pi = \Stripe\PaymentIntent::create([
        'amount' => 10000,
        'currency' => 'php',
        'automatic_payment_methods' => ['enabled' => true],
    ]);
    echo "Success: " . $pi->client_secret;
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
