<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;

$products = Product::all();
if ($products->count() === 0) {
    echo "No products found in database.\n";
}
foreach ($products as $p) {
    echo "ID: " . $p->product_id . " | Name: " . $p->flower_name . "\n";
    echo "  Raw Thumbnail: " . $p->thumbnail . "\n";
    echo "  Thumbnail URL: " . $p->thumbnail_url . "\n";
    $storagePath = storage_path('app/public/' . $p->thumbnail);
    echo "  File Exists in storage: " . (file_exists($storagePath) ? 'YES' : 'NO') . "\n";
    echo "  Resolved Path: " . $storagePath . "\n";
    echo "----------------------------------------\n";
}
