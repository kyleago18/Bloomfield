<?php

namespace App\Observers;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Seller;

class OrderItemObserver
{
    public function created(OrderItem $orderItem): void
    {
        if ($orderItem->product_id) {
            Product::where('product_id', $orderItem->product_id)->increment('sales_count', (int) $orderItem->quantity);
            
            $product = Product::find($orderItem->product_id);
            if ($product && $product->seller_id) {
                Seller::where('id', $product->seller_id)->increment('sales_count', (int) $orderItem->quantity);
            }
        }
    }
}
