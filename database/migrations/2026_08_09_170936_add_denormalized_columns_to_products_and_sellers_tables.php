<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->integer('reviews_count')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->integer('sales_count')->default(0);
        });

        Schema::table('sellers', function (Blueprint $table) {
            $table->integer('reviews_count')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->integer('sales_count')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['reviews_count', 'average_rating', 'sales_count']);
        });

        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn(['reviews_count', 'average_rating', 'sales_count']);
        });
    }
};
