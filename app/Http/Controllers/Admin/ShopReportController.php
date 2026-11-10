<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ShopReport;
use Inertia\Inertia;

class ShopReportController extends Controller
{
    public function index(Request $request)
    {
        $reports = ShopReport::with(['user:id,name', 'seller:id,shop_name,owner_name,status'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/ShopReports/Index', [
            'reports' => $reports,
        ]);
    }

    public function updateStatus(Request $request, ShopReport $report)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,reviewed,action_taken,dismissed',
        ]);

        $report->update(['status' => $validated['status']]);

        return back()->with('success', 'Report status updated.');
    }
}
