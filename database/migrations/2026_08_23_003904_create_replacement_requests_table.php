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
        Schema::create('replacement_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders', 'order_id')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('seller_id', 20);
            $table->foreign('seller_id')->references('id')->on('sellers')->onDelete('cascade');
            
            $table->string('reason');
            $table->text('description')->nullable();
            $table->json('evidence_images')->nullable();
            
            $table->string('status')->default('Replacement Requested'); 
            // e.g., 'Replacement Requested', 'Under Review', 'Replacement Approved', 'Replacement Rejected'
            
            $table->text('rejection_reason')->nullable();
            
            $table->unsignedBigInteger('replacement_order_id')->nullable();
            $table->foreign('replacement_order_id')->references('order_id')->on('orders')->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('replacement_requests');
    }
};
