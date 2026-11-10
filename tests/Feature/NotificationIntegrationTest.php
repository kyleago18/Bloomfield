<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Seller;
use App\Models\User;
use App\Jobs\ProcessOrderNotifications;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_follow_and_unfollow_notifications(): void
    {
        $followerUser = User::factory()->create(['name' => 'Follower John', 'role' => 'customer']);
        $sellerUser = User::factory()->create(['name' => 'Seller Jane', 'role' => 'vendor_admin']);
        
        $seller = Seller::create([
            'user_id'     => $sellerUser->id,
            'shop_name'   => 'Test Blossom Shop',
            'owner_name'  => $sellerUser->name,
            'email'       => $sellerUser->email,
            'status'      => 'approved',
            'is_verified' => true,
        ]);

        // 1. Follow action
        $response = $this->actingAs($followerUser)->post(route('shop.follow', $seller->id));
        $response->assertJson(['following' => true]);

        // Verify notification was created for the seller
        $this->assertDatabaseHas('notifications', [
            'user_id' => $sellerUser->id,
            'type'    => 'new_follower',
            'seller_id' => $seller->id,
        ]);

        $notification = Notification::where('user_id', $sellerUser->id)->first();
        $this->assertStringContainsString('Follower John started following your shop.', $notification->body);
        $this->assertEquals($followerUser->id, $notification->data['follower_id']);

        // 2. Prevent duplicate notifications on retry
        // (Simulate sending same follow action, though controller handles toggle. Let's make sure the check prevents duplication)
        $this->actingAs($followerUser)->post(route('shop.follow', $seller->id)); // Unfollows
        $this->actingAs($followerUser)->post(route('shop.follow', $seller->id)); // Follows again

        $notificationsCount = Notification::where('user_id', $sellerUser->id)
            ->where('type', 'new_follower')
            ->count();
        $this->assertEquals(1, $notificationsCount);

        // 3. Unfollow action
        $response = $this->actingAs($followerUser)->post(route('shop.follow', $seller->id));
        $response->assertJson(['following' => false]);

        // Verify notification was deleted
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $sellerUser->id,
            'type'    => 'new_follower',
        ]);
    }

    public function test_order_placement_notifications_and_duplicate_protection(): void
    {
        $buyer = User::factory()->create(['name' => 'Buyer John', 'role' => 'customer']);
        $sellerUser = User::factory()->create(['name' => 'Seller Jane', 'role' => 'vendor_admin']);
        
        $seller = Seller::create([
            'user_id'     => $sellerUser->id,
            'shop_name'   => 'Test Blossom Shop',
            'owner_name'  => $sellerUser->name,
            'email'       => $sellerUser->email,
            'status'      => 'approved',
            'is_verified' => true,
        ]);

        $order = Order::create([
            'display_order_id' => '2026-TEST-ORDER',
            'user_id' => $buyer->id,
            'seller_id' => $seller->id,
            'total_amount' => 1500.00,
            'order_status' => 'Pending',
            'customer_first_name' => 'Buyer',
            'customer_last_name' => 'John',
            'customer_contact' => '09123456789',
            'customer_email' => 'buyer@test.com',
            'receiver_first_name' => 'Buyer',
            'receiver_last_name' => 'John',
            'receiver_contact' => '09123456789',
            'receiver_email' => 'buyer@test.com',
            'delivery_method' => 'delivery',
            'payment_method' => 'Cash on Delivery',
            'payment_status' => 'Pending Payment',
            'scheduled_date' => now()->toDateString(),
            'scheduled_time' => '10:00 AM',
        ]);

        // Dispatch ProcessOrderNotifications job
        $cartItems = [
            [
                'product_id' => 1,
                'quantity' => 1,
            ]
        ];

        $customer = [
            'firstName' => 'Buyer',
            'lastName' => 'John',
        ];

        // First Run
        ProcessOrderNotifications::dispatchSync(
            $buyer->id,
            $seller->id,
            $order->order_id,
            $order->display_order_id,
            1500.00,
            $cartItems,
            $customer,
            'Cash on Delivery'
        );

        // Verify notifications exist
        $this->assertDatabaseHas('notifications', [
            'user_id' => $buyer->id,
            'type' => 'order_placed',
            'order_id' => $order->order_id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $sellerUser->id,
            'type' => 'new_order',
            'order_id' => $order->order_id,
        ]);

        // Second Run (Job Retried)
        ProcessOrderNotifications::dispatchSync(
            $buyer->id,
            $seller->id,
            $order->order_id,
            $order->display_order_id,
            1500.00,
            $cartItems,
            $customer,
            'Cash on Delivery'
        );

        // Assert no duplicate notifications were created
        $buyerNotifCount = Notification::where('user_id', $buyer->id)
            ->where('type', 'order_placed')
            ->where('order_id', $order->order_id)
            ->count();
        
        $sellerNotifCount = Notification::where('user_id', $sellerUser->id)
            ->where('type', 'new_order')
            ->where('order_id', $order->order_id)
            ->count();

        $this->assertEquals(1, $buyerNotifCount);
        $this->assertEquals(1, $sellerNotifCount);
    }

    public function test_notifications_unread_count_and_read_state(): void
    {
        $user = User::factory()->create();

        // Create 25 notifications to test take(20) vs total unread count logic
        for ($i = 0; $i < 25; $i++) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'test_notif',
                'title' => 'Test Notification ' . $i,
                'body' => 'Notification content ' . $i,
            ]);
        }

        // Fetch notifications list
        $response = $this->actingAs($user)->get(route('notifications.index'));
        $response->assertStatus(200);
        
        // Assert loaded list is capped at 20, but count is the absolute 25
        $this->assertCount(20, $response->json('notifications'));
        $this->assertEquals(25, $response->json('unread_count'));

        $notificationId = $response->json('notifications.0.id');

        // Mark single notification as read
        $readResponse = $this->actingAs($user)->patch(route('notifications.read', $notificationId));
        $readResponse->assertJson(['success' => true]);

        // Assert unread count goes down
        $response2 = $this->actingAs($user)->get(route('notifications.index'));
        $this->assertEquals(24, $response2->json('unread_count'));

        // Mark all as read
        $readAllResponse = $this->actingAs($user)->patch(route('notifications.read-all'));
        $readAllResponse->assertJson(['success' => true]);

        // Assert unread count is 0
        $response3 = $this->actingAs($user)->get(route('notifications.index'));
        $this->assertEquals(0, $response3->json('unread_count'));
    }
}
