import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    BarChart3,
    ShoppingCart,
    ArchiveRestore,
    PlusCircle,
    Heart,
    Store,
    ExternalLink,
    LogOut,
    Search,
    ChevronDown,
    Menu,
    X,
    CheckCircle2,
    User,
    Home
} from 'lucide-react';
import NotificationDropdown from '@/Components/NotificationDropdown';
import useFlashToast from '@/Hooks/useFlashToast';

/* ── 3D Flower Logo SVG Component ── */
function FlowerLogoIcon({ className = "h-9 w-9" }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none">
            <path d="M50 5 L95 50 L50 95 L5 50 Z" stroke="#E91E63" strokeWidth="2" strokeOpacity="0.2" />
            <path d="M50 15 Q 85 50, 50 85 Q 15 50, 50 15" stroke="url(#premiumGrad)" strokeWidth="4" />
            <path d="M15 50 Q 50 85, 85 50 Q 50 15, 15 50" stroke="url(#premiumGrad)" strokeWidth="4" />
            <circle cx="50" cy="50" r="5" fill="#E91E63" />
            <defs>
                <linearGradient id="premiumGrad" x1="15" y1="15" x2="85" y2="85">
                    <stop offset="0%" stopColor="#E91E63" />
                    <stop offset="100%" stopColor="#F472B6" />
                </linearGradient>
            </defs>
        </svg>
    );
}

const navItems = [
    { label: 'Overview',              href: '/',                    icon: Home,         routeName: 'home' },
    { label: 'Analytics',             href: '/seller/dashboard',    icon: BarChart3,     routeName: 'seller.dashboard' },
    { label: 'Sales',                 href: '/seller/orders',       icon: ShoppingCart,  routeName: 'seller.orders.index', badge: 16 },
    { label: 'Replacement Requests',  href: '/seller/replacements', icon: ArchiveRestore, routeName: 'seller.replacements.index' },
    { label: 'Add Product',           href: '/seller/products/create', icon: PlusCircle, routeName: 'seller.products.create' },
    { label: 'Followers',             href: '/seller/followers',    icon: Heart,         routeName: 'seller.followers.index' },
    { label: 'Store Management',      href: '/seller/shop',         icon: Store,         routeName: 'seller.shop.edit' },
    { label: 'View Storefront',       href: '#storefront',          icon: ExternalLink,  isStorefront: true },
];

const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

