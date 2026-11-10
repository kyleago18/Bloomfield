<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Notification;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $seller  = auth()->user()->seller;
        $query   = Product::where('seller_id', $seller->id)
            ->withTrashed()
            ->with('category')
            ->withCount('orderItems');

        // Filter by status
        if ($request->filled('status')) {
            match ($request->status) {
                'active'       => $query->whereNull('deleted_at')->where('is_active', true),
                'inactive'     => $query->whereNull('deleted_at')->where('is_active', false),
                'out_of_stock' => $query->whereNull('deleted_at')->where('stock', 0),
                'low_stock'    => $query->whereNull('deleted_at')->where('stock', '>', 0)->where('stock', '<=', 5),
                'archived'     => $query->whereNotNull('deleted_at'),
                default        => $query->whereNull('deleted_at'),
            };
        } else {
            $query->whereNull('deleted_at');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q
                ->where('flower_name', 'like', "%{$search}%")
                ->orWhere('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")
            );
        }

        $products = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Seller/Products/Index', [
            'products'   => $products,
            'categories' => Cache::rememberForever('active_categories', fn() => Category::where('is_active', true)->orderBy('sort_order')->get()->toArray()),
            'filters'    => $request->only(['status', 'search']),
            'seller'     => $seller,
        ]);
    }

    public function updateStock(Request $request, Product $product): RedirectResponse
    {
        Gate::authorize('update', $product);

        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $product->update(['stock' => $validated['stock']]);

        return back()->with('success', "Stock updated for \"{$product->flower_name}\" to {$validated['stock']}.");
    }

    public function create(): Response
    {
        return Inertia::render('Seller/Products/Create', [
            'categories' => Category::where('is_active', true)->orderBy('sort_order')->get()->values(),
            'seller'     => auth()->user()->seller,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $seller = auth()->user()->seller;
        if (!$seller) {
            return back()->with('error', 'Seller profile not found.');
        }

        Gate::authorize('create', Product::class);

        $validated = $this->validateProduct($request);

        // Handle thumbnail
        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('products/thumbnails', 'public');
        }

        // Handle gallery images
        $galleryPaths = [];
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $file) {
                $galleryPaths[] = $file->store('products/gallery', 'public');
            }
        }

        $productData = [
            'seller_id'          => $seller->id,
            'flower_name'        => $validated['flower_name'],
            'name'               => !empty($validated['name']) ? $validated['name'] : $validated['flower_name'],
            'description'        => !empty($validated['description']) ? $validated['description'] : null,
            'category_id'        => (!empty($validated['category_id']) && is_numeric($validated['category_id'])) ? (int) $validated['category_id'] : null,
            'price'              => (float) $validated['price'],
            'discount_price'     => (isset($validated['discount_price']) && $validated['discount_price'] !== '' && $validated['discount_price'] !== null) ? (float) $validated['discount_price'] : null,
            'stock'              => (int) ($validated['stock'] ?? 0),
            'sku'                => !empty($validated['sku']) ? $validated['sku'] : Str::upper(Str::random(8)),
            'flower_type'        => !empty($validated['flower_type']) ? $validated['flower_type'] : null,
            'occasion'           => !empty($validated['occasion']) ? $validated['occasion'] : null,
            'delivery_available' => filter_var($validated['delivery_available'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'pickup_available'   => filter_var($validated['pickup_available'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'is_active'          => filter_var($validated['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'is_featured'        => filter_var($validated['is_featured'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'is_flash_sale'      => filter_var($validated['is_flash_sale'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'thumbnail'          => $thumbnailPath,
            'images'             => $galleryPaths ?: null,
        ];

        $product = Product::create($productData);

        Cache::forget('active_categories');

        if ($request->input('redirect_to')) {
            return redirect($request->input('redirect_to'))
                ->with('success', "Product \"{$product->flower_name}\" created successfully.");
        }

        return redirect()->route('seller.products.index')
            ->with('success', "Product \"{$product->flower_name}\" created successfully.");
    }

    public function edit(Product $product): Response
    {
        Gate::authorize('update', $product);

        return Inertia::render('Seller/Products/Edit', [
            'product'    => $product->load('category'),
            'categories' => Category::where('is_active', true)->orderBy('sort_order')->get()->values(),
            'seller'     => auth()->user()->seller,
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        Gate::authorize('update', $product);

        $validated = $this->validateProduct($request, $product->product_id);

        $productData = [
            'flower_name'        => $validated['flower_name'],
            'name'               => !empty($validated['name']) ? $validated['name'] : $validated['flower_name'],
            'description'        => !empty($validated['description']) ? $validated['description'] : null,
            'category_id'        => (!empty($validated['category_id']) && is_numeric($validated['category_id'])) ? (int) $validated['category_id'] : null,
            'price'              => (float) $validated['price'],
            'discount_price'     => (isset($validated['discount_price']) && $validated['discount_price'] !== '' && $validated['discount_price'] !== null) ? (float) $validated['discount_price'] : null,
            'stock'              => (int) ($validated['stock'] ?? 0),
            'flower_type'        => !empty($validated['flower_type']) ? $validated['flower_type'] : null,
            'occasion'           => !empty($validated['occasion']) ? $validated['occasion'] : null,
            'delivery_available' => filter_var($validated['delivery_available'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'pickup_available'   => filter_var($validated['pickup_available'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'is_active'          => filter_var($validated['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'is_featured'        => filter_var($validated['is_featured'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'is_flash_sale'      => filter_var($validated['is_flash_sale'] ?? false, FILTER_VALIDATE_BOOLEAN),
        ];

        if (!empty($validated['sku'])) {
            $productData['sku'] = $validated['sku'];
        }

        // Handle thumbnail
        if ($request->hasFile('thumbnail')) {
            if ($product->thumbnail) Storage::disk('public')->delete($product->thumbnail);
            $productData['thumbnail'] = $request->file('thumbnail')->store('products/thumbnails', 'public');
        }

        // Handle gallery images
        if ($request->hasFile('gallery')) {
            $existing = $product->images ?? [];
            foreach ($request->file('gallery') as $file) {
                $existing[] = $file->store('products/gallery', 'public');
            }
            $productData['images'] = $existing;
        }

        $product->update($productData);
        Cache::forget('active_categories');

        return redirect()->route('seller.products.index')
            ->with('success', "Product \"{$product->flower_name}\" updated successfully.");
    }

    public function destroy(Product $product): RedirectResponse
    {
        Gate::authorize('delete', $product);
        $product->delete();
        return back()->with('success', "Product \"{$product->flower_name}\" archived successfully.");
    }

    public function restore(int $id): RedirectResponse
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        Gate::authorize('restore', $product);
        $product->restore();
        return back()->with('success', "Product \"{$product->flower_name}\" restored successfully.");
    }

    public function toggleActive(Product $product): RedirectResponse
    {
        Gate::authorize('update', $product);
        $product->update(['is_active' => !$product->is_active]);
        $status = $product->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Product \"{$product->flower_name}\" {$status}.");
    }

    public function duplicate(Product $product): RedirectResponse
    {
        Gate::authorize('create', Product::class);

        $newProduct = $product->replicate();
        $newProduct->flower_name = $product->flower_name . ' (Copy)';
        $newProduct->name        = ($product->name ?? $product->flower_name) . ' (Copy)';
        $newProduct->sku         = Str::upper(Str::random(8));
        $newProduct->is_active   = false;
        $newProduct->deleted_at  = null;
        $newProduct->save();

        return redirect()->route('seller.products.index')
            ->with('success', "Product \"{$newProduct->flower_name}\" duplicated.");
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private function validateProduct(Request $request, ?int $productId = null): array
    {
        $skuRule = 'nullable|string|max:100';
        if ($productId) {
            $skuRule .= '|unique:products,sku,' . $productId . ',product_id';
        } else {
            $skuRule .= '|unique:products,sku';
        }

        return $request->validate([
            'flower_name'        => 'required|string|max:255',
            'name'               => 'nullable|string|max:255',
            'description'        => 'nullable|string|max:5000',
            'category_id'        => 'nullable|exists:categories,id',
            'price'              => 'required|numeric|min:0',
            'discount_price'     => 'nullable|numeric|min:0|lt:price',
            'stock'              => 'required|integer|min:0',
            'sku'                => $skuRule,
            'flower_type'        => 'nullable|string|max:100',
            'occasion'           => 'nullable|string|max:100',
            'delivery_available' => 'boolean',
            'pickup_available'   => 'boolean',
            'is_active'          => 'boolean',
            'is_featured'        => 'boolean',
            'is_flash_sale'      => 'boolean',
            'thumbnail'          => 'nullable|image|max:3072',
            'gallery'            => 'nullable|array|max:10',
            'gallery.*'          => 'image|max:3072',
        ]);
    }
}
