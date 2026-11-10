<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_first_name')->nullable()->after('seller_id');
            $table->string('customer_last_name')->nullable()->after('customer_first_name');
            $table->string('customer_contact')->nullable()->after('customer_last_name');
            $table->string('customer_email')->nullable()->after('customer_contact');
            $table->string('receiver_first_name')->nullable()->after('customer_email');
            $table->string('receiver_last_name')->nullable()->after('receiver_first_name');
            $table->string('receiver_contact')->nullable()->after('receiver_last_name');
            $table->string('receiver_email')->nullable()->after('receiver_contact');
            $table->string('delivery_method')->default('delivery')->after('receiver_email');
            $table->string('payment_method')->default('GCash')->after('delivery_method');
            $table->date('scheduled_date')->nullable()->after('payment_method');
            $table->string('scheduled_time')->nullable()->after('scheduled_date');
            $table->text('special_requests')->nullable()->after('scheduled_time');
        });

        Schema::table('deliveries', function (Blueprint $table) {
            $table->string('region')->nullable()->after('dropoff_longitude');
            $table->string('province')->nullable()->after('region');
            $table->string('city')->nullable()->after('province');
            $table->string('barangay')->nullable()->after('city');
            $table->string('street_address')->nullable()->after('barangay');
            $table->text('landmark')->nullable()->after('street_address');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'customer_first_name', 'customer_last_name', 'customer_contact', 'customer_email',
                'receiver_first_name', 'receiver_last_name', 'receiver_contact', 'receiver_email',
                'delivery_method', 'payment_method', 'scheduled_date', 'scheduled_time', 'special_requests',
            ]);
        });

        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropColumn(['region', 'province', 'city', 'barangay', 'street_address', 'landmark']);
        });
    }
};
