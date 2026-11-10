<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\Product;

echo "=== CATEGORIES ===\n";
foreach (Category::all() as $cat) {
    $count = Product::where('category_id', $cat->id)->count();
    echo "ID: " . $cat->id . " | Name: " . $cat->name . " | Slug: " . $cat->slug . " | Products Count: " . $count . "\n";
}

echo "\n=== ALL PRODUCTS ===\n";
foreach (Product::all() as $p) {
    echo "ID: " . $p->product_id . " | Name: " . $p->flower_name . " | Category ID: " . $p->category_id . " | SKU: " . $p->sku . " | Price: " . $p->price . "\n";
}
