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
        Schema::table('sellers', function (Blueprint $table) {
            $table->string('id_type')->nullable()->after('status');
            $table->string('id_photo_path')->nullable()->after('id_type');
            $table->string('business_permit_path')->nullable()->after('id_photo_path');
            $table->string('storefront_photo_path')->nullable()->after('business_permit_path');
            $table->string('bank_name')->nullable()->after('storefront_photo_path');
            $table->string('bank_account_name')->nullable()->after('bank_name');
            $table->string('bank_account_number')->nullable()->after('bank_account_name');
            $table->text('rejection_reason')->nullable()->after('bank_account_number');
            $table->timestamp('verified_at')->nullable()->after('rejection_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn([
                'id_type',
                'id_photo_path',
                'business_permit_path',
                'storefront_photo_path',
                'bank_name',
                'bank_account_name',
                'bank_account_number',
                'rejection_reason',
                'verified_at'
            ]);
        });
    }
};
