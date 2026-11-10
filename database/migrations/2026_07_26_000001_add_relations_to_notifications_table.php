<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->foreignId('order_id')->nullable()->constrained('orders', 'order_id')->nullOnDelete();
            $table->string('seller_id', 20)->nullable();
            $table->foreign('seller_id')->references('id')->on('sellers')->nullOnDelete();
        });

        // If the connection is PostgreSQL (Supabase), enable Row Level Security (RLS)
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;');
            DB::statement('DROP POLICY IF EXISTS user_notifications_policy ON notifications;');
            DB::statement('CREATE POLICY user_notifications_policy ON notifications FOR ALL USING (user_id::text = auth.uid()::text);');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP POLICY IF EXISTS user_notifications_policy ON notifications;');
            DB::statement('ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;');
        }

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropColumn('order_id');
            $table->dropForeign(['seller_id']);
            $table->dropColumn('seller_id');
        });
    }
};
