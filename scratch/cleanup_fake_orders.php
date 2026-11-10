<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Delivery;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

// The seeder created orders with:
// - order_status = 'Completed'
// - payment_method = 'Cash on Delivery'
// - delivery_method = 'delivery'
// - customer_contact = '09123456789'
// - receiver_contact = '09123456789'
// - delivery street_address = '123 Rizal St'
// These are the telltale signs of seeded orders.

// Count all orders first
$totalOrders = Order::count();
echo "Total orders in database: {$totalOrders}\n";

// Find seeded fake orders by the distinctive marker: receiver_contact = '09123456789' AND delivery address = '123 Rizal St'
$fakeOrders = Order::whereHas('delivery', function ($q) {
    $q->where('street_address', '123 Rizal St')
      ->where('city', 'Digos City');
})->where('customer_contact', '09123456789')
  ->where('receiver_contact', '09123456789')
  ->where('payment_method', 'Cash on Delivery')
  ->where('order_status', 'Completed')
  ->get();

$fakeCount = $fakeOrders->count();
echo "Fake seeded orders found: {$fakeCount}\n";

if ($fakeCount === 0) {
    // The seeder used OrderItem::query()->delete() and Order::query()->delete()
    // which means it wiped ALL existing orders before creating fake ones.
    // So all current orders in the DB are likely fake seeded orders.
    // Let's check by looking for orders with the seeder's pattern
    $allSeeded = Order::where('customer_contact', '09123456789')
        ->where('receiver_contact', '09123456789')
        ->where('payment_method', 'Cash on Delivery')
        ->where('order_status', 'Completed')
        ->get();
    
    $seededCount = $allSeeded->count();
    echo "Orders matching seeder pattern (no delivery check): {$seededCount}\n";
    
    if ($seededCount > 0) {
        $fakeOrders = $allSeeded;
        $fakeCount = $seededCount;
    }
}

if ($fakeCount === 0) {
    echo "No fake orders found. Checking if all orders might be fake...\n";
    // Show a sample of orders
    $sample = Order::take(5)->get(['order_id', 'user_id', 'seller_id', 'customer_contact', 'payment_method', 'order_status', 'created_at']);
    foreach ($sample as $o) {
        echo "  Order #{$o->order_id}: contact={$o->customer_contact}, method={$o->payment_method}, status={$o->order_status}, date={$o->created_at}\n";
    }
} else {
    echo "\nDeleting {$fakeCount} fake seeded orders...\n";
    
    $fakeOrderIds = $fakeOrders->pluck('order_id')->toArray();
    
    // Delete related records
    $deletedItems = OrderItem::whereIn('order_id', $fakeOrderIds)->delete();
    echo "  Deleted {$deletedItems} fake order items\n";
    
    $deletedPayments = Payment::whereIn('order_id', $fakeOrderIds)->delete();
    echo "  Deleted {$deletedPayments} fake payments\n";
    
    $deletedDeliveries = Delivery::whereIn('order_id', $fakeOrderIds)->delete();
    echo "  Deleted {$deletedDeliveries} fake deliveries\n";
    
    $deletedOrders = Order::whereIn('order_id', $fakeOrderIds)->delete();
    echo "  Deleted {$deletedOrders} fake orders\n";
    
    $remaining = Order::count();
    echo "\nRemaining orders: {$remaining}\n";
}

echo "\nDone!\n";
