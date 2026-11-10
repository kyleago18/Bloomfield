<?php

use App\Models\Product;

$files = glob(public_path('images/*.png'));
if (empty($files)) {
    echo "No images found in public/images.\n";
    exit;
}

$imagePaths = array_map(function($file) {
    return 'images/' . basename($file);
}, $files);

// Update the products I just inserted to use the new path format
$products = Product::where('thumbnail', 'like', 'products/%')->get();
foreach ($products as $product) {
    $filename = basename($product->thumbnail);
    $product->thumbnail = 'images/' . $filename;
    $product->save();
}
echo "Updated " . $products->count() . " products to use direct images/ path.\n";

// Update any existing products (seeded) that don't have a thumbnail
$seededProducts = Product::whereNull('thumbnail')->get();
foreach ($seededProducts as $product) {
    // Pick a random image
    $product->thumbnail = $imagePaths[array_rand($imagePaths)];
    $product->save();
}
echo "Assigned images to " . $seededProducts->count() . " seeded products.\n";

