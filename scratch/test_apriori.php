<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Services\RecommendationService;

$product = Product::find(1); // Valentina
if (!$product) {
    echo "Valentina product (ID 1) not found in the database. Trying first product...\n";
    $product = Product::first();
}

if (!$product) {
    echo "No products found at all!\n";
    exit(1);
}

echo "=== Target Product ===\n";
echo "ID: " . $product->product_id . "\n";
echo "Name: " . $product->flower_name . "\n";
echo "Is Addon: " . ($product->is_addon ? 'YES' : 'NO') . "\n";
echo "Seller ID: " . $product->seller_id . "\n\n";

$service = new RecommendationService();

echo "=== Frequently Bought Together (Apriori + Fallback) ===\n";
$fbt = $service->getFrequentlyBoughtTogether($product);
foreach ($fbt as $idx => $p) {
    echo ($idx + 1) . ". ID: " . $p['product_id'] . " | Name: " . $p['display_name'] . " | Price: ₱" . $p['price'] . " | Addon: " . ($p['is_addon'] ? 'YES' : 'NO') . "\n";
}

echo "\n=== Complete Your Gift (Add-ons) ===\n";
$cyg = $service->getCompleteYourGift($product);
foreach ($cyg as $idx => $p) {
    echo ($idx + 1) . ". ID: " . $p['product_id'] . " | Name: " . $p['display_name'] . " | Price: ₱" . $p['price'] . " | Addon: " . ($p['is_addon'] ? 'YES' : 'NO') . "\n";
}

echo "\nVerification complete!\n";
