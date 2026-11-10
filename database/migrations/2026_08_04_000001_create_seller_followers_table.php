<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('seller_followers')) {
            Schema::create('seller_followers', function (Blueprint $table) {
                $table->id();
                $table->string('seller_id', 20);
                $table->foreign('seller_id')->references('id')->on('sellers')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->nullable();
                $table->unique(['seller_id', 'user_id']);
            });

            // If seller_follows exists and has data, copy over to seller_followers
            if (Schema::hasTable('seller_follows')) {
                $follows = DB::table('seller_follows')->get(['seller_id', 'user_id', 'created_at', 'updated_at']);
                foreach ($follows as $follow) {
                    DB::table('seller_followers')->insertOrIgnore([
                        'seller_id'  => $follow->seller_id,
                        'user_id'    => $follow->user_id,
                        'created_at' => $follow->created_at,
                        'updated_at' => $follow->updated_at,
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_followers');
    }
};
