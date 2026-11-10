import React, { memo, useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { MapPinIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { getProductImage } from '@/utils/productImages';

const ProductCard = memo(function ProductCard({ product, onAdd, onBuyNow, searchQuery = '', index }) {
    const { auth } = usePage().props;
    if (!product) return null;

    const displayName    = product.display_name ?? product.flower_name ?? 'Unnamed Product';
    const effectivePrice = product.effective_price ?? product.price;
    const hasDiscount    = product.discount_price && product.discount_price < product.price;
    const discountPct    = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
    const inStock        = product.stock > 0;
    
    const imgUrl = getProductImage(product);
    const imgRef = useRef(null);

    const flyToCart = () => {
        const cartIcon = document.getElementById('cart-icon-target');
        const imgEl = imgRef.current;
        if (!cartIcon || !imgEl) return;

        const iconRect = cartIcon.getBoundingClientRect();
        const imgRect  = imgEl.getBoundingClientRect();

        const clone = document.createElement('img');
        clone.src = imgUrl;
        clone.style.position   = 'fixed';
        clone.style.top        = `${imgRect.top}px`;
        clone.style.left       = `${imgRect.left}px`;
        clone.style.width      = `${imgRect.width}px`;
        clone.style.height     = `${imgRect.height}px`;
        clone.style.objectFit  = 'cover';
        clone.style.borderRadius = '12px';
        clone.style.zIndex     = '9999';
        clone.style.transition = 'all 1.1s cubic-bezier(0.25, 1, 0.5, 1)';
        clone.style.pointerEvents = 'none';
        clone.style.opacity    = '0.92';
        clone.style.boxShadow  = '0 10px 25px rgba(233,30,99,0.3)';

        document.body.appendChild(clone);
        void clone.offsetWidth; // force reflow

        setTimeout(() => {
            clone.style.top       = `${iconRect.top + iconRect.height / 2 - 15}px`;
            clone.style.left      = `${iconRect.left + iconRect.width / 2 - 15}px`;
            clone.style.width     = '30px';
            clone.style.height    = '30px';
            clone.style.opacity   = '0';
            clone.style.transform = 'scale(0.1) rotate(15deg)';
            clone.style.borderRadius = '50%';
        }, 30);

        setTimeout(() => {
            if (clone.parentNode) clone.parentNode.removeChild(clone);
            cartIcon.style.transform  = 'scale(1.25)';
            cartIcon.style.transition = 'transform 0.2s ease';
            setTimeout(() => { cartIcon.style.transform = 'scale(1)'; }, 200);
        }, 1100);
    };

    const renderHighlightedName = (name, query) => {
        if (!query) return name;
        const parts = name.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) => 
                    part.toLowerCase() === query.toLowerCase() ? (
                        <mark key={i} className="bg-pink-100 text-rose font-bold rounded-[2px] px-0.5">{part}</mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const staggerIndex = index !== undefined ? index : (product.product_id || 0);
    const delay = (staggerIndex % 8) * 0.08;
    
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <article 
            ref={cardRef}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}s`
            }}
            className="group flex flex-col h-full bg-white rounded-2xl shadow-sm border border-pink-100/60 hover:shadow-md hover:border-pink-200 relative overflow-hidden"
        >
            {/* Image Section - flush to top */}
            <Link href={route('products.show', product.product_id)} className="block relative aspect-[3/3.8] bg-[#FAF6F3] overflow-hidden shrink-0">
                <img
                    ref={imgRef}
                    src={imgUrl}
                    alt={displayName}
                    className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                />
                
                {/* Gold Featured / Sale Ribbons */}
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end pointer-events-none">
                    {product.is_featured && (
                        <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-white text-[9.5px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm shadow-md border border-amber-300/40">
                            FEATURED
                        </span>
                    )}
                    {hasDiscount && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
                            SALE
                        </span>
                    )}
                </div>

                {!inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="rounded-full bg-white px-3.5 py-1 text-xs font-bold text-gray-900 shadow-md">Out of Stock</span>
                    </div>
                )}
            </Link>

            {/* Content Section */}
            <div className="flex flex-col flex-1 text-center px-4 pt-3.5 pb-4">
                {/* Title + Sold */}
                <div className="flex items-center justify-center gap-1.5 mb-1 px-2">
                    <Link href={route('products.show', product.product_id)} className="flex items-center justify-center gap-2 min-w-0">
                        <h3 className="font-serif text-lg font-semibold text-[#1E1B2E] hover:text-rose transition-colors truncate" title={displayName}>
                            {renderHighlightedName(displayName, searchQuery)}
                        </h3>
                        {product.sales_count > 0 && (
                            <span className="text-[9px] text-gray-500 font-medium shrink-0 pt-1 border-l border-gray-200 pl-2">
                                {product.sales_count} sold
                            </span>
                        )}
                    </Link>
                </div>

                {(Number(product.average_rating) > 0 || Number(product.reviews_count) > 0) && (
                    <div className="flex items-center justify-center gap-1.5 mb-2 text-[10px]">
                        <div className="flex items-center gap-0.5 font-bold text-amber-600 shrink-0">
                            <StarSolid className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{Number(product.average_rating || 0).toFixed(1)}</span>
                            {product.reviews_count > 0 && (
                                <span className="text-[9px] text-gray-400 font-medium">({product.reviews_count})</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Price Line */}
                <div className="flex items-baseline justify-center gap-1.5 mb-3">
                    <span className="font-bold text-[#1E1B2E] text-base">₱{Number(effectivePrice).toFixed(2)}</span>
                    {hasDiscount && (
                        <span className="text-xs text-[#B5ADBD] font-normal">
                            (was <span className="line-through">₱{Number(product.price).toFixed(2)}</span>)
                        </span>
                    )}
                </div>

                {/* Seller Info Line */}
                {product.seller && (
                    <div className="flex items-center justify-center text-xs text-[#B5ADBD] mb-3 truncate">
                        <Link href={route('shop.show', product.seller.id)} className="hover:text-[#6B5F7A] transition-colors truncate">
                            {product.seller.shop_name}
                        </Link>
                        {product.seller.city && (
                            <>
                                <span className="mx-1">·</span>
                                <MapPinIcon className="h-3.5 w-3.5 inline mr-0.5" />
                                <span className="truncate">{product.seller.city}</span>
                            </>
                        )}
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action Buttons */}
                {auth?.user?.seller?.id !== product.seller_id && auth?.user?.role !== 'admin' && auth?.user?.role !== 'super_admin' && (
                    <div className="flex flex-col xl:flex-row gap-2 mt-auto pt-1">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                flyToCart();
                                onAdd?.({ ...product, name: displayName, price: effectivePrice });
                            }}
                            disabled={!inStock}
                            className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#3D3547] bg-white border border-[#E8E2EE] py-2.5 px-2 rounded-full hover:bg-pink-50 hover:border-pink-300 active:scale-[0.97] transition-all duration-200 shadow-2xs disabled:opacity-40"
                        >
                            <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Add to Cart
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                const item = {
                                    product_id: product.product_id,
                                    flower_name: product.flower_name,
                                    name: displayName,
                                    price: effectivePrice,
                                    quantity: 1,
                                    thumbnail: product.thumbnail,
                                    stock: product.stock,
                                    seller_id: product.seller_id,
                                    seller: product.seller,
                                };
                                localStorage.setItem('buy_now_item', JSON.stringify(item));
                                router.visit(route('checkout', { buy_now: 1 }));
                            }}
                            disabled={!inStock}
                            className="w-full flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-white bg-[#064E3B] hover:bg-[#043E2E] py-2.5 px-2 rounded-full shadow-xs active:scale-[0.97] transition-all duration-200 disabled:opacity-40"
                        >
                            Buy Now
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
});

export default ProductCard;
