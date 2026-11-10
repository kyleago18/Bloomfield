<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('orders', 'display_order_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('display_order_id', 20)->nullable()->after('order_id');
            });
        }

        // Fast memory-based code generation and single batch UPDATE for existing orders
        $orderIds = DB::table('orders')->whereNull('display_order_id')->pluck('order_id')->toArray();
        if (!empty($orderIds)) {
            $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            $assigned = [];
            
            $existingCodes = DB::table('orders')->whereNotNull('display_order_id')->pluck('display_order_id')->toArray();
            foreach ($existingCodes as $c) {
                $assigned[$c] = true;
            }

            $updates = [];
            foreach ($orderIds as $id) {
                do {
                    $code = '';
                    for ($i = 0; $i < 5; $i++) {
                        $code .= $characters[random_int(0, strlen($characters) - 1)];
                    }
                } while (isset($assigned[$code]));

                $assigned[$code] = true;
                $updates[$id] = $code;
            }

            $cases = [];
            $params = [];
            foreach ($updates as $id => $code) {
                $cases[] = "WHEN order_id = ? THEN ?";
                $params[] = $id;
                $params[] = $code;
            }
            
            $caseSql = implode(' ', $cases);
            $inIds = implode(',', array_keys($updates));
            
            DB::update("UPDATE orders SET display_order_id = CASE $caseSql END WHERE order_id IN ($inIds)", $params);
        }

        try {
            DB::statement("CREATE UNIQUE INDEX IF NOT EXISTS orders_display_order_id_unique ON orders (display_order_id);");
        } catch (\Throwable $e) {
            // Index might already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            DB::statement("DROP INDEX IF EXISTS orders_display_order_id_unique;");
        } catch (\Throwable $e) {
        }

        if (Schema::hasColumn('orders', 'display_order_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('display_order_id');
            });
        }
    }
};
