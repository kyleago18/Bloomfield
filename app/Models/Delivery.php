<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delivery extends Model
{
    protected $primaryKey = 'delivery_id';

    protected $fillable = [
        'order_id',
        'dropoff_latitude',
        'dropoff_longitude',
        'delivery_status',
        'delivery_fee',
        'region',
        'province',
        'city',
        'barangay',
        'street_address',
        'landmark'
    ];

    protected $appends = ['dropoff_address'];

    public function getDropoffAddressAttribute(): string
    {
        return implode(', ', array_filter([
            $this->street_address,
            $this->barangay,
            $this->city,
            $this->province
        ]));
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }
}
