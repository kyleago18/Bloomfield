import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import axios from 'axios';
import StoreHeader from '@/Components/StoreHeader';
import CartDrawer from '@/Components/CartDrawer';
import { useCart } from '@/Contexts/CartContext';
import { getProductImage } from '@/utils/productImages';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import {
    MapPinIcon, StarIcon as StarOutline, CheckBadgeIcon,
    ShoppingCartIcon, HeartIcon, PhoneIcon, EnvelopeIcon,
    XMarkIcon, FlagIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const occasions = ['Birthday', 'Anniversary', 'Wedding', 'Graduation', 'Sympathy', 'Thank You', 'Congratulations', 'Love', 'New Baby', 'Get Well'];
const flowerTypes = ['Roses', 'Tulips', 'Lilies', 'Sunflowers', 'Orchids', 'Carnations', 'Mixed Bouquet', 'Dried Flowers', 'Succulents', 'Custom'];

function StarRating({ rating, count }) {
    return (
        <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
                s <= Math.round(rating)
                    ? <StarSolid key={s} className="h-3.5 w-3.5 text-amber-400" />
                    : <StarOutline key={s} className="h-3.5 w-3.5 text-gray-300" />
            ))}
            {count !== undefined && (
                <span className="ml-1 text-xs text-ink-muted">({count})</span>
            )}
        </div>
    );
}

import ProductCard from '@/Components/ProductCard';

