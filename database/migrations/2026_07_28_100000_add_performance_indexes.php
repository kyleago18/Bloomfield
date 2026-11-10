<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Products
        Schema::table('products', function (Blueprint $table) {
            if (!$this->indexExists('products', 'products_seller_id_index')) {
                $table->index('seller_id', 'products_seller_id_index');
            }
            if (!$this->indexExists('products', 'products_is_active_index')) {
                $table->index('is_active', 'products_is_active_index');
            }
            if (!$this->indexExists('products', 'products_category_id_index')) {
                $table->index('category_id', 'products_category_id_index');
            }
            if (!$this->indexExists('products', 'products_deleted_at_index')) {
                $table->index('deleted_at', 'products_deleted_at_index');
            }
            if (!$this->indexExists('products', 'products_seller_active_deleted_index')) {
                $table->index(['seller_id', 'is_active', 'deleted_at'], 'products_seller_active_deleted_index');
            }
            if (!$this->indexExists('products', 'products_created_at_index')) {
                $table->index('created_at', 'products_created_at_index');
            }
        });

        // Orders
        Schema::table('orders', function (Blueprint $table) {
            if (!$this->indexExists('orders', 'orders_seller_id_index')) {
                $table->index('seller_id', 'orders_seller_id_index');
            }
            if (!$this->indexExists('orders', 'orders_user_id_index')) {
                $table->index('user_id', 'orders_user_id_index');
            }
            if (!$this->indexExists('orders', 'orders_order_status_index')) {
                $table->index('order_status', 'orders_order_status_index');
            }
            if (!$this->indexExists('orders', 'orders_seller_status_index')) {
                $table->index(['seller_id', 'order_status'], 'orders_seller_status_index');
            }
            if (!$this->indexExists('orders', 'orders_user_created_index')) {
                $table->index(['user_id', 'created_at'], 'orders_user_created_index');
            }
        });

        // Order Items
        Schema::table('order_items', function (Blueprint $table) {
            if (!$this->indexExists('order_items', 'order_items_order_id_index')) {
                $table->index('order_id', 'order_items_order_id_index');
            }
            if (!$this->indexExists('order_items', 'order_items_product_id_index')) {
                $table->index('product_id', 'order_items_product_id_index');
            }
        });

        // Notifications
        Schema::table('notifications', function (Blueprint $table) {
            if (!$this->indexExists('notifications', 'notifications_user_id_index')) {
                $table->index('user_id', 'notifications_user_id_index');
            }
            if (!$this->indexExists('notifications', 'notifications_user_read_index')) {
                $table->index(['user_id', 'read_at'], 'notifications_user_read_index');
            }
        });

        // Seller Follows
        Schema::table('seller_follows', function (Blueprint $table) {
            if (!$this->indexExists('seller_follows', 'seller_follows_seller_id_index')) {
                $table->index('seller_id', 'seller_follows_seller_id_index');
            }
            if (!$this->indexExists('seller_follows', 'seller_follows_user_id_index')) {
                $table->index('user_id', 'seller_follows_user_id_index');
            }
        });

        // Sellers
        Schema::table('sellers', function (Blueprint $table) {
            if (!$this->indexExists('sellers', 'sellers_user_id_index')) {
                $table->index('user_id', 'sellers_user_id_index');
            }
            if (!$this->indexExists('sellers', 'sellers_status_index')) {
                $table->index('status', 'sellers_status_index');
            }
        });


        // Reviews
        Schema::table('reviews', function (Blueprint $table) {
            if (!$this->indexExists('reviews', 'reviews_product_id_index')) {
                $table->index('product_id', 'reviews_product_id_index');
            }
        });

        // User Addresses
        Schema::table('user_addresses', function (Blueprint $table) {
            if (!$this->indexExists('user_addresses', 'user_addresses_user_id_index')) {
                $table->index('user_id', 'user_addresses_user_id_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndexIfExists('products_seller_id_index');
            $table->dropIndexIfExists('products_is_active_index');
            $table->dropIndexIfExists('products_category_id_index');
            $table->dropIndexIfExists('products_deleted_at_index');
            $table->dropIndexIfExists('products_seller_active_deleted_index');
            $table->dropIndexIfExists('products_created_at_index');
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndexIfExists('orders_seller_id_index');
            $table->dropIndexIfExists('orders_user_id_index');
            $table->dropIndexIfExists('orders_order_status_index');
            $table->dropIndexIfExists('orders_seller_status_index');
            $table->dropIndexIfExists('orders_user_created_index');
        });
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndexIfExists('order_items_order_id_index');
            $table->dropIndexIfExists('order_items_product_id_index');
        });
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndexIfExists('notifications_user_id_index');
            $table->dropIndexIfExists('notifications_user_read_index');
        });
        Schema::table('seller_follows', function (Blueprint $table) {
            $table->dropIndexIfExists('seller_follows_seller_id_index');
            $table->dropIndexIfExists('seller_follows_user_id_index');
        });
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropIndexIfExists('sellers_user_id_index');
            $table->dropIndexIfExists('sellers_status_index');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndexIfExists('reviews_product_id_index');
        });
        Schema::table('user_addresses', function (Blueprint $table) {
            $table->dropIndexIfExists('user_addresses_user_id_index');
        });
    }

    private function indexExists(string $table, string $index): bool
    {
        if (DB::getDriverName() === 'pgsql') {
            $result = DB::select(
                "SELECT indexname FROM pg_indexes WHERE tablename = ? AND indexname = ?",
                [$table, $index]
            );
            return count($result) > 0;
        }
        return false;
    }
};
