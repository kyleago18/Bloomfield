import { Link, router } from '@inertiajs/react';
import { useRef } from 'react';
import { User, ShoppingBag, PackageCheck, MapPin, Shield, Store, LogOut, Camera } from 'lucide-react';

export default function Sidebar({ user, userStats, activeTab, setActiveTab }) {
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            router.post(route('profile.avatar.update'), {
                avatar: file
            });
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
        { id: 'completed', label: 'Completed Orders', icon: PackageCheck },
        { id: 'addresses', label: 'Shipping Address', icon: MapPin },
        { id: 'security', label: 'Security', icon: Shield },
    ];



    return (
        <div className="flex flex-col bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 overflow-hidden">
            {/* User Profile Header */}
            <div className="relative p-6 sm:p-8 text-center border-b border-pink-200/40">
                <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Verified
                    </span>
                </div>

                <div onClick={handleAvatarClick} className="relative inline-block group cursor-pointer mt-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-[#FAF0F3] shadow-[4px_4px_10px_#e2d7da,-4px_-4px_10px_#ffffff] bg-gray-100 relative">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#FAF0F3] text-[#E91E63] text-3xl font-serif font-bold">
                                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Camera className="w-6 h-6 text-white stroke-[2]" />
                    </div>
                </div>

                <h3 className="mt-4 text-lg sm:text-xl font-serif font-semibold text-gray-800 tracking-tight">{user?.name}</h3>
                <p className="text-[10px] text-gray-400 mt-1">Member since {user?.created_at ? new Date(user.created_at).getFullYear() : '2026'}</p>
            </div>

            {/* Quick Stats */}
            <div className="p-4 grid grid-cols-2 gap-3 border-b border-pink-200/40">
                <div className="bg-[#FAF0F3] shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] p-2.5 rounded-2xl text-center">
                    <p className="text-sm sm:text-base font-bold text-gray-800">{userStats?.orders_count ?? 0}</p>
                    <p className="text-[10px] text-gray-500 font-medium">Purchases</p>
                </div>
                <div className="bg-[#FAF0F3] shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] p-2.5 rounded-2xl text-center">
                    <p className="text-sm sm:text-base font-bold text-gray-800">{userStats?.reviews_count ?? 0}</p>
                    <p className="text-[10px] text-gray-500 font-medium">Reviews</p>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 py-4 px-3 space-y-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const IconComponent = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm sm:text-base font-medium transition-all
                                ${isActive
                                    ? 'text-[#E91E63] font-bold bg-white/60 shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff]'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                                }`}
                        >
                            <IconComponent className={`w-5 h-5 stroke-[1.8] ${isActive ? 'text-[#E91E63]' : 'text-gray-400'}`} />
                            <span className="flex-1 text-left">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Seller Mode Switch */}
            {user?.seller?.status === 'approved' ? (
                <div className="px-4 pb-4">
                    <Link
                        href={route('seller.dashboard')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-sm hover:shadow-md transition-all duration-300 uppercase tracking-wider"
                    >
                        Manage Store
                    </Link>
                </div>
            ) : !user?.seller ? (
                <div className="px-4 pb-4">
                    <Link
                        href={route('seller.register')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-gray-700 to-gray-900 shadow-sm hover:shadow-md transition-all duration-300 uppercase tracking-wider"
                    >
                        Start Selling
                    </Link>
                </div>
            ) : null}

            {/* Logout Button */}
            <div className="p-4 border-t border-pink-200/40">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-full text-sm font-bold text-rose-600 bg-rose-50/80 shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] hover:bg-rose-100 transition-all duration-300 uppercase tracking-widest"
                >
                    <LogOut className="w-4 h-4 stroke-[2]" />
                    Log Out
                </Link>
            </div>
        </div>
    );
}
