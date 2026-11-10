<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('middle_name')->nullable()->after('first_name');
            $table->string('last_name')->nullable()->after('middle_name');
            $table->string('suffix')->nullable()->after('last_name');
            $table->date('date_of_birth')->nullable()->after('suffix');
            $table->string('gender')->nullable()->after('date_of_birth');
            $table->string('mobile_number')->nullable()->after('email');
            $table->string('alternate_mobile_number')->nullable()->after('mobile_number');
            $table->string('provider')->nullable()->after('remember_token');
            $table->string('provider_id')->nullable()->after('provider');
            $table->string('avatar_url')->nullable()->after('provider_id');
            $table->boolean('terms_accepted')->default(false)->after('avatar_url');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'middle_name',
                'last_name',
                'suffix',
                'date_of_birth',
                'gender',
                'mobile_number',
                'alternate_mobile_number',
                'provider',
                'provider_id',
                'avatar_url',
                'terms_accepted',
            ]);
        });
    }
};
