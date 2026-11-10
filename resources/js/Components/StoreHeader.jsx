import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useCart } from '../Contexts/CartContext';
import NotificationDropdown from './NotificationDropdown';

export default function StoreHeader({ auth }) {
    const { cartCount, toggleCartDrawer } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAdmin = auth?.user?.role === 'admin' || auth?.user?.role === 'super_admin';

    return (
        <>
            <header className="sticky top-0 z-30 border-b border-rose/10 bg-[#FAF0F3]/80 backdrop-blur-xl">
                <div className="store-container flex h-20 md:h-24 items-center justify-between gap-4">
                    {/* Left Column: Brand Logo */}
                    <div className="flex-[1.5] flex items-center justify-start gap-3 md:gap-4">
                        <button 
                            type="button" 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-rose transition-colors focus:outline-none"
                        >
                            <svg className="w-6 h-6 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        <Link
                            href={route('home')}
                            className="flex items-center gap-3 hover:text-rose transition-colors duration-300 group cursor-pointer"
                        >
                            <img
                                src="/images/logo.png"
                                alt="Bloom & Glow Logo"
                                className="w-10 h-10 rounded-full object-cover shadow-sm group-hover:scale-[1.05] transition-transform duration-300"
                            />
                            <div className="flex flex-col text-gray-800">
                                <span className="font-serif text-[18px] leading-none tracking-widest uppercase">Bloom</span>
                                <span className="font-serif text-[14px] leading-none tracking-[0.2em] uppercase text-gray-500 mt-1">&amp; Glow</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation & Utilities */}
                    <div className="flex-none flex items-center justify-center gap-1 lg:gap-4 xl:gap-6 text-gray-800">
                        <Link href={route('home')} className="hidden lg:flex flex-col items-center justify-center gap-1.5 hover:text-rose transition-colors cursor-pointer w-[72px] group focus:outline-none">
                            <svg className="h-[21px] w-[21px] text-gray-700 group-hover:text-rose transition-colors stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="text-[9px] font-semibold tracking-wider uppercase text-gray-500 group-hover:text-rose transition-colors leading-none">Home</span>
                        </Link>

                        {auth?.user?.seller?.status === 'approved' && (
                            <Link href={route('shop.show', auth.user.seller.id)} className="hidden lg:flex flex-col items-center justify-center gap-1.5 hover:text-rose transition-colors cursor-pointer w-[72px] group focus:outline-none">
                                <svg className="h-[21px] w-[21px] text-gray-700 group-hover:text-rose transition-colors stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.06-4.192A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .415.336.75.75.75Z" />
                                </svg>
                                <span className="text-[9px] font-semibold tracking-wider uppercase text-gray-500 group-hover:text-rose transition-colors leading-none">Botique</span>
                            </Link>
                        )}

                        <a href="/#collections" className="hidden lg:flex flex-col items-center justify-center gap-1.5 hover:text-rose transition-colors cursor-pointer w-[72px] group focus:outline-none">
                            <svg className="h-[21px] w-[21px] text-gray-700 group-hover:text-rose transition-colors stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <span className="text-[9px] font-semibold tracking-wider uppercase text-gray-500 group-hover:text-rose transition-colors leading-none">Discover</span>
                        </a>

                        <a href="/#occasions" className="hidden lg:flex flex-col items-center justify-center gap-1.5 hover:text-rose transition-colors cursor-pointer w-[72px] group focus:outline-none">
                            <svg className="h-[21px] w-[21px] text-gray-700 group-hover:text-rose transition-colors stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                            <span className="text-[9px] font-semibold tracking-wider uppercase text-gray-500 group-hover:text-rose transition-colors leading-none">Occasions</span>
                        </a>

                        {!isAdmin && (
                            <a href="/#story" className="hidden lg:flex flex-col items-center justify-center gap-1.5 hover:text-rose transition-colors cursor-pointer w-[72px] group focus:outline-none">
                                <svg className="h-[21px] w-[21px] text-gray-700 group-hover:text-rose transition-colors stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="text-[9px] font-semibold tracking-wider uppercase text-gray-500 group-hover:text-rose transition-colors leading-none">Favorites</span>
                            </a>
                        )}

                        <>
                            {auth?.user && (
                                <div className="flex items-center">
                                    <NotificationDropdown role={auth?.user?.role === 'vendor_admin' ? 'vendor_admin' : (isAdmin ? 'admin' : 'customer')} />
                                </div>
                            )}

                            {!isAdmin && (
                                <button id="cart-icon-target" type="button" onClick={toggleCartDrawer} className="flex flex-col items-center justify-center gap-1.5 hover:text-rose transition-colors cursor-pointer relative group w-[72px]">
                                    <svg className="h-[21px] w-[21px] text-gray-700 group-hover:text-rose transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <span className="text-[9px] font-semibold tracking-wider uppercase text-gray-500 group-hover:text-rose transition-colors hidden sm:block leading-none">Cart</span>
                                    {cartCount > 0 && (
                                        <span className="absolute top-0 right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-white shadow-sm">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                            )}

                            <Link href={route('search')} className="flex flex-col items-center justify-center gap-1.5 hover:text-rose transition-colors cursor-pointer w-[72px] group focus:outline-none">
                                <svg className="h-[21px] w-[21px] text-gray-700 group-hover:text-rose transition-colors stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="text-[9px] font-semibold tracking-wider uppercase text-gray-500 group-hover:text-rose transition-colors hidden sm:block leading-none">Search</span>
                            </Link>

                            <div className="relative group flex flex-col items-center justify-center w-[72px]">
                                <Link href={auth?.user ? route('profile.edit') : route('login')} className="flex flex-col items-center justify-center gap-1.5 hover:text-rose transition-colors cursor-pointer group">
                                    {auth?.user?.avatar_url ? (
                                        <img
                                            src={auth.user.avatar_url}
                                            alt={auth.user.name || 'Profile'}
                                            className="h-[26px] w-[26px] rounded-full object-cover border-2 border-transparent group-hover:border-rose transition-all duration-200 shadow-sm"
                                        />
                                    ) : (
                                        <svg className="h-[21px] w-[21px] text-gray-700 group-hover:text-rose transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                    <span className="text-[9px] font-semibold tracking-wider uppercase text-gray-500 group-hover:text-rose transition-colors hidden sm:block leading-none">
                                        {auth?.user ? 'Account' : 'Sign In'}
                                    </span>
                                </Link>

                                {/* Dropdown Menu */}
                                {auth?.user && (
                                    <div className="absolute top-full right-0 mt-4 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pt-2 pb-2">
                                        {auth?.user?.role === 'admin' && (
                                            <Link href={route('admin.verifications.index')} className="block px-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50">
                                                🛡️ Admin Panel
                                            </Link>
                                        )}
                                        {auth?.user?.role !== 'admin' && auth?.user?.role !== 'super_admin' && (
                                            <>
                                                <Link href={route('profile.edit')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-rose transition-colors">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    Profile Settings
                                                </Link>
                                                {auth?.user?.seller?.status === 'approved' && (
                                                    <Link href={route('seller.dashboard')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-rose transition-colors">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                        Manage Store
                                                    </Link>
                                                )}
                                            </>
                                        )}
                                        <div className="h-px bg-gray-100 my-1"></div>
                                        <Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-rose transition-colors">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Sign Out
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </>
                    </div>

                    {/* Right Spacer (Smaller than left to push nav slightly right) */}
                    <div className="hidden lg:flex flex-1 items-center justify-end"></div>
                </div>
            </header>

            {/* Mobile Slide-out Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 z-[100] bg-gray-900/30 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Slide-out Drawer */}
            <div 
                className={`fixed top-0 left-0 bottom-0 z-[110] w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#FAF0F3]/30">
                    <div className="flex items-center gap-3">
                        <img src="/images/logo.png" alt="Bloom & Glow" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                        <span className="font-serif text-[15px] font-semibold tracking-widest uppercase text-gray-800">Menu</span>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 -mr-2 text-gray-500 hover:text-rose transition-colors rounded-full hover:bg-gray-100"
                    >
                        <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-2">
                    <Link href={route('home')} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-rose transition-colors font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Home
                    </Link>

                    {auth?.user?.seller?.status === 'approved' && (
                        <Link href={route('shop.show', auth.user.seller.id)} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-rose transition-colors font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.06-4.192A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .415.336.75.75.75Z" /></svg>
                            My Boutique
                        </Link>
                    )}

                    <a href="/#collections" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-rose transition-colors font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Discover Collections
                    </a>

                    <a href="/#occasions" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-rose transition-colors font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                        Occasions
                    </a>

                    {!isAdmin && (
                        <a href="/#story" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-rose transition-colors font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            Our Favorites
                        </a>
                    )}
                </div>

                {/* Footer Section */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    {auth?.user ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 px-2 mb-2">
                                {auth.user.avatar_url ? (
                                    <img src={auth.user.avatar_url} alt={auth.user.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold font-serif shadow-sm">
                                        {auth.user.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900">{auth.user.name}</span>
                                    <span className="text-[11px] text-gray-500 truncate max-w-[180px]">{auth.user.email}</span>
                                </div>
                            </div>
                            <Link href={route('logout')} method="post" as="button" className="w-full py-2.5 text-center text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors">
                                Sign Out
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Link href={route('login')} className="w-full py-2.5 text-center text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
                                Sign In
                            </Link>
                            <Link href={route('register')} className="w-full py-2.5 text-center text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                Create Account
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