export default function SellerLayout({ children, seller, title }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    useFlashToast();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // Initialize selected month from URL parameter or current month
    const currentMonthIndex = new Date().getMonth();
    const queryMonth = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('month') : null;
    const initialMonthIndex = queryMonth ? parseInt(queryMonth) - 1 : currentMonthIndex;
    const [selectedMonth, setSelectedMonth] = useState(months[initialMonthIndex] || months[currentMonthIndex]);

    const handleLogout = () => {
        router.post(route('seller.logout'));
    };

    const currentPath = window.location.pathname;

    const ownerFirstName = seller?.owner_name ? seller.owner_name.split(' ')[0] : 'Seller';
    const shopDisplayName = seller?.shop_name || 'My Flower Shop';

    return (
        <div className="min-h-screen bg-[#FAF0F3] flex flex-col font-sans text-gray-700 antialiased selection:bg-pink-200 selection:text-pink-900">
            <div className="flex flex-1 p-4 sm:p-6 gap-6 relative">
                {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Neumorphic Floral Floating Left Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[240px] flex flex-col bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-4
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:static lg:z-auto shrink-0
                    ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
            >
                {/* Branding Header with Dynamic Shop Logo & Shop Name Subtitle */}
                <div className="flex items-center justify-between px-2 pt-3 pb-5 border-b border-pink-200/40">
                    <Link href={route('home')} className="flex flex-col items-center mx-auto text-center group max-w-[200px]">
                        {seller?.shop_logo_url ? (
                            <div className="w-12 h-12 max-w-[48px] max-h-[48px] rounded-2xl overflow-hidden shadow-xs border border-pink-200/60 mb-2 shrink-0 group-hover:scale-105 transition-transform">
                                <img src={seller.shop_logo_url} alt={shopDisplayName} className="w-full h-full max-w-full max-h-full object-cover rounded-2xl aspect-square" />
                            </div>
                        ) : (
                            <FlowerLogoIcon className="h-10 w-10 transition-transform group-hover:scale-105 mb-1.5" />
                        )}
                        <span className="font-serif text-xl font-semibold tracking-tight text-gray-800 leading-none">
                            Bloom <span className="text-[#E91E63] font-sans text-base">&</span> Glow
                        </span>
                        <span className="text-[11px] font-semibold text-pink-500 uppercase tracking-widest mt-1.5 truncate w-full text-center">
                            {shopDisplayName}
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-pink-600 transition-colors p-1"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar">
                    {navItems.map(({ label, href, icon: Icon, routeName, badge, isStorefront, isAnchor }) => {
                        let linkHref = href;
                        let isActive = false;

                        if (routeName) {
                            try {
                                linkHref = route(routeName);
                                isActive = currentPath === linkHref || (routeName !== 'seller.dashboard' && currentPath.startsWith(linkHref));
                            } catch (e) {
                                linkHref = href;
                            }
                        } else if (isStorefront && seller) {
                            linkHref = route('shop.show', seller.id);
                        }

                        const handleNavClick = (e) => {
                            if (isAnchor) {
                                e.preventDefault();
                                const target = document.getElementById(href.replace('#', ''));
                                if (target) target.scrollIntoView({ behavior: 'smooth' });
                            }
                        };

                        return (
                            <Link
                                key={label}
                                href={linkHref}
                                onClick={handleNavClick}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-300 group text-center
                                    ${isActive
                                        ? 'bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white shadow-[4px_4px_12px_rgba(233,30,99,0.25)]'
                                        : 'bg-[#FAF0F3] text-gray-600 hover:text-[#E91E63] shadow-[4px_4px_10px_#e2d7da,-4px_-4px_10px_#ffffff] hover:shadow-[2px_2px_5px_#e2d7da,-2px_-2px_5px_#ffffff]'}`}
                            >
                                <Icon className={`h-5 w-5 mb-1 stroke-[1.8] transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-pink-400 group-hover:text-[#E91E63]'}`} />
                                <span>{label}</span>
                                {badge && (
                                    <span className={`mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${isActive ? 'bg-white text-[#E91E63]' : 'bg-pink-100 text-pink-700'}`}>
                                        {badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center w-full p-3 rounded-2xl text-xs sm:text-sm font-medium bg-[#FAF0F3] text-gray-500 hover:text-red-600 shadow-[4px_4px_10px_#e2d7da,-4px_-4px_10px_#ffffff] transition-all group"
                    >
                        <LogOut className="h-5 w-5 mb-1 stroke-[1.8] text-gray-400 group-hover:text-red-500 transition-colors" />
                        <span>Sign Out</span>
                    </button>
                </div>

                {/* Neumorphic Shop Profile Pill */}
                {seller && (
                    <div className="pt-3 border-t border-pink-200/40">
                        <div className="flex items-center gap-3 bg-[#FAF0F3] p-2.5 rounded-2xl shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                            <div className="w-10 h-10 max-w-[40px] max-h-[40px] rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 flex items-center justify-center text-white font-serif text-sm font-semibold shrink-0 overflow-hidden shadow-xs relative">
                                {seller.shop_logo_url ? (
                                    <img src={seller.shop_logo_url} alt={shopDisplayName} className="w-full h-full max-w-full max-h-full object-cover rounded-full aspect-square" />
                                ) : (
                                    shopDisplayName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-gray-800 truncate">{shopDisplayName}</p>
                                <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Verified
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 space-y-6">
                {/* Top Bar: Month Selector & Utilities */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    {/* Month Selector Bar with Neumorphic Inset Tray */}
                    <div className="flex-1 overflow-x-auto custom-scrollbar">
                        <div className="flex items-center gap-1.5 bg-[#FAF0F3] p-1.5 rounded-2xl shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] min-w-max border border-white/60">
                            {months.map((m, idx) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => {
                                        setSelectedMonth(m);
                                        const currentParams = new URLSearchParams(window.location.search);
                                        const queryObj = Object.fromEntries(currentParams.entries());
                                        queryObj.month = idx + 1;
                                        import('@inertiajs/react').then(({ router }) => {
                                            router.get(window.location.pathname, queryObj, { preserveState: true, preserveScroll: true });
                                        });
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium uppercase transition-all duration-200 ${selectedMonth === m ? 'bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]' : 'text-gray-500 hover:text-[#E91E63]'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search & Profile Controls */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2.5 rounded-xl bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-gray-600 hover:text-pink-600 transition-colors"
                        >
                            <Menu className="h-6 w-6 stroke-[1.8]" />
                        </button>



                        {/* Notifications */}
                        {seller && <NotificationDropdown role="vendor_admin" />}

                        {/* Seller Profile Menu */}
                        {seller && (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_5px_#e2d7da,-2px_-2px_5px_#ffffff] transition-colors"
                                >
                                    <div className="w-8 h-8 max-w-[32px] max-h-[32px] rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white font-serif text-xs font-semibold flex items-center justify-center overflow-hidden shrink-0 relative">
                                        {seller.shop_logo_url || user?.avatar_url ? (
                                            <img src={seller.shop_logo_url || user?.avatar_url} alt="" className="w-full h-full max-w-full max-h-full object-cover rounded-full aspect-square" />
                                        ) : (
                                            ownerFirstName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-none">{ownerFirstName}</p>
                                        <p className="text-[11px] font-normal text-gray-400 leading-none mt-1">Seller</p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-400 ml-0.5 stroke-[1.8]" />
                                </button>

                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#FAF0F3] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 py-2 z-50 text-xs sm:text-sm font-medium">
                                        <Link href={route('profile.edit')} className="block px-4 py-2 text-gray-700 hover:bg-pink-100/50 hover:text-pink-600">
                                            Account Settings
                                        </Link>
                                        <Link href={route('seller.shop.edit')} className="block px-4 py-2 text-gray-700 hover:bg-pink-100/50 hover:text-pink-600">
                                            Shop Profile
                                        </Link>

                                        <div className="h-px bg-pink-200/40 my-1"></div>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Inner Page View */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
            </div>
        </div>
    );
}
