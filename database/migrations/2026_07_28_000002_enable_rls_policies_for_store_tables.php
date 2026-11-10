<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // 1. Enable RLS on products, sellers, orders, order_items
        DB::statement('ALTER TABLE products ENABLE ROW LEVEL SECURITY;');
        DB::statement('ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;');
        DB::statement('ALTER TABLE orders ENABLE ROW LEVEL SECURITY;');
        DB::statement('ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;');

        // 2. Drop any existing policies to prevent conflicts
        DB::statement('DROP POLICY IF EXISTS products_select_policy ON products;');
        DB::statement('DROP POLICY IF EXISTS products_insert_policy ON products;');
        DB::statement('DROP POLICY IF EXISTS products_update_policy ON products;');
        DB::statement('DROP POLICY IF EXISTS products_delete_policy ON products;');

        DB::statement('DROP POLICY IF EXISTS sellers_select_policy ON sellers;');
        DB::statement('DROP POLICY IF EXISTS sellers_update_policy ON sellers;');

        DB::statement('DROP POLICY IF EXISTS orders_select_policy ON orders;');
        DB::statement('DROP POLICY IF EXISTS orders_insert_policy ON orders;');

        DB::statement('DROP POLICY IF EXISTS order_items_select_policy ON order_items;');
        DB::statement('DROP POLICY IF EXISTS order_items_insert_policy ON order_items;');

        // 3. Create policies for products
        DB::statement("
            CREATE POLICY products_select_policy ON products
            FOR SELECT
            USING (
                (is_active = true AND deleted_at IS NULL)
                OR
                seller_id IN (SELECT id FROM sellers WHERE user_id::text = auth.uid()::text)
            );
        ");

        DB::statement("
            CREATE POLICY products_insert_policy ON products
            FOR INSERT
            WITH CHECK (
                seller_id IN (SELECT id FROM sellers WHERE user_id::text = auth.uid()::text)
                OR auth.role() = 'authenticated'
            );
        ");

        DB::statement("
            CREATE POLICY products_update_policy ON products
            FOR UPDATE
            USING (
                seller_id IN (SELECT id FROM sellers WHERE user_id::text = auth.uid()::text)
                OR auth.role() = 'authenticated'
            );
        ");

        DB::statement("
            CREATE POLICY products_delete_policy ON products
            FOR DELETE
            USING (
                seller_id IN (SELECT id FROM sellers WHERE user_id::text = auth.uid()::text)
                OR auth.role() = 'authenticated'
            );
        ");

        // 4. Create policies for sellers
        DB::statement("
            CREATE POLICY sellers_select_policy ON sellers
            FOR SELECT
            USING (true);
        ");

        DB::statement("
            CREATE POLICY sellers_update_policy ON sellers
            FOR UPDATE
            USING (user_id::text = auth.uid()::text OR auth.role() = 'authenticated');
        ");

        // 5. Create policies for orders & order_items
        DB::statement("
            CREATE POLICY orders_select_policy ON orders
            FOR SELECT
            USING (
                user_id::text = auth.uid()::text
                OR order_id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT product_id FROM products WHERE seller_id IN (SELECT id FROM sellers WHERE user_id::text = auth.uid()::text)))
                OR auth.role() = 'authenticated'
            );
        ");

        DB::statement("
            CREATE POLICY orders_insert_policy ON orders
            FOR INSERT
            WITH CHECK (
                user_id::text = auth.uid()::text
                OR auth.role() = 'authenticated'
            );
        ");

        DB::statement("
            CREATE POLICY order_items_select_policy ON order_items
            FOR SELECT
            USING (
                order_id IN (SELECT order_id FROM orders WHERE user_id::text = auth.uid()::text)
                OR product_id IN (SELECT product_id FROM products WHERE seller_id IN (SELECT id FROM sellers WHERE user_id::text = auth.uid()::text))
                OR auth.role() = 'authenticated'
            );
        ");

        DB::statement("
            CREATE POLICY order_items_insert_policy ON order_items
            FOR INSERT
            WITH CHECK (
                order_id IN (SELECT order_id FROM orders WHERE user_id::text = auth.uid()::text)
                OR auth.role() = 'authenticated'
            );
        ");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE products DISABLE ROW LEVEL SECURITY;');
        DB::statement('ALTER TABLE sellers DISABLE ROW LEVEL SECURITY;');
        DB::statement('ALTER TABLE orders DISABLE ROW LEVEL SECURITY;');
        DB::statement('ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;');
    }
};
