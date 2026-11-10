<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReplacementRequest extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'seller_id',
        'reason',
        'description',
        'evidence_images',
        'status',
        'rejection_reason',
        'replacement_order_id',
    ];

    protected $casts = [
        'evidence_images' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function replacementOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'replacement_order_id', 'order_id');
    }
}
