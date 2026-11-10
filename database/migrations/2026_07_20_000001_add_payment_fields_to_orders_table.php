<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_status')->default('Pending Payment')->after('payment_method');
            $table->string('stripe_payment_intent_id')->nullable()->after('payment_status');
            $table->string('stripe_payment_status')->nullable()->after('stripe_payment_intent_id');
            $table->decimal('amount_paid', 10, 2)->nullable()->after('stripe_payment_status');
            $table->timestamp('paid_at')->nullable()->after('amount_paid');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_status',
                'stripe_payment_intent_id',
                'stripe_payment_status',
                'amount_paid',
                'paid_at',
            ]);
        });
    }
};
