import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import InputError from '@/Components/InputError';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function SellerProductCreate({ categories, seller }) {
    // Robust categories normalization to prevent categories.map errors
    const categoriesList = Array.isArray(categories)
        ? categories
        : (categories?.data && Array.isArray(categories.data)
            ? categories.data
            : (typeof categories === 'object' && categories !== null
                ? Object.values(categories)
                : []));

    const { data, setData, post, processing, errors } = useForm({
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
    });

    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const thumbnailRef = useRef(null);
    const galleryRef = useRef(null);

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('thumbnail', file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const removeThumbnail = () => {
        setData('thumbnail', null);
        setThumbnailPreview(null);
        if (thumbnailRef.current) thumbnailRef.current.value = '';
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setData('gallery', [...(data.gallery || []), ...files]);
        const urls = files.map(f => URL.createObjectURL(f));
        setGalleryPreviews(prev => [...prev, ...urls]);
    };

    const removeGalleryImage = (index) => {
        const updatedFiles = (data.gallery || []).filter((_, i) => i !== index);
        const updatedPreviews = galleryPreviews.filter((_, i) => i !== index);
        setData('gallery', updatedFiles);
        setGalleryPreviews(updatedPreviews);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('seller.products.store'), {
            forceFormData: true,
        });
    };

    const occasions = ['Birthday', 'Anniversary', 'Wedding', 'Graduation', 'Sympathy', 'Thank You', 'Congratulations', 'Love', 'New Baby', 'Get Well'];
    const flowerTypes = ['Roses', 'Tulips', 'Lilies', 'Sunflowers', 'Orchids', 'Carnations', 'Mixed Bouquet', 'Dried Flowers', 'Succulents', 'Custom'];

    return (
        <SellerLayout seller={seller} title="Add Product">
            <Head title="Add Product — Seller Dashboard" />

            <div className="space-y-6 pb-16">
                {/* Breadcrumbs & Title */}
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1">
                        <Link href={route('seller.products.index')} className="hover:text-[#E91E63] transition-colors">Products</Link>
                        <span>/</span>
                        <span className="text-gray-700 font-semibold">Add Product</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-serif font-semibold text-gray-800 tracking-tight">Add Product</h1>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Information (Left Column) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* General Information */}
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8 space-y-5">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-pink-200/40 pb-3">
                                General Information
                            </h2>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.flower_name}
                                    onChange={e => setData('flower_name', e.target.value)}
                                    placeholder="e.g. Red Rose Bouquet"
                                    className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all"
                                    required
                                />
                                <InputError message={errors.flower_name} className="mt-1" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="Write a clear description of the arrangement, flowers included, and care instructions..."
                                    className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-3 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all resize-none"
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Flower Type
                                    </label>
                                    <select
                                        value={data.flower_type}
                                        onChange={e => setData('flower_type', e.target.value)}
                                        className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 focus:outline-none border-none cursor-pointer transition-all"
                                    >
                                        <option value="">Select flower type</option>
                                        {flowerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Occasion
                                    </label>
                                    <select
                                        value={data.occasion}
                                        onChange={e => setData('occasion', e.target.value)}
                                        className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 focus:outline-none border-none cursor-pointer transition-all"
                                    >
                                        <option value="">Select occasion</option>
                                        {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Stock */}
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8 space-y-5">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-pink-200/40 pb-3">
                                Pricing & Inventory
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Price (₱) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">₱</span>
                                        <input
                                            type="number"
                                            value={data.price}
                                            onChange={e => setData('price', e.target.value)}
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl pl-8 pr-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.price} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Sale Price (₱)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">₱</span>
                                        <input
                                            type="number"
                                            value={data.discount_price}
                                            onChange={e => setData('discount_price', e.target.value)}
                                            step="0.01"
                                            min="0"
                                            placeholder="Optional"
                                            className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl pl-8 pr-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all"
                                        />
                                    </div>
                                    <InputError message={errors.discount_price} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Stock Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.stock}
                                        onChange={e => setData('stock', e.target.value)}
                                        min="0"
                                        placeholder="0"
                                        className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all"
                                        required
                                    />
                                    <InputError message={errors.stock} className="mt-1" />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                    Fulfillment Options
                                </label>
                                <div className="flex flex-wrap gap-6">
                                    <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!data.delivery_available}
                                            onChange={e => setData('delivery_available', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]"
                                        />
                                        <span>Delivery available</span>
                                    </label>

                                    <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!data.pickup_available}
                                            onChange={e => setData('pickup_available', e.target.checked)}
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
                            <h2 className="text-base font-semibold text-gray-800 border-b border-pink-200/40 pb-3">
                                Product Images
                            </h2>

                            {/* Thumbnail */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                    Cover Photo <span className="text-red-500">*</span>
                                </label>

                                {thumbnailPreview ? (
                                    <div className="relative rounded-2xl border border-pink-200/60 overflow-hidden bg-[#FAF0F3]">
                                        <img src={thumbnailPreview} alt="Cover preview" className="w-full h-48 object-cover" />
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
                                        <p className="text-xs sm:text-sm font-semibold text-gray-700">Click to upload cover photo</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 3MB</p>
                                    </div>
                                )}

                                <input
                                    ref={thumbnailRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                />
                                <InputError message={errors.thumbnail} className="mt-1" />
                            </div>

                            {/* Gallery */}
                            <div className="pt-2">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
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
                                    className="w-full py-2.5 px-4 text-xs font-semibold text-gray-700 bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] rounded-full hover:text-[#E91E63] transition-all"
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
                                <InputError message={errors.gallery} className="mt-1" />
                            </div>
                        </div>

                        {/* Status & Options */}
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 space-y-4">
                            <h2 className="text-base font-semibold text-gray-800 border-b border-pink-200/40 pb-3">
                                Status & Visibility
                            </h2>

                            <div className="space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <span className="text-xs sm:text-sm font-semibold text-gray-800 block">Active Product</span>
                                        <span className="text-xs text-gray-400">Visible to customers in shop</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={!!data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63] cursor-pointer"
                                    />
                                </label>

                                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-pink-200/40">
                                    <div>
                                        <span className="text-xs sm:text-sm font-semibold text-gray-800 block">Featured Product</span>
                                        <span className="text-xs text-gray-400">Highlight in featured listings</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={!!data.is_featured}
                                        onChange={e => setData('is_featured', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63] cursor-pointer"
                                    />
                                </label>

                                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-pink-200/40">
                                    <div>
                                        <span className="text-xs sm:text-sm font-semibold text-gray-800 block">Flash Sale</span>
                                        <span className="text-xs text-gray-400">Include in flash sale promotions</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={!!data.is_flash_sale}
                                        onChange={e => setData('is_flash_sale', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63] cursor-pointer"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            <Link
                                href={route('seller.products.index')}
                                className="flex-1 text-center bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-[#E91E63] font-semibold px-4 py-3 rounded-full text-xs sm:text-sm transition-all"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white font-semibold px-5 py-3 rounded-full shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg text-xs sm:text-sm transition-all disabled:opacity-60"
                            >
                                {processing ? 'Saving...' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </SellerLayout>
    );
}
