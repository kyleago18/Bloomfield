<?php

use App\Models\Product;
use App\Models\Seller;
use App\Models\Category;
use Illuminate\Support\Str;

$files = glob(storage_path('app/public/products/*.png'));
$sellers = Seller::all();
if ($sellers->isEmpty()) {
    echo "No sellers found.\n";
    exit;
}

$categoryId = null;
$category = Category::first();
if ($category) {
    $categoryId = $category->id;
}

$count = 0;

foreach ($files as $file) {
    $filename = basename($file);
    $name = Str::title(str_replace('_', ' ', pathinfo($filename, PATHINFO_FILENAME)));
    
    // Pick a random seller
    $seller = $sellers->random();
    
    // Check if a product with this thumbnail already exists
    $thumbnailPath = 'products/' . $filename;
    
    $exists = Product::where('thumbnail', $thumbnailPath)->exists();
    
    if (!$exists) {
        Product::create([
            'seller_id' => $seller->id,
            'category_id' => $categoryId,
            'flower_name' => $name,
            'name' => $name,
            'description' => 'Beautiful ' . $name . ' expertly arranged for your special occasions.',
            'price' => rand(500, 3500) + 0.99,
            'stock' => rand(5, 50),
            'thumbnail' => $thumbnailPath,
            'is_active' => true,
            'is_featured' => rand(0, 1) === 1,
        ]);
        $count++;
    }
}

echo "Inserted $count products.\n";
