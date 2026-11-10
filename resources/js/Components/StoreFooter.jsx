import React from 'react';
import { Link } from '@inertiajs/react';

export default function StoreFooter() {
    return (
        <footer className="bg-[#242424] text-[#a0a0a0] py-16 text-[13px]">
            <div className="store-container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    
                    {/* SHOPPING */}
                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Shopping</h4>
                        <ul className="space-y-3">
                            <li><Link href="/" className="hover:text-white transition-colors">All Flowers</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Shop by Occasion</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Best Sellers</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Flash Sale</Link></li>
                        </ul>
                    </div>

                    {/* MY ACCOUNT */}
                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">My Account</h4>
                        <ul className="space-y-3">
                            <li><Link href={route('login')} className="hover:text-white transition-colors">Profile</Link></li>
                            <li><Link href="/checkout" className="hover:text-white transition-colors">Shopping Cart</Link></li>

                            <li><Link href="#" className="hover:text-white transition-colors">Order History</Link></li>
                        </ul>
                    </div>

                    {/* SELL WITH US */}
                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Sell With Us</h4>
                        <ul className="space-y-3">
                            <li><Link href="/seller/register" className="hover:text-white transition-colors">Become a Seller</Link></li>
                            <li><Link href="/seller/login" className="hover:text-white transition-colors">Seller Login</Link></li>
                            <li><Link href="/seller/dashboard" className="hover:text-white transition-colors">Seller Dashboard</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Seller Policy</Link></li>
                        </ul>
                    </div>

                    {/* CUSTOMER SERVICE */}
                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Customer Service</h4>
                        <ul className="space-y-3">
                            <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Delivery Information</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
                        </ul>
                    </div>

                    {/* ABOUT BLOOM & GLOW */}
                    <div className="lg:col-span-1">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">About Bloom &amp; Glow</h4>
                        <p className="leading-relaxed mb-6">
                            A premier online marketplace connecting you with the finest florists to bring beauty and joy to every meaningful moment.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-white rounded-[2px] text-[#242424] text-[10px] font-bold tracking-tighter">VISA</span>
                            <span className="px-2 py-1 bg-white rounded-[2px] text-[#242424] text-[10px] font-bold tracking-tighter">PayPal</span>
                            <span className="px-2 py-1 bg-white rounded-[2px] text-[#242424] text-[10px] font-bold tracking-tighter">MasterCard</span>
                            <span className="px-2 py-1 bg-white rounded-[2px] text-[#242424] text-[10px] font-bold tracking-tighter">Discover</span>
                        </div>
                    </div>

                </div>

                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs">
                    <p>&copy; {new Date().getFullYear()} - BloomAndGlow</p>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        {/* Social Icons Placeholders */}
                        <a href="#" className="hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
