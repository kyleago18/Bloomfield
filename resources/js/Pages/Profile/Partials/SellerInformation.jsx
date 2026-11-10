import React from 'react';
import { Store, Star, MapPin, Package, ShoppingBag } from 'lucide-react';

export default function SellerInformation({ user, stats }) {
    const shopName = user?.seller?.shop_name || `${(user?.name || 'Seller').split(' ')[0]}'s Flowers`;

    return (
        <section className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 overflow-hidden">
            {/* Shop Banner */}
            <div className="h-32 bg-gradient-to-r from-pink-200 via-rose-100 to-amber-100 relative">
                <div className="absolute inset-0 bg-[#FAF0F3]/30 backdrop-blur-xs"></div>
            </div>

            <div className="px-6 sm:px-8 pb-8 -mt-10 relative">
                {/* Shop Logo & Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div className="flex items-end gap-4">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#FAF0F3] shadow-[4px_4px_10px_#e2d7da,-4px_-4px_10px_#ffffff] bg-[#FAF0F3] shrink-0">
                            <div className="w-full h-full bg-[#FAF0F3] flex items-center justify-center text-[#E91E63] font-serif text-3xl font-bold">
                                {shopName.charAt(0)}
                            </div>
                        </div>
                        <div className="mb-1">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-serif">{shopName}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="flex items-center text-amber-500 text-xs font-semibold">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="ml-1 text-gray-800">{stats?.average_rating ?? '0.0'}</span>
                                </span>
                                <span className="text-pink-300">•</span>
                                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Open Now</span>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="px-5 py-2.5 bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all w-full sm:w-auto">
                        View Shop Page
                    </button>
                </div>

                {/* Shop Details Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Shop Description</p>
                            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
                                {user?.seller?.shop_description || "Welcome to our beautiful flower shop."}
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Store Address</p>
                            <p className="text-xs sm:text-sm text-gray-800 font-semibold">
                                {user?.seller?.address || user?.seller?.city || "Address not provided"}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] flex flex-col justify-center items-center text-center">
                            <p className="text-2xl font-bold text-gray-800 mb-0.5">{stats?.products_count ?? 0}</p>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Package className="w-3 h-3 text-[#E91E63]" />
                                Products
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] flex flex-col justify-center items-center text-center">
                            <p className="text-2xl font-bold text-gray-800 mb-0.5">{stats?.orders_count ?? 0}</p>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3 text-[#E91E63]" />
                                Orders
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
