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
            // Self-referencing foreign key for replacement orders
            $table->unsignedBigInteger('replacement_for_order_id')->nullable()->after('display_order_id');
            $table->foreign('replacement_for_order_id')->references('order_id')->on('orders')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['replacement_for_order_id']);
            $table->dropColumn('replacement_for_order_id');
        });
    }
};
