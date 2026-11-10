<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Payment;
use App\Models\OrderStatusHistory;

class Order extends Model
{
    protected $primaryKey = 'order_id';

    public const STATUS_PENDING = 'Pending';
    public const STATUS_CONFIRMED = 'Confirmed';
    public const STATUS_PREPARING = 'Preparing';
    public const STATUS_READY_FOR_PICKUP = 'Ready for Pickup';
    public const STATUS_OUT_FOR_DELIVERY = 'Out for Delivery';
    public const STATUS_DELIVERED = 'Delivered';
    public const STATUS_CANCELLED = 'Cancelled';

    protected $fillable = [
        'display_order_id',
        'user_id',
        'seller_id',
        'order_date',
        'total_amount',
        'order_status',
        'customer_first_name',
        'customer_last_name',
        'customer_contact',
        'customer_email',
        'receiver_first_name',
        'receiver_last_name',
        'receiver_contact',
        'receiver_email',
        'delivery_method',
        'payment_method',
        'payment_status',
        'stripe_payment_intent_id',
        'stripe_payment_status',
        'amount_paid',
        'paid_at',
        'scheduled_date',
        'scheduled_time',
        'special_requests',
        'estimated_delivery_at',
        'delivered_at',
        'delivery_latitude',
        'delivery_longitude',
        'delivery_location_updated_at',
        'deleted_by_buyer',
        'replacement_for_order_id',
    ];

    /**
     * Generate a unique 5-character alphanumeric display code.
     */
    public static function generateDisplayOrderId(): string
    {
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        do {
            $code = '';
            for ($i = 0; $i < 5; $i++) {
                $code .= $characters[random_int(0, strlen($characters) - 1)];
            }
        } while (\Illuminate\Support\Facades\DB::table('orders')->where('display_order_id', $code)->exists());

        return $code;
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (empty($order->display_order_id)) {
                $order->display_order_id = static::generateDisplayOrderId();
            }
        });
    }

    protected $casts = [
        'paid_at' => 'datetime',
        'scheduled_date' => 'date',
        'amount_paid' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'estimated_delivery_at' => 'datetime',
        'delivered_at' => 'datetime',
        'delivery_location_updated_at' => 'datetime',
        'delivery_latitude' => 'float',
        'delivery_longitude' => 'float',
    ];

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    public function delivery(): HasOne
    {
        return $this->hasOne(Delivery::class, 'order_id', 'order_id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'order_id', 'order_id');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class, 'order_id', 'order_id')->orderBy('created_at', 'desc');
    }

    public function replacementRequest(): HasOne
    {
        return $this->hasOne(ReplacementRequest::class, 'order_id', 'order_id');
    }

    public function replacementForOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'replacement_for_order_id', 'order_id');
    }
}
