<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seller_follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('seller_id', 20);
            $table->foreign('seller_id')->references('id')->on('sellers')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'seller_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_follows');
    }
};
