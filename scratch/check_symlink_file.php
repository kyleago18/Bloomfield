<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$publicPath = public_path('storage/products/thumbnails/3NT7Lc91g6sFQQ2quDqjdLxt8SosQN81NdEgSxq3.jpg');
echo "Public Path: " . $publicPath . "\n";
echo "File Exists via Public Path: " . (file_exists($publicPath) ? 'YES' : 'NO') . "\n";
echo "Is Readable: " . (is_readable($publicPath) ? 'YES' : 'NO') . "\n";