export default function SellerShopShow({ seller, following: initialFollowing, auth, recent_followers: initialRecentFollowers = [], categories_list = [] }) {
    const { addToCart } = useCart();
    const [following, setFollowing] = useState(initialFollowing);
    const [followerCount, setFollowerCount] = useState(seller.followers_count ?? 0);
    const [recentFollowers, setRecentFollowers] = useState(initialRecentFollowers);

    // Report modal state
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const reportForm = useForm({
        reason: '',
        description: '',
    });

    const handleReportSubmit = (e) => {
        e.preventDefault();
        reportForm.post(route('shop.report.store', seller.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsReportModalOpen(false);
                reportForm.reset();
            }
        });
    };

    // Product modal state & form hook
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const thumbnailRef = useRef(null);
    const galleryRef = useRef(null);

    const productForm = useForm({
        flower_name: '',
        description: '',
        category_id: '',
        price: '',
        discount_price: '',
        stock: '',
        sku: '',
        flower_type: '',
        occasion: '',
        delivery_available: true,
        pickup_available: true,
        is_active: true,
        is_featured: false,
        is_flash_sale: false,
        thumbnail: null,
        gallery: [],
        redirect_to: window.location.pathname,
    });

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        productForm.setData('thumbnail', file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const removeThumbnail = () => {
        productForm.setData('thumbnail', null);
        setThumbnailPreview(null);
        if (thumbnailRef.current) thumbnailRef.current.value = '';
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        productForm.setData('gallery', [...(productForm.data.gallery || []), ...files]);
        const urls = files.map(f => URL.createObjectURL(f));
        setGalleryPreviews(prev => [...prev, ...urls]);
    };

    const removeGalleryImage = (index) => {
        const updatedFiles = (productForm.data.gallery || []).filter((_, i) => i !== index);
        const updatedPreviews = galleryPreviews.filter((_, i) => i !== index);
        productForm.setData('gallery', updatedFiles);
        setGalleryPreviews(updatedPreviews);
    };

    const handleProductSubmit = (e) => {
        e.preventDefault();
        productForm.post(route('seller.products.store'), {
            forceFormData: true,
            onSuccess: () => {
                setIsAddProductOpen(false);
                productForm.reset();
                setThumbnailPreview(null);
                setGalleryPreviews([]);
            }
        });
    };

    const bannerInputRef = useRef(null);
    const logoInputRef   = useRef(null);
    const isOwner = auth?.user?.id === seller.user_id;

    const [pendingBanner, setPendingBanner] = useState(null); // { file, preview }
    const [pendingLogo,   setPendingLogo]   = useState(null);
    const [saving, setSaving] = useState(false);

    const pickFile = (field, file) => {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('File is too large! Please select an image under 2MB.');
            return;
        }
        const preview = URL.createObjectURL(file);
        if (field === 'shop_banner') setPendingBanner({ file, preview });
        else setPendingLogo({ file, preview });
    };

    const saveImage = async (field) => {
        const pending = field === 'shop_banner' ? pendingBanner : pendingLogo;
        if (!pending) return;
        setSaving(true);
        const formData = new FormData();
        formData.append(field, pending.file);
        try {
            await axios.post('/seller/shop/image', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                },
            });
            window.location.reload();
        } catch (err) {
            console.error('Upload failed:', err.response?.data ?? err);
            const msg = err.response?.data?.message || 'Failed to upload image. Please ensure it is a valid image and under 2MB.';
            alert(msg);
            setSaving(false);
        }
    };

    const cancelPending = (field) => {
        if (field === 'shop_banner') setPendingBanner(null);
        else setPendingLogo(null);
    };

    const [catFilter, setCatFilter] = useState(null);

    const handleFollow = async () => {
        if (!auth?.user) { window.location.href = '/login'; return; }
        
        // Optimistic update
        const isFollowing = following;
        setFollowing(!isFollowing);
        setFollowerCount(c => Math.max(0, isFollowing ? c - 1 : c + 1));

        try {
            const res = await axios.post(route('shop.follow', seller.id));
            if (res.data && typeof res.data.follower_count === 'number') {
                setFollowerCount(res.data.follower_count);
            }
            if (res.data && typeof res.data.following === 'boolean') {
                setFollowing(res.data.following);
            }
            if (res.data && res.data.recent_followers) {
                setRecentFollowers(res.data.recent_followers);
            }
        } catch (error) {
            // Revert on failure
            setFollowing(isFollowing);
            setFollowerCount(c => isFollowing ? c + 1 : Math.max(0, c - 1));
        }
    };



    const categories = [...new Set(seller.products.map(p => p.category?.name).filter(Boolean))];
    const filteredProducts = catFilter
        ? seller.products.filter(p => p.category?.name === catFilter)
        : seller.products;


    return (
        <>
            <Head title={`${seller.shop_name} — Bloom&Glow`} />
            <CartDrawer />
            <div className="store-shell">
                <StoreHeader auth={auth} />

                {/* Banner */}
                <div className="relative h-48 md:h-64 overflow-hidden group/banner">
                    {/* Show pending preview or current banner */}
                    {(pendingBanner?.preview || seller.shop_banner_url) ? (
                        <img
                            src={pendingBanner?.preview ?? seller.shop_banner_url}
                            alt={`${seller.shop_name} banner`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent pointer-events-none" />

                    {isOwner && (
                        <>
                            <input
                                ref={bannerInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => pickFile('shop_banner', e.target.files[0])}
                            />
                            {pendingBanner ? (
                                /* Save / Cancel bar */
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                                    <button
                                        type="button"
                                        onClick={() => saveImage('shop_banner')}
                                        disabled={saving}
                                        className="bg-rose text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg hover:bg-rose-dark transition-colors disabled:opacity-60"
                                    >
                                        {saving ? 'Saving…' : 'Save Banner'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => cancelPending('shop_banner')}
                                        className="bg-white/90 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow hover:bg-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                /* Hover to change */
                                <button
                                    type="button"
                                    onClick={() => bannerInputRef.current?.click()}
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity bg-black/30 cursor-pointer"
                                >
                                    <span className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Upload Banner
                                    </span>
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Shop header */}
                <div className="store-container">
                    <div className="relative -mt-14 mb-8 flex flex-wrap items-end justify-between gap-5">
                        <div className="flex items-end gap-5">
                            {/* Logo - clickable for owner */}
                            {isOwner ? (
                                <div className="relative group/logo">
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => pickFile('shop_logo', e.target.files[0])}
                                    />
                                    {/* Logo image (preview or current) */}
                                    <div className="cursor-pointer" onClick={() => !pendingLogo && logoInputRef.current?.click()}>
                                        {(pendingLogo?.preview || seller.shop_logo_url) ? (
                                            <img
                                                src={pendingLogo?.preview ?? seller.shop_logo_url}
                                                alt={seller.shop_name}
                                                className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-soft"
                                            />
                                        ) : (
                                            <div className="h-24 w-24 rounded-2xl bg-rose-light border-4 border-white shadow-soft flex items-center justify-center text-rose text-3xl font-bold">
                                                {seller.shop_name?.charAt(0)}
                                            </div>
                                        )}
                                        {!pendingLogo && (
                                            <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity bg-black/40">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    {/* Save / Cancel for logo */}
                                    {pendingLogo && (
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => saveImage('shop_logo')}
                                                disabled={saving}
                                                className="bg-rose text-white text-[10px] font-bold px-3 py-1 rounded-full shadow hover:bg-rose-dark transition-colors disabled:opacity-60"
                                            >
                                                {saving ? 'Saving…' : 'Save'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => cancelPending('shop_logo')}
                                                className="bg-white text-gray-600 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow border hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : seller.shop_logo_url ? (
                                <img
                                    src={seller.shop_logo_url}
                                    alt={seller.shop_name}
                                    className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-soft"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-2xl bg-rose-light border-4 border-white shadow-soft flex items-center justify-center text-rose text-3xl font-bold">
                                    {seller.shop_name?.charAt(0)}
                                </div>
                            )}
                            <div className="pb-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="font-serif text-2xl md:text-3xl font-semibold text-ink">{seller.shop_name}</h1>
                                    {seller.is_verified && (
                                        <CheckBadgeIcon className="h-5 w-5 text-sky-500" />
                                    )}
                                </div>
                                <p className="text-sm text-ink-muted">by {seller.owner_name}</p>
                            </div>
                        </div>
                        {/* No pill for owner - followers shown in stats bar */}
                        {!isOwner && auth?.user?.role !== 'admin' && auth?.user?.role !== 'super_admin' ? (
                            <div className="flex gap-2 items-center">
                                <button
                                    type="button"
                                    onClick={handleFollow}
                                    className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all shadow-soft
                                        ${following ? 'bg-rose text-white hover:bg-rose-dark' : 'btn-secondary'}`}
                                >
                                    {following ? 'Following ✓' : '+ Follow Shop'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsReportModalOpen(true)}
                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Report this shop"
                                >
                                    <FlagIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ) : isOwner ? (
                            <button
                                type="button"
                                onClick={() => setIsAddProductOpen(true)}
                                className="rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-soft flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Product
                            </button>
                        ) : null}
                    </div>

                    {/* Stats bar */}
                    <div className="flex flex-wrap gap-6 mb-8 text-sm items-center">
                        <div>
                            <span className="font-bold text-ink">{seller.products.length}</span>
                            <span className="text-ink-muted ml-1">Products</span>
                        </div>
                        <div>
                            <span className="font-bold text-ink">{seller.average_rating}</span>
                            <span className="text-ink-muted ml-1">Rating</span>
                        </div>
                        
                        {/* Followers with Hover Preview */}
                        <div className="relative group/followers cursor-pointer">
                            <span className="font-bold text-ink">{followerCount}</span>
                            <span className="text-ink-muted ml-1 hover:text-rose transition-colors">Followers</span>

                            {/* Hover Preview Tooltip */}
                            <div className="absolute left-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-rose-100 p-3.5 z-50 invisible group-hover/followers:visible opacity-0 group-hover/followers:opacity-100 transition-all duration-200 pointer-events-none">
                                <div className="border-b border-rose-100/80 pb-2 mb-2.5">
                                    <span className="text-xs font-semibold text-ink">Recent Followers</span>
                                </div>
                                {(!recentFollowers || recentFollowers.length === 0) ? (
                                    <p className="text-xs text-ink-muted font-medium py-1">No followers yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {recentFollowers.map((f, idx) => {
                                            const followerName = f.user?.name || (f.user?.first_name ? `${f.user.first_name} ${f.user.last_name || ''}`.trim() : 'Customer');
                                            return (
                                                <div key={f.id || idx} className="flex items-center gap-2.5">
                                                    {f.user?.avatar_url ? (
                                                        <img
                                                            src={f.user.avatar_url}
                                                            alt={followerName}
                                                            className="w-6 h-6 rounded-full object-cover border border-rose-200/60 shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose to-rose-dark text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                                                            {followerName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="text-xs font-medium text-ink truncate">• {followerName}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        {seller.city && (
                            <div className="flex items-center gap-1 text-ink-muted">
                                <MapPinIcon className="h-4 w-4" />
                                <span>{seller.city}, {seller.province}</span>
                            </div>
                        )}
                        {seller.phone_number && (
                            <div className="flex items-center gap-1 text-ink-muted">
                                <PhoneIcon className="h-4 w-4" />
                                <span>{seller.phone_number}</span>
                            </div>
                        )}
                        {seller.email && (
                            <div className="flex items-center gap-1 text-ink-muted">
                                <EnvelopeIcon className="h-4 w-4" />
                                <span>{seller.email}</span>
                            </div>
                        )}
                    </div>

                    {seller.shop_description && (
                        <p className="text-ink-muted leading-relaxed mb-8 max-w-2xl">{seller.shop_description}</p>
                    )}

                    {/* Category filter */}
                    {categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            <button
                                type="button"
                                onClick={() => setCatFilter(null)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors
                                    ${!catFilter ? 'bg-rose text-white' : 'bg-rose-light/60 text-ink-muted hover:text-rose'}`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCatFilter(cat)}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors
                                        ${catFilter === cat ? 'bg-rose text-white' : 'bg-rose-light/60 text-ink-muted hover:text-rose'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Products grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="py-20 text-center text-ink-muted">No products available yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-16">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.product_id}
                                    product={product}
                                    onAdd={addToCart}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Product Modal */}
            <Modal show={isAddProductOpen} onClose={() => setIsAddProductOpen(false)} maxWidth="5xl">
                <div className="bg-[#FAF0F3] p-6 sm:p-8 rounded-[28px]">
                    <div className="flex justify-between items-center mb-6 pb-3 border-b border-pink-200/40">
                        <h2 className="text-xl sm:text-2xl font-serif font-semibold text-gray-800 tracking-tight">
                            Add Product
                        </h2>
                        <button
                            type="button"
                            onClick={() => setIsAddProductOpen(false)}
                            className="p-1 rounded-full hover:bg-pink-100/50 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleProductSubmit} className="max-h-[75vh] overflow-y-auto pr-2 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
                        {/* Main Information (Left Column) */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* General Information */}
                            <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 space-y-5">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 border-b border-pink-200/40 pb-2">
                                    General Information
                                </h3>

                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={productForm.data.flower_name}
                                        onChange={e => productForm.setData('flower_name', e.target.value)}
                                        placeholder="e.g. Red Rose Bouquet"
                                        className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all"
                                        required
                                    />
                                    <InputError message={productForm.errors.flower_name} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={productForm.data.description}
                                        onChange={e => productForm.setData('description', e.target.value)}
                                        rows={4}
                                        placeholder="Write a clear description of the arrangement, flowers included, and care instructions..."
                                        className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-3 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all resize-none"
                                    />
                                    <InputError message={productForm.errors.description} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                            Flower Type
                                        </label>
                                        <select
                                            value={productForm.data.flower_type}
                                            onChange={e => productForm.setData('flower_type', e.target.value)}
                                            className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 focus:outline-none border-none cursor-pointer transition-all"
                                        >
                                            <option value="">Select flower type</option>
                                            {flowerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                            Occasion
                                        </label>
                                        <select
                                            value={productForm.data.occasion}
                                            onChange={e => productForm.setData('occasion', e.target.value)}
                                            className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 focus:outline-none border-none cursor-pointer transition-all"
                                        >
                                            <option value="">Select occasion</option>
                                            {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {categories_list && categories_list.length > 0 && (
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={productForm.data.category_id}
                                            onChange={e => productForm.setData('category_id', e.target.value)}
                                            className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 focus:outline-none border-none cursor-pointer transition-all"
                                        >
                                            <option value="">Select a category</option>
                                            {categories_list.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={productForm.errors.category_id} className="mt-1" />
                                    </div>
                                )}
                            </div>

                            {/* Pricing & Stock */}
                            <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 space-y-5">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 border-b border-pink-200/40 pb-2">
                                    Pricing & Inventory
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                            Price (₱) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">₱</span>
                                            <input
                                                type="number"
                                                value={productForm.data.price}
                                                onChange={e => productForm.setData('price', e.target.value)}
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl pl-8 pr-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all"
                                                required
                                            />
                                        </div>
                                        <InputError message={productForm.errors.price} className="mt-1" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                            Sale Price (₱)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">₱</span>
                                            <input
                                                type="number"
                                                value={productForm.data.discount_price}
                                                onChange={e => productForm.setData('discount_price', e.target.value)}
                                                step="0.01"
                                                min="0"
                                                placeholder="Optional"
                                                className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl pl-8 pr-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all"
                                            />
                                        </div>
                                        <InputError message={productForm.errors.discount_price} className="mt-1" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                            Stock Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={productForm.data.stock}
                                            onChange={e => productForm.setData('stock', e.target.value)}
                                            min="0"
                                            placeholder="0"
                                            className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all"
                                            required
                                        />
                                        <InputError message={productForm.errors.stock} className="mt-1" />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Fulfillment Options
                                    </label>
                                    <div className="flex flex-wrap gap-6">
                                        <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!productForm.data.delivery_available}
                                                onChange={e => productForm.setData('delivery_available', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]"
                                            />
                                            <span>Delivery available</span>
                                        </label>

                                        <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!productForm.data.pickup_available}
                                                onChange={e => productForm.setData('pickup_available', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]"
                                            />
                                            <span>Pickup available</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Media & Status (Right Column) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Media */}
                            <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 space-y-4">
                                <h3 className="text-sm font-semibold text-gray-800 border-b border-pink-200/40 pb-2">
                                    Product Images
                                </h3>

                                {/* Thumbnail */}
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Cover Photo <span className="text-red-500">*</span>
                                    </label>

                                    {thumbnailPreview ? (
                                        <div className="relative rounded-2xl border border-pink-200/60 overflow-hidden bg-[#FAF0F3]">
                                            <img src={thumbnailPreview} alt="Cover preview" className="w-full h-40 object-cover" />
                                            <div className="p-2 flex gap-2 justify-end bg-[#FAF0F3] border-t border-pink-200/40">
                                                <button
                                                    type="button"
                                                    onClick={() => thumbnailRef.current?.click()}
                                                    className="text-xs font-medium text-gray-700 hover:text-pink-600 px-3 py-1 rounded-full bg-[#FAF0F3] shadow-[2px_2px_5px_#e2d7da,-2px_-2px_5px_#ffffff]"
                                                >
                                                    Change
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={removeThumbnail}
                                                    className="text-xs font-medium text-red-600 hover:text-red-700 px-3 py-1 rounded-full bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => thumbnailRef.current?.click()}
                                            className="bg-[#FAF0F3] shadow-[inset_4px_4px_8px_#e2d7da,inset_-4px_-4px_8px_#ffffff] rounded-2xl p-6 text-center cursor-pointer border border-dashed border-pink-200 hover:border-[#E91E63] transition-colors"
                                        >
                                            <p className="text-xs font-semibold text-gray-700">Click to upload cover photo</p>
                                            <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 3MB</p>
                                        </div>
                                    )}

                                    <input
                                        ref={thumbnailRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        className="hidden"
                                    />
                                    <InputError message={productForm.errors.thumbnail} className="mt-1" />
                                </div>

                                {/* Gallery */}
                                <div className="pt-2">
                                    <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Additional Images
                                    </label>

                                    {galleryPreviews.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            {galleryPreviews.map((src, idx) => (
                                                <div key={idx} className="relative rounded-xl border border-pink-200/60 overflow-hidden group aspect-square">
                                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryImage(idx)}
                                                        className="absolute top-1 right-1 p-0.5 rounded bg-black/60 text-white hover:bg-black"
                                                    >
                                                        <XMarkIcon className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => galleryRef.current?.click()}
                                        className="w-full py-2 px-4 text-xs font-semibold text-gray-700 bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] rounded-full hover:text-[#E91E63] transition-all"
                                    >
                                        + Add gallery photos
                                    </button>

                                    <input
                                        ref={galleryRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleGalleryChange}
                                        className="hidden"
                                    />
                                    <InputError message={productForm.errors.gallery} className="mt-1" />
                                </div>
                            </div>

                            {/* Status & Options */}
                            <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 space-y-4">
                                <h3 className="text-sm font-semibold text-gray-800 border-b border-pink-200/40 pb-2">
                                    Status & Visibility
                                </h3>

                                <div className="space-y-3">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-800 block">Active Product</span>
                                            <span className="text-[10px] text-gray-400">Visible in shop</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={!!productForm.data.is_active}
                                            onChange={e => productForm.setData('is_active', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63] cursor-pointer"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-pink-200/40">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-800 block">Featured Product</span>
                                            <span className="text-[10px] text-gray-400">Featured listings</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={!!productForm.data.is_featured}
                                            onChange={e => productForm.setData('is_featured', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63] cursor-pointer"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-pink-200/40">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-800 block">Flash Sale</span>
                                            <span className="text-[10px] text-gray-400">Flash sale promotions</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={!!productForm.data.is_flash_sale}
                                            onChange={e => productForm.setData('is_flash_sale', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63] cursor-pointer"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Submit Actions */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddProductOpen(false)}
                                    className="flex-1 text-center bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-[#E91E63] font-semibold px-4 py-2.5 rounded-full text-xs transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={productForm.processing}
                                    className="flex-1 bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white font-semibold px-5 py-2.5 rounded-full shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg text-xs transition-all disabled:opacity-60"
                                >
                                    {productForm.processing ? 'Saving...' : 'Add Product'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Report Shop Modal */}
            <Modal show={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} maxWidth="md">
                <div className="bg-white p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Report Shop</h2>
                        <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleReportSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for reporting</label>
                            <select
                                value={reportForm.data.reason}
                                onChange={e => reportForm.setData('reason', e.target.value)}
                                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-rose focus:ring-rose text-sm"
                                required
                            >
                                <option value="">Select a reason</option>
                                <option value="Inappropriate Content">Inappropriate Content</option>
                                <option value="Scam or Fraud">Scam or Fraud</option>
                                <option value="Counterfeit Items">Counterfeit Items</option>
                                <option value="Prohibited Items">Selling Prohibited Items</option>
                                <option value="Non-delivery of Items">Non-delivery of Items</option>
                                <option value="Other">Other</option>
                            </select>
                            <InputError message={reportForm.errors.reason} className="mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Details (Optional)</label>
                            <textarea
                                value={reportForm.data.description}
                                onChange={e => reportForm.setData('description', e.target.value)}
                                rows={4}
                                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-rose focus:ring-rose text-sm resize-none"
                                placeholder="Please provide any additional details..."
                            />
                            <InputError message={reportForm.errors.description} className="mt-1" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsReportModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={reportForm.processing}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors disabled:opacity-50"
                            >
                                Submit Report
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
