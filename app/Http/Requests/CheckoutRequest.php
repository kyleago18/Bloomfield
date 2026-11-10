<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cartItems' => 'required|array|min:1|max:20',
            'cartItems.*.product_id' => 'required|integer|exists:products,product_id',
            'cartItems.*.quantity' => 'required|integer|min:1|max:99',
            // NOTE: cartItems.*.price is accepted but NOT used for order total.
            // The server recalculates all prices from the database in OrderService.
            'cartItems.*.price' => 'nullable|numeric|min:0',

            'customer.firstName' => 'required|string|max:255',
            'customer.lastName' => 'nullable|string|max:255',
            'customer.contact' => 'nullable|string|max:50',
            'customer.email' => 'nullable|email|max:255',

            'receiver.firstName' => 'nullable|string|max:255',
            'receiver.lastName' => 'nullable|string|max:255',
            'receiver.contact' => 'nullable|string|max:50',
            'receiver.email' => 'nullable|email|max:255',

            'deliveryMethod' => 'required|in:delivery,pickup',
            'address.region' => 'required_if:deliveryMethod,delivery|nullable|string|max:255',
            'address.province' => 'required_if:deliveryMethod,delivery|nullable|string|max:255',
            'address.city' => 'required_if:deliveryMethod,delivery|nullable|string|max:255',
            'address.barangay' => 'required_if:deliveryMethod,delivery|nullable|string|max:255',
            'address.street' => 'required_if:deliveryMethod,delivery|nullable|string|max:500',
            'address.landmark' => 'nullable|string|max:1000',

            'deliveryLocation' => 'nullable|array',
            'deliveryLocation.lat' => 'required_if:deliveryMethod,delivery|nullable|numeric|between:-90,90',
            'deliveryLocation.lng' => 'required_if:deliveryMethod,delivery|nullable|numeric|between:-180,180',

            'schedule.date' => 'required|date|after_or_equal:today',
            'schedule.time' => 'required|string|max:50|not_in:Select Time,',
            'paymentMethod' => 'required|in:cod,credit_card,debit_card,gcash,card,stripe,online_payment',
            'shippingFee' => 'required|numeric|min:0',

            'specialRequests.addOns' => 'nullable|array',
            'specialRequests.note' => 'nullable|string|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'paymentMethod.in' => 'Please select a valid payment method.',
            'schedule.date.required' => 'Please select a delivery or pickup date.',
            'schedule.time.required' => 'Please select a time slot.',
            'schedule.time.not_in' => 'Please select a time slot.',
        ];
    }
}
