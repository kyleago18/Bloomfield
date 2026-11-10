<?php

use App\Models\Product;

$sourceDir = storage_path('app/raw_images');
$destDir = public_path('images');

if (!is_dir($destDir)) {
    mkdir($destDir, 0777, true);
}

// Get the 1.jpg to 16.jpg files
$files = glob($sourceDir . '/*.jpg');

if (empty($files)) {
    echo "No .jpg files found in images directory.\n";
    exit;
}

$imagePaths = [];

foreach ($files as $file) {
    $basename = basename($file);
    $destPath = $destDir . DIRECTORY_SEPARATOR . $basename;
    
    // Copy the file
    copy($file, $destPath);
    
    // The relative path to store in DB
    $imagePaths[] = 'images/' . $basename;
}

// Now update all products to use these new images
$products = Product::all();
$count = 0;

foreach ($products as $index => $product) {
    // Pick an image sequentially or randomly. Let's just cycle through them.
    $imageIndex = $index % count($imagePaths);
    $product->thumbnail = $imagePaths[$imageIndex];
    $product->save();
    $count++;
}

echo "Copied " . count($imagePaths) . " images to public/images.\n";
echo "Updated " . $count . " products to use the new images.\n";
