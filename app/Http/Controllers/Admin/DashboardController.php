<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Seller;
use App\Models\Order;
use App\Models\Delivery;

class DashboardController extends Controller
{
    public function index()
    {
        // By the time we reach here, AdminMiddleware has confirmed the user is super_admin.
        
        $totalUsers = DB::table('users')->count();
        $totalSellers = DB::table('sellers')->count();
        
        $activeUsers = DB::table('users')->where('status', 'active')->count();
        $suspendedUsers = DB::table('users')->where('status', 'suspended')->count();
        
        $pendingSellers = DB::table('sellers')->where('status', 'pending')->count();
        $approvedSellers = DB::table('sellers')->where('status', 'approved')->count();
        
        $sellers = Seller::with('user:id,name,email')->latest()->take(10)->get();
        $recentUsers = \App\Models\User::latest()->take(5)->get();

        $userRolesRaw = DB::select("
            SELECT role, COUNT(*) as count 
            FROM users 
            GROUP BY role
        ");
        $userRoleCounts = [];
        foreach ($userRolesRaw as $row) {
            $userRoleCounts[$row->role] = (int) $row->count;
        }

        return Inertia::render('Admin/Dashboard', [
            'role' => 'super_admin',
            'data' => [
                'total_users'      => $totalUsers,
                'total_sellers'    => $totalSellers,
                'active_users'     => $activeUsers,
                'suspended_users'  => $suspendedUsers,
                'pending_sellers'  => $pendingSellers,
                'approved_sellers' => $approvedSellers,
                'recent_users'     => $recentUsers,
                'recent_sellers'   => $sellers,
                'user_roles'       => $userRoleCounts,
            ],
        ]);
    }
}
