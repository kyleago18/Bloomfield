import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import InputError from '@/Components/InputError';
import AddressDropdowns from '@/Components/AddressDropdowns';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

export default function SellerShopEdit({ seller }) {
    const { data, setData, post, processing, errors } = useForm({
        shop_name:        seller.shop_name ?? '',
        owner_name:       seller.owner_name ?? '',
        email:            seller.email ?? '',
        phone_number:     seller.phone_number ?? '',
        shop_description: seller.shop_description ?? '',
        address:          seller.address ?? '',
        barangay:         seller.barangay ?? '',
        city:             seller.city ?? '',
        province:         seller.province ?? '',
        postal_code:      seller.postal_code ?? '',
        latitude:         seller.latitude ?? '',
        longitude:        seller.longitude ?? '',
        shop_logo:        null,
        shop_banner:      null,
        _method:          'POST',
    });

    const [logoPreview,   setLogoPreview]   = useState(seller.shop_logo_url);
    const [bannerPreview, setBannerPreview] = useState(seller.shop_banner_url);
    const logoRef   = useRef();
    const bannerRef = useRef();

    const submit = (e) => {
        e.preventDefault();
        post(route('seller.shop.update'), { forceFormData: true });
    };

    return (
        <SellerLayout seller={seller} title="My Shop">
            <Head title="Shop Profile — Seller Dashboard" />
            
            <div className="space-y-6 pb-12">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-serif font-semibold text-gray-800 tracking-tight">Shop Profile</h2>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 font-normal">Manage your public storefront details and branding.</p>
                    </div>
                    {seller.status === 'approved' && (
                        <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 shadow-xs">
                            <CheckBadgeIcon className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-700">Verified Shop</span>
                        </div>
                    )}
                    {seller.status === 'pending' && (
                        <div className="flex items-center gap-2 rounded-full bg-yellow-50 border border-yellow-200 px-3.5 py-1.5 shadow-xs">
                            <span className="text-xs font-semibold text-yellow-700">Verification Pending</span>
                        </div>
                    )}
                    {(seller.status === 'unverified' || seller.status === 'rejected') && (
                        <div className="flex items-center gap-2 rounded-full bg-gray-50 border border-gray-200 px-3.5 py-1.5 shadow-xs">
                            <span className="text-xs font-semibold text-gray-700">
                                {seller.status === 'rejected' ? 'Verification Rejected' : 'Unverified Shop'}
                            </span>
                        </div>
                    )}
                </div>

                <form onSubmit={submit} className="space-y-6">
                    
                    {/* Branding Section */}
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8 space-y-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 pb-3 border-b border-pink-200/40">Shop Branding</h3>
                        
                        <div className="space-y-6">
                            {/* Banner preview */}
                            <div className="space-y-2.5">
                                <label className="text-xs font-semibold text-gray-700">Shop Banner</label>
                                <div
                                    onClick={() => bannerRef.current?.click()}
                                    className="relative cursor-pointer rounded-2xl overflow-hidden bg-[#FAF0F3] shadow-[inset_4px_4px_8px_#e2d7da,inset_-4px_-4px_8px_#ffffff] h-[200px] flex items-center justify-center border border-pink-200/60 hover:border-[#E91E63] transition-colors group"
                                >
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Shop Banner" className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[#E91E63] transition-colors">
                                            <PhotoIcon className="h-10 w-10 text-pink-400" />
                                            <span className="text-xs font-medium">Click to upload shop banner (1200×300)</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={bannerRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => {
                                        const f = e.target.files[0];
                                        if (f) { setData('shop_banner', f); setBannerPreview(URL.createObjectURL(f)); }
                                    }}
                                />
                            </div>

                            {/* Logo */}
                            <div className="flex items-center gap-6 p-5 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                <div
                                    onClick={() => logoRef.current?.click()}
                                    className="relative cursor-pointer shrink-0 group w-24 h-24 max-w-[96px] max-h-[96px] rounded-2xl overflow-hidden"
                                >
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover rounded-2xl shadow-xs" />
                                    ) : (
                                        <div className="w-full h-full rounded-2xl bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] flex items-center justify-center text-pink-400 group-hover:text-[#E91E63] transition-colors">
                                            <PhotoIcon className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-800">Shop Logo</p>
                                    <p className="text-xs text-gray-400 mt-1">Square image recommended (PNG, JPG up to 2MB)</p>
                                    <button
                                        type="button"
                                        onClick={() => logoRef.current?.click()}
                                        className="mt-3 inline-flex items-center justify-center px-4 py-2 bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-xs font-semibold text-gray-700 rounded-full hover:text-[#E91E63] transition-all"
                                    >
                                        Change logo
                                    </button>
                                </div>
                                <input
                                    ref={logoRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => {
                                        const f = e.target.files[0];
                                        if (f) { setData('shop_logo', f); setLogoPreview(URL.createObjectURL(f)); }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Shop details */}
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8 space-y-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 pb-3 border-b border-pink-200/40">Shop Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Shop Name <span className="text-red-500">*</span></label>
                                <input type="text" value={data.shop_name} onChange={e => setData('shop_name', e.target.value)}
                                    className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 outline-none border-none transition-all" required />
                                <InputError message={errors.shop_name} className="mt-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Owner Name <span className="text-red-500">*</span></label>
                                <input type="text" value={data.owner_name} onChange={e => setData('owner_name', e.target.value)}
                                    className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 outline-none border-none transition-all" required />
                                <InputError message={errors.owner_name} className="mt-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                    className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 outline-none border-none transition-all" required />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Phone Number</label>
                                <input type="text" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)}
                                    className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 outline-none border-none transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">Shop Description</label>
                            <textarea value={data.shop_description} onChange={e => setData('shop_description', e.target.value)}
                                rows={4} placeholder="Tell customers about your shop, your story, what makes your flowers special…"
                                className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-3 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 outline-none border-none transition-all resize-none" />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8 space-y-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 pb-3 border-b border-pink-200/40">Location Details</h3>
                        
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">Street Address</label>
                            <input type="text" value={data.address} onChange={e => setData('address', e.target.value)}
                                placeholder="123 Flower Street"
                                className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 outline-none border-none transition-all" />
                        </div>
                        <AddressDropdowns
                            provinceValue={data.province}
                            cityValue={data.city}
                            barangayValue={data.barangay}
                            onProvinceChange={(val) => setData('province', val)}
                            onCityChange={(val) => setData('city', val)}
                            onBarangayChange={(val) => setData('barangay', val)}
                            variant="standard"
                            errors={errors}
                        />

                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">Postal Code</label>
                            <input
                                type="text"
                                value={data.postal_code}
                                onChange={e => setData('postal_code', e.target.value)}
                                className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 outline-none border-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-pink-200/40">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Latitude</label>
                                <input type="number" step="any" value={data.latitude} onChange={e => setData('latitude', e.target.value)}
                                    className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 outline-none border-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Longitude</label>
                                <input type="number" step="any" value={data.longitude} onChange={e => setData('longitude', e.target.value)}
                                    className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 outline-none border-none transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={processing} className="bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white font-semibold px-8 py-3 rounded-full shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all text-xs sm:text-sm">
                            {processing ? 'Saving Changes...' : 'Save Shop Profile'}
                        </button>
                    </div>
                </form>

                {/* Followers Section */}
                <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-pink-200/40">
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Followers</h3>
                            <p className="mt-1 text-xs text-gray-500">Customers who follow your shop</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-[#FAF0F3] shadow-[inset_2px_2px_5px_#e2d7da,inset_-2px_-2px_5px_#ffffff] px-4 py-1.5 text-pink-700 font-semibold">
                            <span className="text-base font-bold">{seller.followers_count?.toLocaleString() || 0}</span>
                            <span className="text-xs">Followers</span>
                        </div>
                    </div>

                    {!seller.follows || seller.follows.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-400 font-medium">
                            No followers yet. Keep up the good work and they will come!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {seller.follows.map(follow => (
                                <div key={follow.id} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#FAF0F3] shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff]">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white font-semibold flex items-center justify-center shrink-0 shadow-xs text-sm">
                                        {follow.user?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-gray-800 truncate">{follow.user?.name}</p>
                                        <p className="text-[11px] text-gray-400 truncate">
                                            Followed {new Date(follow.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SellerLayout>
    );
}
