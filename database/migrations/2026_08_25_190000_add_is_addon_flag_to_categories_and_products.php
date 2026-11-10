<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->boolean('is_addon')->default(false)->after('is_active');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_addon')->default(false)->after('is_featured');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('is_addon');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('is_addon');
        });
    }
};
