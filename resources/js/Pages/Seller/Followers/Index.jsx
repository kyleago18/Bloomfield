import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Users, 
    Search, 
    Calendar, 
    ArrowLeft, 
    User, 
    ChevronRight, 
    Heart,
    ShieldCheck
} from 'lucide-react';

export default function FollowersIndex({ seller, followers, filters, totalFollowers }) {
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('seller.followers.index'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get(route('seller.followers.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const getInitials = (name) => {
        if (!name) return 'F';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <SellerLayout seller={seller} title="Followers List">
            <Head title="Followers — Seller Dashboard" />

            <div className="space-y-6 pb-16 max-w-6xl mx-auto">
                {/* Top Navigation & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('seller.dashboard')} 
                            className="h-10 w-10 bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] rounded-full flex items-center justify-center text-gray-600 hover:text-[#E91E63] transition-all"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="h-5 w-5 stroke-[1.8]" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-gray-800 tracking-tight">
                                    Shop Followers
                                </h2>
                                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white shadow-xs">
                                    {totalFollowers ?? followers.total ?? followers.data?.length ?? 0} Total
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 font-normal">
                                Manage and view all customers following your shop
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-4 sm:p-5">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search followers by name or email..."
                                className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-full pl-11 pr-24 py-2.5 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-16 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white text-xs font-semibold rounded-full shadow-xs hover:shadow transition-all"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* Followers List Grid */}
                {(!followers?.data || followers.data.length === 0) ? (
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-12 text-center">
                        <div className="w-16 h-16 mx-auto bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-full flex items-center justify-center mb-4 text-pink-400">
                            <Users className="h-8 w-8 stroke-[1.8]" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800 mb-1">
                            {search ? 'No followers found' : 'No followers yet'}
                        </h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 font-normal">
                            {search 
                                ? `No followers matched the search "${search}".`
                                : 'When customers follow your shop, they will appear here.'}
                        </p>
                        {search && (
                            <button
                                onClick={handleClearSearch}
                                className="px-5 py-2.5 bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-gray-700 font-semibold rounded-full hover:text-[#E91E63] transition-all text-xs"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {followers.data.map(follower => {
                            const user = follower.user;
                            const fullName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Customer');
                            const username = user?.name ? strToHandle(user.name) : (user?.email ? user.email.split('@')[0] : 'user');
                            const followDate = follower.created_at ? new Date(follower.created_at).toLocaleDateString('en-PH', { dateStyle: 'medium' }) : 'Recently';

                            return (
                                <div
                                    key={follower.id}
                                    className="bg-[#FAF0F3] rounded-[24px] p-5 shadow-[6px_6px_14px_#e2d7da,-6px_-6px_14px_#ffffff] border border-white/80 hover:shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff] transition-all flex flex-col justify-between group"
                                >
                                    <div className="flex items-start gap-3.5 mb-4">
                                        <Link
                                            href={route('seller.customers.show', follower.user_id)}
                                            className="shrink-0 group/avatar"
                                        >
                                            {user?.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={fullName}
                                                    className="w-12 h-12 rounded-full object-cover shadow-[2px_2px_6px_#e2d7da,-2px_-2px_6px_#ffffff] border border-white group-hover/avatar:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#E91E63] to-[#E07A5F] text-white text-sm font-bold flex items-center justify-center shadow-[2px_2px_6px_#e2d7da,-2px_-2px_6px_#ffffff] group-hover/avatar:scale-105 transition-transform">
                                                    {getInitials(fullName)}
                                                </div>
                                            )}
                                        </Link>

                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={route('seller.customers.show', follower.user_id)}
                                                className="text-sm font-bold text-gray-800 hover:text-[#E91E63] transition-colors truncate block"
                                            >
                                                {fullName}
                                            </Link>
                                            <p className="text-xs text-pink-600 font-medium truncate">
                                                @{username}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                                                <Heart className="w-3 h-3 text-pink-400 fill-pink-400 shrink-0" />
                                                <span>Followed {followDate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-pink-200/40 flex items-center justify-between">
                                        <span className="text-[11px] font-semibold text-gray-400">
                                            Customer Profile
                                        </span>
                                        <Link
                                            href={route('seller.customers.show', follower.user_id)}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-[#E91E63] hover:translate-x-0.5 transition-transform"
                                        >
                                            <span>View Profile</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {followers?.links && followers.links.length > 3 && (
                    <div className="flex justify-center items-center gap-2 pt-4">
                        {followers.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                                    link.active
                                        ? 'bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white shadow-xs'
                                        : (link.url ? 'bg-[#FAF0F3] text-gray-700 shadow-[3px_3px_6px_#e2d7da,-3px_-3px_6px_#ffffff] hover:text-[#E91E63]' : 'text-gray-300 pointer-events-none')
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </SellerLayout>
    );
}

function strToHandle(name) {
    if (!name) return 'user';
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}
