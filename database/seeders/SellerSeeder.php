<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Seller;
use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;

class SellerSeeder extends Seeder
{
    public function run(): void
    {
        $sellersData = [
            [
                'shop_name' => 'Digos Blooms & Petals',
                'owner_name' => 'Maria Santos',
                'email' => 'maria.blooms@gmail.com',
                'phone_number' => '09171234567',
                'address' => 'Rizal Avenue, Zone 1',
                'barangay' => 'Zone 1 (Pob.)',
                'city' => 'Digos City',
                'province' => 'Davao del Sur',
                'postal_code' => '8002',
                'latitude' => 6.7508,
                'longitude' => 125.3571,
                'shop_description' => 'Your premier flower shop in the heart of Digos.',
            ],
            [
                'shop_name' => 'Tres de Mayo Floral Creations',
                'owner_name' => 'Jose Dela Cruz',
                'email' => 'jose.floral@gmail.com',
                'phone_number' => '09181234567',
                'address' => 'National Highway',
                'barangay' => 'Tres de Mayo',
                'city' => 'Digos City',
                'province' => 'Davao del Sur',
                'postal_code' => '8002',
                'latitude' => 6.7412,
                'longitude' => 125.3489,
                'shop_description' => 'Fresh cuts everyday from Tres de Mayo.',
            ],
            [
                'shop_name' => 'Sinawilan Flower Boutique',
                'owner_name' => 'Ana Reyes',
                'email' => 'ana.boutique@gmail.com',
                'phone_number' => '09191234567',
                'address' => 'Purok 3, Sinawilan',
                'barangay' => 'Sinawilan',
                'city' => 'Digos City',
                'province' => 'Davao del Sur',
                'postal_code' => '8002',
                'latitude' => 6.7667,
                'longitude' => 125.3500,
                'shop_description' => 'Beautiful arrangements for all occasions.',
            ],
            [
                'shop_name' => 'Matti Orchids and Roses',
                'owner_name' => 'Carlos Garcia',
                'email' => 'carlos.orchids@gmail.com',
                'phone_number' => '09201234567',
                'address' => 'Provincial Capitol Road',
                'barangay' => 'Matti',
                'city' => 'Digos City',
                'province' => 'Davao del Sur',
                'postal_code' => '8002',
                'latitude' => 6.7580,
                'longitude' => 125.3340,
                'shop_description' => 'Specializing in rare orchids and imported roses.',
            ],
            [
                'shop_name' => 'Colorado Nature Blooms',
                'owner_name' => 'Lourdes Fernandez',
                'email' => 'lourdes.nature@gmail.com',
                'phone_number' => '09211234567',
                'address' => 'Upper Colorado',
                'barangay' => 'Colorado',
                'city' => 'Digos City',
                'province' => 'Davao del Sur',
                'postal_code' => '8002',
                'latitude' => 6.7450,
                'longitude' => 125.3210,
                'shop_description' => 'Organic, locally-grown flowers from the highlands.',
            ],
            [
                'shop_name' => 'Aplaya Coastal Floral',
                'owner_name' => 'Roberto Bautista',
                'email' => 'roberto.coastal@gmail.com',
                'phone_number' => '09221234567',
                'address' => 'Dawis Beach Road',
                'barangay' => 'Aplaya',
                'city' => 'Digos City',
                'province' => 'Davao del Sur',
                'postal_code' => '8002',
                'latitude' => 6.7515,
                'longitude' => 125.3789,
                'shop_description' => 'Fresh tropical flowers by the sea.',
            ],
            [
                'shop_name' => 'Igpit Garden Center',
                'owner_name' => 'Elena Villanueva',
                'email' => 'elena.garden@gmail.com',
                'phone_number' => '09231234567',
                'address' => 'Igpit Proper',
                'barangay' => 'Igpit',
                'city' => 'Digos City',
                'province' => 'Davao del Sur',
                'postal_code' => '8002',
                'latitude' => 6.7320,
                'longitude' => 125.3650,
                'shop_description' => 'Wholesale and retail flower garden center.',
            ],
            [
                'shop_name' => 'Kapatagan Highland Flowers',
                'owner_name' => 'Juanito Torres',
                'email' => 'juanito.highland@gmail.com',
                'phone_number' => '09241234567',
                'address' => 'Mt. Apo Foothills',
                'barangay' => 'Kapatagan',
                'city' => 'Digos City',
                'province' => 'Davao del Sur',
                'postal_code' => '8002',
                'latitude' => 6.8500,
                'longitude' => 125.2667,
                'shop_description' => 'Premium roses grown in the cool climate of Kapatagan.',
            ],
            [
                'shop_name' => 'Zone 3 Floral Hub',
                'owner_name' => 'Carmen Lim',
                'email' => 'carmen.hub@gmail.com',
                'phone_number' => '09251234567',
                'address' => 'Market Place',
                'barangay' => 'Zone 3 (Pob.)',
                'city' => 'Digos City',
                'province' => 'Davao del Sur',
                'postal_code' => '8002',
                'latitude' => 6.7522,
                'longitude' => 125.3555,
                'shop_description' => 'Conveniently located near the public market.',
            ],
            [
                'shop_name' => 'San Jose Blooming Events',
                'owner_name' => 'Ricardo Mendoza',
                'email' => 'ricardo.events@gmail.com',
                'phone_number' => '09261234567',
                'address' => 'San Jose Street',
                'barangay' => 'San Jose',
                'city' => 'Digos City',
                'province' => 'Davao del Sur',
                'postal_code' => '8002',
                'latitude' => 6.7601,
                'longitude' => 125.3421,
                'shop_description' => 'Special event florists for weddings and birthdays.',
            ]
        ];

        // Create a generic customer user to associate orders with
        User::firstOrCreate(
            ['email' => 'customer@gmail.com'],
            ['name' => 'Test Customer', 'password' => bcrypt('password'), 'role' => 'customer']
        );

        $sellerId = 43697;
        foreach ($sellersData as $data) {
            // Create the seller
            $data['id'] = (string) $sellerId++;
            $data['is_verified'] = true;
            $data['status'] = 'approved';
            Seller::create($data);
        }
    }
}
