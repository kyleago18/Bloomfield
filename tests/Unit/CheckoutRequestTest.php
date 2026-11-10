<?php

namespace Tests\Unit;

use App\Http\Requests\CheckoutRequest;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class CheckoutRequestTest extends TestCase
{
    public function test_checkout_validation_allows_missing_customer_and_receiver_emails(): void
    {
        $rules = (new CheckoutRequest())->rules();
        $rules['cartItems.*.product_id'] = 'required|integer'; // Remove DB exists check for unit test

        $validator = Validator::make([
            'cartItems' => [[
                'product_id' => 1,
                'quantity' => 1,
                'price' => 1299,
            ]],
            'customer' => [
                'firstName' => 'Test',
                'lastName' => 'User',
                'contact' => '09171234567',
                'email' => '',
            ],
            'receiver' => [
                'firstName' => 'Recipient',
                'lastName' => 'User',
                'contact' => '09179876543',
                'email' => '',
            ],
            'deliveryMethod' => 'pickup',
            'address' => [],
            'deliveryLocation' => null,
            'schedule' => [
                'date' => now()->addDay()->toDateString(),
                'time' => '8:00 AM',
            ],
            'paymentMethod' => 'card',
            'specialRequests' => [
                'addOns' => [],
                'note' => '',
            ],
        ], $rules);

        $this->assertFalse($validator->fails(), $validator->errors()->toJson());
    }
}
