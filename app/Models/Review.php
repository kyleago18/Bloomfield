<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    protected $fillable = [
        'user_id', 'product_id', 'order_id', 'rating',
        'comment', 'photos', 'seller_reply', 'seller_replied_at', 'is_verified_purchase',
    ];

    protected $casts = [
        'photos' => 'array',
        'seller_replied_at' => 'datetime',
        'is_verified_purchase' => 'boolean',
        'rating' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $review): void {
            if ($review->getConnection()->getDriverName() !== 'pgsql') {
                return;
            }

            $review->getConnection()->statement(
                "SELECT setval(pg_get_serial_sequence('reviews', 'id'), COALESCE((SELECT MAX(id) FROM reviews), 0) + 1, false)"
            );
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }
}
