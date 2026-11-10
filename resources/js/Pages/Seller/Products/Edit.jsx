import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import InputError from '@/Components/InputError';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SellerProductEdit({ product, categories, seller }) {
    const categoriesList = Array.isArray(categories)
        ? categories
        : (categories?.data && Array.isArray(categories.data)
            ? categories.data
            : (typeof categories === 'object' && categories !== null
                ? Object.values(categories)
                : []));

    const { data, setData, post, processing, errors } = useForm({
        flower_name: product.flower_name ?? '',
        description: product.description ?? '',
        category_id: product.category_id ?? '',
        price: product.price ?? '',
        discount_price: product.discount_price ?? '',
        stock: product.stock ?? 0,
        sku: product.sku ?? '',
        flower_type: product.flower_type ?? '',
        occasion: product.occasion ?? '',
        delivery_available: product.delivery_available ?? true,
        pickup_available: product.pickup_available ?? true,
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        is_flash_sale: product.is_flash_sale ?? false,
        thumbnail: null,
        gallery: [],
        _method: 'POST',
    });

    const [thumbnailPreview, setThumbnailPreview] = useState(
        product.thumbnail_url || null
    );
    const [galleryPreviews, setGalleryPreviews] = useState(
        product.images_url || []
    );
    const thumbnailRef = useRef();
    const galleryRef   = useRef();

    const submit = (e) => {
        e.preventDefault();
        post(route('seller.products.update', product.product_id), {
            forceFormData: true,
        });
    };

    const occasions  = ['Birthday', 'Anniversary', 'Wedding', 'Graduation', 'Sympathy', 'Thank You', 'Congratulations', 'Love', 'New Baby', 'Get Well'];
    const flowerTypes = ['Roses', 'Tulips', 'Lilies', 'Sunflowers', 'Orchids', 'Carnations', 'Mixed Bouquet', 'Dried Flowers', 'Succulents', 'Custom'];

    return (
        <SellerLayout seller={seller} title="Edit Product">
            <Head title={`Edit ${product.flower_name} — Seller Dashboard`} />
            <div className="space-y-6 pb-12">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <Link href={route('seller.products.index')} className="hover:text-[#E91E63] transition-colors">Products</Link>
                    <span>/</span>
                    <span className="text-gray-700 font-semibold">{product.flower_name}</span>
                </div>

                <form onSubmit={submit} className="space-y-6 max-w-4xl">
                    {/* Basic Info */}
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8 space-y-6">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 pb-3 border-b border-pink-200/40">Product Information</h2>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.flower_name}
                                onChange={e => setData('flower_name', e.target.value)}
                                className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 outline-none border-none transition-all"
                                required
                            />
                            <InputError message={errors.flower_name} className="mt-2" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={4}
                                className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-3 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 outline-none border-none transition-all resize-none"
                            />
                        </div>



                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Flower Type</label>
                                <select
                                    value={data.flower_type}
                                    onChange={e => setData('flower_type', e.target.value)}
                                    className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 outline-none border-none cursor-pointer transition-all"
                                >
                                    <option value="">Select type</option>
                                    {flowerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Occasion</label>
                                <select
                                    value={data.occasion}
                                    onChange={e => setData('occasion', e.target.value)}
                                    className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 outline-none border-none cursor-pointer transition-all"
                                >
                                    <option value="">Select occasion</option>
                                    {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8 space-y-6">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 pb-3 border-b border-pink-200/40">Pricing & Inventory</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { key: 'price',          label: 'Price (₱) *',     placeholder: '0.00', required: true },
                                { key: 'discount_price', label: 'Sale Price (₱)',   placeholder: 'Optional' },
                                { key: 'stock',          label: 'Stock Quantity *', placeholder: '0',    required: true },
                            ].map(({ key, label, placeholder, required }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        {label.replace('*', '').trim()} {required && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        {key !== 'stock' && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">₱</span>}
                                        <input
                                            type="number"
                                            value={data[key]}
                                            onChange={e => setData(key, e.target.value)}
                                            step={key !== 'stock' ? '0.01' : '1'}
                                            min="0"
                                            placeholder={placeholder}
                                            className={`w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 outline-none border-none transition-all ${key !== 'stock' ? 'pl-8' : ''}`}
                                            required={required}
                                        />
                                    </div>
                                    <InputError message={errors[key]} className="mt-2" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8 space-y-6">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 pb-3 border-b border-pink-200/40">Product Images</h2>

                        {/* Thumbnail */}
                        <div>
                            <p className="block text-xs font-semibold text-gray-700 mb-2">Thumbnail</p>
                            <div
                                onClick={() => thumbnailRef.current?.click()}
                                className="mt-1 flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-[#FAF0F3] shadow-[inset_4px_4px_8px_#e2d7da,inset_-4px_-4px_8px_#ffffff] p-6 border border-dashed border-pink-200 hover:border-[#E91E63] transition-colors group"
                            >
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="" className="h-24 w-24 rounded-2xl object-cover border border-pink-200/60 shadow-xs" />
                                ) : (
                                    <>
                                        <PhotoIcon className="h-10 w-10 text-pink-400 group-hover:text-[#E91E63] transition-colors" />
                                        <p className="text-xs font-semibold text-gray-700 group-hover:text-[#E91E63]">Click to change thumbnail</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={thumbnailRef}
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setData('thumbnail', file);
                                        setThumbnailPreview(URL.createObjectURL(file));
                                    }
                                }}
                                className="hidden"
                            />
                        </div>

                        {/* Gallery */}
                        <div className="pt-4 border-t border-pink-200/40">
                            <p className="block text-xs font-semibold text-gray-700 mb-2">Gallery Images (add more)</p>
                            {galleryPreviews.length > 0 && (
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {galleryPreviews.map((src, i) => (
                                        <img key={i} src={src} alt="" className="h-24 w-24 rounded-2xl object-cover border border-pink-200/60 shadow-xs" />
                                    ))}
                                </div>
                            )}
                            <div
                                onClick={() => galleryRef.current?.click()}
                                className="mt-1 flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-[#FAF0F3] shadow-[inset_4px_4px_8px_#e2d7da,inset_-4px_-4px_8px_#ffffff] p-6 border border-dashed border-pink-200 hover:border-[#E91E63] transition-colors group"
                            >
                                <PhotoIcon className="h-10 w-10 text-pink-400 group-hover:text-[#E91E63] transition-colors" />
                                <p className="text-xs font-semibold text-gray-700 group-hover:text-[#E91E63]">Click to add more gallery images</p>
                            </div>
                            <input
                                ref={galleryRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={e => {
                                    const files = Array.from(e.target.files);
                                    setData('gallery', files);
                                    const urls = files.map(f => URL.createObjectURL(f));
                                    setGalleryPreviews(prev => [...prev, ...urls]);
                                }}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8 space-y-6">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 pb-3 border-b border-pink-200/40">Settings</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { key: 'is_active',          label: 'Active / Visible' },
                                { key: 'is_featured',        label: 'Featured Product' },
                                { key: 'is_flash_sale',      label: 'Flash Sale' },
                                { key: 'delivery_available', label: 'Delivery Available' },
                                { key: 'pickup_available',   label: 'Pickup Available' },
                            ].map(({ key, label }) => (
                                <label key={key} className={`flex items-center gap-3.5 cursor-pointer rounded-2xl p-4 transition-all ${data[key] ? 'bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-[#E91E63]' : 'bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-[#E91E63]'}`}>
                                    <input
                                        type="checkbox"
                                        checked={!!data[key]}
                                        onChange={e => setData(key, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]"
                                    />
                                    <span className="text-xs sm:text-sm font-semibold">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-end pt-4">
                        <Link href={route('seller.products.index')} className="bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-[#E91E63] font-semibold px-6 py-3 rounded-full text-xs sm:text-sm transition-all">
                            Cancel
                        </Link>
                        <button type="submit" disabled={processing} className="bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white font-semibold px-8 py-3 rounded-full shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg text-xs sm:text-sm transition-all disabled:opacity-60">
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </SellerLayout>
    );
}
