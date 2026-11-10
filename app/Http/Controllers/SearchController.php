<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        $query      = $request->input('q', '');
        $categoryId = $request->input('category');
        $sort       = $request->input('sort', 'newest');
        $occasion   = $request->input('occasion');
        $flowerType = $request->input('flower_type');

        // Clamp page size: configurable via SEARCH_PAGE_SIZE env, never more than 48
        $pageSize = min((int) env('SEARCH_PAGE_SIZE', 24), 48);

        $sellerId = $request->user()?->seller?->id;

        // Enforce active scoping: only show products that are active, in stock,
        // and belong to an approved seller — prevents surfacing deleted/suspended items.
        $products = Product::search($query)->query(function ($builder) use ($categoryId, $occasion, $flowerType, $sort, $sellerId) {
            $builder->with([
                    'seller:id,shop_name,city,province,status,shop_logo,is_verified',
                    'category:id,name,slug'
                ])
                ->where('is_active', true)
                ->where('is_addon', false)
                ->whereHas('seller', fn($q) => $q->where('status', 'approved'))
                ->active()
                ->inStock()
                ->when($sellerId,   fn($q) => $q->where('products.seller_id', '!=', $sellerId))
                ->when($categoryId, fn($q) => $q->where('products.category_id', $categoryId))
                ->when($occasion,   fn($q) => $q->where('products.occasion', $occasion))
                ->when($flowerType, fn($q) => $q->where('products.flower_type', $flowerType))
                ->when(true, function ($q) use ($sort) {
                    match ($sort) {
                        'price_asc'    => $q->orderBy('products.price', 'asc'),
                        'price_desc'   => $q->orderBy('products.price', 'desc'),
                        'best_selling' => $q->orderByDesc('products.sales_count'), // Use the denormalized column!
                        default        => $q->orderByDesc('products.created_at'),
                    };
                    return $q;
                });
        })->paginate($pageSize);
        
        $products->getCollection()->each(function ($product) {
            $product->append(['display_name', 'effective_price', 'thumbnail_url']);
        });

        return Inertia::render('Search', [
            'products'   => $products,
            'categories' => \Illuminate\Support\Facades\Cache::rememberForever('active_categories', fn() => Category::where('is_active', true)->get()->toArray()),
            'filters'    => $request->only(['q', 'category', 'sort', 'occasion', 'flower_type']),
            'auth'       => $request->user() ? ['user' => $request->user()] : null,
        ]);
    }

    public function searchApi(Request $request)
    {
        $query = $request->input('q', '');

        if (trim($query) === '') {
            return response()->json([]);
        }

        $sellerId = $request->user()?->seller?->id;

        // Enforce active scoping: only show products that are active, in stock,
        // and belong to an approved seller — prevents surfacing deleted/suspended items.
        $products = Product::search($query)->query(function ($builder) use ($sellerId) {
            $builder->with([
                    'seller:id,shop_name,city,province,status,shop_logo,is_verified',
                    'category:id,name,slug'
                ])
                ->where('is_active', true)
                ->where('is_addon', false)
                ->whereHas('seller', fn($q) => $q->where('status', 'approved'))
                ->active()
                ->inStock()
                ->when($sellerId, fn($q) => $q->where('products.seller_id', '!=', $sellerId))
                ->latest('products.created_at');
        })
        ->take(50)
        ->get();

        $products->each(function ($product) {
            $product->append(['display_name', 'effective_price', 'thumbnail_url']);
        });

        return response()->json($products)
            ->header('X-Search-Debug-Keyword', $query)
            ->header('X-Search-Debug-Count', count($products));
    }
}
