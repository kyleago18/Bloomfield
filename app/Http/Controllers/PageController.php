<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * Display the landing page for prospective vendors.
     */
    public function sellLanding(): Response
    {
        return Inertia::render('Seller/Landing');
    }
}
