<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$request = Illuminate\Http\Request::create('/checkout/payment-intent', 'POST', [], [], [], ['HTTP_X-Requested-With' => 'XMLHttpRequest', 'HTTP_ACCEPT' => 'application/json']);
$user = App\Models\User::where('role', 'customer')->first();
Auth::login($user);
$response = app()->handle($request);
echo $response->getStatusCode() . PHP_EOL;
echo substr($response->getContent(), 0, 100);
