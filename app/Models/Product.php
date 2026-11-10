<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

class Product extends Model
{
    use SoftDeletes, Searchable;

    protected $primaryKey = 'product_id';

    protected $fillable = [
        'seller_id',
        'category_id',
        'flower_name',
        'name',
        'description',
        'price',
        'discount_price',
        'stock',
        'sku',
        'thumbnail',
        'images',
        'flower_type',
        'occasion',
        'delivery_available',
        'pickup_available',
        'is_active',
        'is_featured',
        'is_flash_sale',
    ];

    protected $casts = [
        'price'              => 'decimal:2',
        'discount_price'     => 'decimal:2',
        'stock'              => 'integer',
        'is_active'          => 'boolean',
        'is_featured'        => 'boolean',
        'is_flash_sale'      => 'boolean',
        'delivery_available' => 'boolean',
        'pickup_available'   => 'boolean',
        'images'             => 'array',
    ];

    protected $appends = [
        'thumbnail_url',
        'image_url',
        // images_url removed from appends — only loaded on product detail page via append('images_url')
    ];

    protected static function booted(): void
    {
        static::creating(function (self $product): void {
            if ($product->getConnection()->getDriverName() !== 'pgsql') {
                return;
            }

            $product->getConnection()->statement(
                "SELECT setval(pg_get_serial_sequence('products', 'product_id'), COALESCE((SELECT MAX(product_id) FROM products), 0) + 1, false)"
            );
        });
    }

    // Computed display name — prefer 'name', fall back to 'flower_name'
    public function getDisplayNameAttribute(): string
    {
        return $this->name ?? $this->flower_name ?? 'Unnamed Product';
    }

    // Effective selling price (discounted if set)
    public function getEffectivePriceAttribute(): float
    {
        return (float) ($this->discount_price ?? $this->price);
    }

    // Primary thumbnail URL — optimized to avoid repeated file_exists() filesystem hits
    public function getThumbnailUrlAttribute(): string
    {
        if ($this->thumbnail) {
            if (\Illuminate\Support\Str::startsWith($this->thumbnail, 'http')) {
                return $this->thumbnail;
            }
            if (\Illuminate\Support\Str::startsWith($this->thumbnail, 'images/') || \Illuminate\Support\Str::startsWith($this->thumbnail, '/images/')) {
                return asset(ltrim($this->thumbnail, '/'));
            }
            // Check storage path (most uploads end up here)
            return asset('storage/' . $this->thumbnail);
        }

        // Fallback: deterministic image based on product_id (static array cached per request)
        $id = abs((int) ($this->product_id ?? 1));
        $images = self::fallbackImages();
        $index = ($id - 1) % count($images);
        return asset($images[$index]);
    }

    /**
     * Return the static fallback image list (cached in memory for the request lifetime).
     */
    private static function fallbackImages(): array
    {
        static $images = null;
        if ($images === null) {
            $images = [
                'images/1.jpg', 'images/2.jpg', 'images/3.jpg', 'images/4.jpg',
                'images/5.jpg', 'images/6.jpg', 'images/7.jpg', 'images/8.jpg',
                'images/9.jpg', 'images/10.jpg', 'images/11.jpg', 'images/12.jpg',
                'images/13.jpg', 'images/14.jpg', 'images/15.jpg', 'images/16.jpg',
                'images/colorful_carnation_rose_bouquet.png',
                'images/colorful_heart_shaped_wreath.png',
                'images/fathers_day_balloon_chocolate_bouquet.png',
                'images/ferrero_rocher_box_purple_ribbon.png',
                'images/large_pink_rose_bouquet.png',
                'images/money_bouquet_sunflower.png',
                'images/pink_lily_and_roses_bouquet.png',
                'images/pink_roses_chantelle_collection.png',
                'images/pink_roses_in_box.png',
                'images/podium_floral_arrangement_1.png',
                'images/podium_floral_arrangement_2.png',
                'images/red_roses_white_center_bouquet.png',
                'images/round_wreath_white_orange.png',
                'images/round_wreath_white_pink.png',
                'images/round_wreath_white_yellow_lilies.png',
                'images/two_pink_white_rose_bouquets.png',
                'images/white_carnations_close_up.png',
                'images/white_floral_cross.png',
                'images/white_lisianthus_bouquet_1.png',
                'images/white_lisianthus_bouquet_2.png',
                'images/white_peach_roses_gold_wrap.png',
                'images/white_wreath_pink_accents.png',
            ];
        }
        return $images;
    }

    public function getImageUrlAttribute(): string
    {
        return $this->getThumbnailUrlAttribute();
    }

    public function getImagesUrlAttribute(): array
    {
        if (!is_array($this->images)) {
            return [$this->getThumbnailUrlAttribute()];
        }

        return array_map(function ($img) {
            if (\Illuminate\Support\Str::startsWith($img, 'images/')) {
                return asset($img);
            }
            if (\Illuminate\Support\Str::startsWith($img, 'http')) {
                return $img;
            }
            return asset('storage/' . $img);
        }, $this->images);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id', 'product_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'product_id', 'product_id');
    }



    // Scopes
    public function scopeActive($query)
    {
        return $query->where('products.is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('products.is_featured', true);
    }

    public function scopeFlashSale($query)
    {
        return $query->where('products.is_flash_sale', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('products.stock', '>', 0);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('products.category_id', $categoryId);
    }

    public function scopeLowStock($query, $threshold = 5)
    {
        return $query->where('products.stock', '>', 0)->where('products.stock', '<=', $threshold);
    }

    /**
     * Get the indexable data array for the model.
     *
     * IMPORTANT: The Scout 'database' driver uses the keys of this array as
     * column names in SQL LIKE queries against the model's table. Every key
     * MUST correspond to an actual column on the `products` table. Including
     * relationship fields (e.g. shop_name, category_name) will generate
     * invalid SQL and silently return zero results.
     */
    public function toSearchableArray()
    {
        return [
            'name'        => $this->name,
            'flower_name' => $this->flower_name,
            'description' => $this->description,
            'occasion'    => $this->occasion,
        ];
    }
}
