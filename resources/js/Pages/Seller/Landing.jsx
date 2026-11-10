import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Store, ShieldCheck, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SellerLanding() {
    const { auth } = usePage().props;

    // Use AuthenticatedLayout if user is logged in, otherwise GuestLayout
    const Layout = auth.user ? AuthenticatedLayout : GuestLayout;

    return (
        <Layout>
            <Head title="Sell on Bloom & Glow" />

            <div className="bg-[#FAF0F3] min-h-screen text-gray-800 font-sans">
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            
                            {/* Text Content */}
                            <div className="max-w-2xl">
                                <span className="inline-block py-1 px-3 rounded-full bg-pink-100 text-[#E91E63] text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-pink-200">
                                    Become a Partner
                                </span>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold text-gray-900 leading-tight mb-6">
                                    Turn Your <span className="text-[#E91E63] italic">Floral Passion</span> into Profit
                                </h1>
                                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                    Join Bloom & Glow and reach thousands of customers looking for the perfect bouquet. We provide the tools, you provide the art.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link 
                                        href={route('seller.register')} 
                                        className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-wider text-white uppercase transition-all duration-300 bg-gradient-to-r from-[#E91E63] to-[#F472B6] rounded-full shadow-[0_8px_20px_rgba(233,30,99,0.25)] hover:shadow-[0_12px_25px_rgba(233,30,99,0.35)] hover:-translate-y-1 group"
                                    >
                                        Start Selling Today
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <a 
                                        href="#how-it-works"
                                        className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-wider text-gray-700 uppercase transition-all duration-300 bg-white/60 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:shadow-md border border-pink-100"
                                    >
                                        How it works
                                    </a>
                                </div>
                            </div>
                            
                            {/* Image Content */}
                            <div className="relative lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>
                                <img 
                                    src="/images/seller_landing_hero.png" 
                                    alt="Beautiful floral arrangement" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white flex items-center gap-4 animate-fade-in-up">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Average Monthly Growth</p>
                                        <p className="text-xl font-bold text-gray-900">+42% New Customers</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-20 bg-white border-y border-pink-100/50 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-4">Why Sell on Bloom & Glow?</h2>
                            <p className="text-gray-500">We've built a platform specifically tailored to the needs of florists and botanical artists. Focus on creating beautiful arrangements, and let us handle the rest.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* Benefit 1 */}
                            <div className="p-8 rounded-[28px] bg-[#FAF0F3]/50 border border-pink-50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#E91E63] mb-6 group-hover:scale-110 transition-transform">
                                    <Store className="w-7 h-7 stroke-[1.5]" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Seamless Shop Management</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    Enjoy an intuitive dashboard designed to track orders, manage your inventory, and view analytics effortlessly. Keep your focus on crafting stunning bouquets.
                                </p>
                            </div>

                            {/* Benefit 2 */}
                            <div className="p-8 rounded-[28px] bg-[#FAF0F3]/50 border border-pink-50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#E91E63] mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-7 h-7 stroke-[1.5]" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Secure Payments</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    With our advanced Stripe integration, all transactions are secure. Get paid quickly and reliably directly to your bank account with transparent payout schedules.
                                </p>
                            </div>

                            {/* Benefit 3 */}
                            <div className="p-8 rounded-[28px] bg-[#FAF0F3]/50 border border-pink-50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#E91E63] mb-6 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7 stroke-[1.5]" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Grow Your Audience</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    Instantly tap into our established, built-in customer base of flower lovers. We handle the platform marketing so your shop gets the visibility it deserves.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="py-24 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-4">How It Works</h2>
                            <p className="text-gray-500">Starting your floral journey with us is simple and straightforward.</p>
                        </div>
                        
                        <div className="relative">
                            {/* Connecting Line (Desktop only) */}
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 -translate-y-1/2 z-0"></div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                                
                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-pink-50 text-center relative hover:-translate-y-2 transition-transform duration-300">
                                    <div className="w-12 h-12 bg-[#E91E63] text-white font-bold text-xl rounded-full flex items-center justify-center mx-auto -mt-12 mb-6 shadow-md border-4 border-white">
                                        1
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">Register Your Shop</h4>
                                    <p className="text-xs text-gray-500">Create an account and set up your storefront details in minutes.</p>
                                </div>
                                
                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-pink-50 text-center relative hover:-translate-y-2 transition-transform duration-300 mt-8 md:mt-0">
                                    <div className="w-12 h-12 bg-[#E91E63] text-white font-bold text-xl rounded-full flex items-center justify-center mx-auto -mt-12 mb-6 shadow-md border-4 border-white">
                                        2
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">Get Approved</h4>
                                    <p className="text-xs text-gray-500">Our admin team quickly reviews your application to ensure quality.</p>
                                </div>
                                
                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-pink-50 text-center relative hover:-translate-y-2 transition-transform duration-300 mt-8 md:mt-0">
                                    <div className="w-12 h-12 bg-[#E91E63] text-white font-bold text-xl rounded-full flex items-center justify-center mx-auto -mt-12 mb-6 shadow-md border-4 border-white">
                                        3
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">List Arrangements</h4>
                                    <p className="text-xs text-gray-500">Upload beautiful photos of your bouquets and set your own prices.</p>
                                </div>
                                
                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-pink-50 text-center relative hover:-translate-y-2 transition-transform duration-300 mt-8 md:mt-0">
                                    <div className="w-12 h-12 bg-[#E91E63] text-white font-bold text-xl rounded-full flex items-center justify-center mx-auto -mt-12 mb-6 shadow-md border-4 border-white">
                                        4
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">Start Receiving Orders</h4>
                                    <p className="text-xs text-gray-500">Connect with customers, fulfill orders, and watch your business bloom.</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Banner */}
                <section className="bg-gray-900 text-white py-20 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-500 via-gray-900 to-gray-900"></div>
                    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-6">Ready to grow your flower business?</h2>
                        <p className="text-gray-300 mb-10 text-lg">Join our community of talented florists and reach a wider audience today.</p>
                        <Link 
                            href={route('seller.register')} 
                            className="inline-flex items-center justify-center px-10 py-5 text-sm font-bold tracking-wider text-gray-900 uppercase transition-all duration-300 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 hover:scale-105"
                        >
                            <CheckCircle2 className="mr-2 w-5 h-5 text-[#E91E63]" />
                            Apply Now — Open Your Shop
                        </Link>
                    </div>
                </section>

            </div>
        </Layout>
    );
}
