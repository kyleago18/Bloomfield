<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class CartController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(function ($request, $next) {
                if ($request->user() && in_array($request->user()->role, ['admin', 'super_admin'])) {
                    return response()->json(['error' => 'Admins cannot use the cart functionality.'], 403);
                }
                return $next($request);
            }),
        ];
    }

    private function getCart(Request $request)
    {
        $userId = $request->user()?->id;
        $sessionId = $request->session()->getId();

        if ($userId) {
            $cart = Cart::firstOrCreate(['user_id' => $userId]);
        } else {
            $cart = Cart::firstOrCreate(['session_id' => $sessionId, 'user_id' => null]);
        }
        
        return $cart;
    }

    public function index(Request $request)
    {
        $cart = $this->getCart($request);
        $items = $cart->items()->with('product.seller')->get();
        
        // Format items similar to the old local storage structure
        $formattedItems = $items->map(function ($item) {
            $product = $item->product;
            if (!$product) return null;
            
            return [
                'id' => $item->id,
                'product_id' => $product->product_id,
                'seller_id' => $product->seller_id,
                'quantity' => $item->quantity,
                'price' => $product->effective_price,
                'name' => $product->display_name,
                'flower_name' => $product->flower_name,
                'stock' => $product->stock,
                'thumbnail_url' => $product->thumbnail_url,
            ];
        })->filter()->values();

        return response()->json($formattedItems);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,product_id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->getCart($request);
        $product = Product::findOrFail($request->product_id);
        
        // Prevent sellers from buying their own products (redundant backend check)
        $user = $request->user();
        if ($user && $user->seller && $user->seller->id === $product->seller_id) {
            return response()->json(['error' => 'You cannot add your own products to the cart.'], 403);
        }

        // Multi-vendor validation (only one shop per cart)
        $existingItem = $cart->items()->first();
        if ($existingItem && $existingItem->product && $existingItem->product->seller_id !== $product->seller_id) {
            return response()->json(['error' => 'You can only order from one shop at a time.'], 422);
        }

        $cartItem = $cart->items()->where('product_id', $product->product_id)->first();

        if ($cartItem) {
            if ($cartItem->quantity + $request->quantity > $product->stock) {
                return response()->json(['error' => "Cannot exceed available stock ({$product->stock})."], 422);
            }
            $cartItem->increment('quantity', $request->quantity);
        } else {
            if ($request->quantity > $product->stock) {
                return response()->json(['error' => "Cannot exceed available stock ({$product->stock})."], 422);
            }
            $cart->items()->create([
                'product_id' => $product->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        return $this->index($request);
    }

    public function update(Request $request, $productId)
    {
        $request->validate([
            'amount' => 'required|integer', // +1 or -1 etc
        ]);

        $cart = $this->getCart($request);
        $cartItem = $cart->items()->where('product_id', $productId)->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $request->amount;
            
            if ($newQuantity <= 0) {
                $cartItem->delete();
            } else {
                $product = $cartItem->product;
                if ($newQuantity > $product->stock) {
                    return response()->json(['error' => "Cannot exceed available stock ({$product->stock})."], 422);
                }
                $cartItem->update(['quantity' => $newQuantity]);
            }
        }

        return $this->index($request);
    }

    public function destroy(Request $request, $productId)
    {
        $cart = $this->getCart($request);
        $cart->items()->where('product_id', $productId)->delete();
        
        return $this->index($request);
    }
    
    public function clear(Request $request)
    {
        $cart = $this->getCart($request);
        $cart->items()->delete();
        
        return $this->index($request);
    }
}
