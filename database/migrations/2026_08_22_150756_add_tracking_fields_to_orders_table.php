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
        Schema::table('orders', function (Blueprint $table) {
            $table->dateTime('estimated_delivery_at')->nullable()->after('scheduled_time');
            $table->dateTime('delivered_at')->nullable()->after('estimated_delivery_at');
            $table->decimal('delivery_latitude', 10, 8)->nullable()->after('delivered_at');
            $table->decimal('delivery_longitude', 11, 8)->nullable()->after('delivery_latitude');
            $table->dateTime('delivery_location_updated_at')->nullable()->after('delivery_longitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'estimated_delivery_at',
                'delivered_at',
                'delivery_latitude',
                'delivery_longitude',
                'delivery_location_updated_at'
            ]);
        });
    }
};
