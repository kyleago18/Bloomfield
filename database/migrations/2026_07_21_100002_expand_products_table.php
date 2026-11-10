<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name')->nullable(); // alias for flower_name, for new product forms
            $table->string('sku')->nullable()->unique();
            $table->decimal('discount_price', 8, 2)->nullable();
            $table->string('thumbnail')->nullable();
            $table->json('images')->nullable(); // gallery
            $table->string('flower_type')->nullable();
            $table->string('occasion')->nullable();
            $table->boolean('delivery_available')->default(true);
            $table->boolean('pickup_available')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'category_id', 'name', 'sku', 'discount_price', 'thumbnail',
                'images', 'flower_type', 'occasion', 'delivery_available',
                'pickup_available', 'is_featured', 'deleted_at'
            ]);
        });
    }
};
