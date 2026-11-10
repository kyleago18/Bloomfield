<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Seller extends Model
{
    protected $fillable = [
        'user_id',
        'shop_name',
        'owner_name',
        'email',
        'phone_number',
        'address',
        'barangay',
        'city',
        'province',
        'postal_code',
        'latitude',
        'longitude',
        'shop_description',
        'shop_logo',
        'shop_banner',
        'is_verified',
        'status',
        'id_type',
        'id_photo_path',
        'business_permit_path',
        'storefront_photo_path',
        'bank_name',
        'bank_account_name',
        'bank_account_number',
        'rejection_reason',
        'verified_at',
        'monthly_target',
    ];

    protected $casts = [
        'latitude'    => 'decimal:7',
        'longitude'   => 'decimal:7',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'monthly_target' => 'float',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    protected static function booted(): void
    {
        static::creating(function (self $seller): void {
            if (empty($seller->id)) {
                $maxId = (int) self::selectRaw('MAX(CAST(id AS UNSIGNED)) as max_id')->value('max_id');
                $seller->id = (string) ($maxId ? ($maxId + 1) : 43697);
            }
        });
    }

    // Appended computed attributes
    // NOTE: average_rating and followers_count removed from $appends to prevent N+1 queries.
    // Load them explicitly via withCount/withAvg only where needed.
    protected $appends = ['shop_logo_url', 'shop_banner_url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isUnverified(): bool
    {
        return $this->status === 'unverified';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function follows(): HasMany
    {
        return $this->hasMany(SellerFollower::class, 'seller_id');
    }

    public function followers(): HasMany
    {
        return $this->hasMany(SellerFollower::class, 'seller_id');
    }

    public function getFollowersCountAttribute(): int
    {
        if (array_key_exists('followers_count', $this->attributes) && $this->attributes['followers_count'] !== null) {
            return (int) $this->attributes['followers_count'];
        }
        if (array_key_exists('follows_count', $this->attributes) && $this->attributes['follows_count'] !== null) {
            return (int) $this->attributes['follows_count'];
        }
        if ($this->relationLoaded('followers')) {
            return $this->followers->count();
        }
        return 0;
    }


    public function getShopLogoUrlAttribute(): ?string
    {
        if ($this->shop_logo) {
            if (\Illuminate\Support\Str::startsWith($this->shop_logo, 'images/')) {
                return asset($this->shop_logo);
            }
            if (\Illuminate\Support\Str::startsWith($this->shop_logo, 'http')) {
                return $this->shop_logo;
            }
            return asset('storage/' . $this->shop_logo);
        }
        return null;
    }

    public function getShopBannerUrlAttribute(): ?string
    {
        if ($this->shop_banner) {
            if (\Illuminate\Support\Str::startsWith($this->shop_banner, 'images/')) {
                return asset($this->shop_banner);
            }
            if (\Illuminate\Support\Str::startsWith($this->shop_banner, 'http')) {
                return $this->shop_banner;
            }
            return asset('storage/' . $this->shop_banner);
        }
        return null;
    }

    public function getLocationStringAttribute(): string
    {
        return implode(', ', array_filter([
            $this->barangay,
            $this->city,
            $this->province,
        ]));
    }
}
