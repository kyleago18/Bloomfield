import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

import StoreHeader from '@/Components/StoreHeader';
import CartDrawer from '@/Components/CartDrawer';
import { useCart } from '@/Contexts/CartContext';
import { getProductImage } from '@/utils/productImages';
import ScrollReveal from '@/Components/ScrollReveal';
import {
    StarIcon, ShoppingCartIcon, ShoppingBagIcon,
    MapPinIcon, TruckIcon, BuildingStorefrontIcon, CheckBadgeIcon, LockClosedIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

function StarRating({ rating, count }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
                s <= Math.round(rating)
                    ? <StarSolid key={s} className="h-4 w-4 text-amber-400" />
                    : <StarIcon key={s} className="h-4 w-4 text-gray-300" />
            ))}
            {count !== undefined && (
                <span className="ml-1 text-xs text-ink-muted">({count})</span>
            )}
        </div>
    );
}

export default function ProductShow({ product, hasPurchased, hasReviewed, related, sellerProducts, frequentlyBoughtTogether = [], completeYourGift = [], auth }) {
    const { addToCart } = useCart();
    const [activeImage, setActiveImage] = useState(0);
    const [qty, setQty]                 = useState(1);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ rating: 5, comment: '' });

    const mainImg = getProductImage(product);
    const images = Array.from(new Set([
        mainImg,
        ...(product.images_url ?? []),
    ])).filter(Boolean);

    const isAdmin = auth?.user?.role === 'admin' || auth?.user?.role === 'super_admin';

    const displayName    = product.name ?? product.flower_name;
    const effectivePrice = product.discount_price ?? product.price;
    const hasDiscount    = product.discount_price && product.discount_price < product.price;
    const discountPct    = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
    const inStock        = product.stock > 0;


    const handleAddToCart = () => {
        const cartIcon = document.getElementById('cart-icon-target');
        const productImage = document.getElementById(`product-image-${product.product_id}`);

        if (cartIcon && productImage) {
            const iconRect = cartIcon.getBoundingClientRect();
            const imgRect = productImage.getBoundingClientRect();
            
            const clone = productImage.cloneNode();
            clone.style.position = 'fixed';
            clone.style.top = `${imgRect.top}px`;
            clone.style.left = `${imgRect.left}px`;
            clone.style.width = `${imgRect.width}px`;
            clone.style.height = `${imgRect.height}px`;
            clone.style.objectFit = 'cover';
            clone.style.borderRadius = '12px';
            clone.style.zIndex = '9999';
            clone.style.transition = 'all 1.1s cubic-bezier(0.25, 1, 0.5, 1)';
            clone.style.pointerEvents = 'none';
            clone.style.opacity = '0.92';
            clone.style.boxShadow = '0 10px 25px rgba(233,30,99,0.3)';

            document.body.appendChild(clone);

            // Force reflow so the browser registers the initial position before transitioning
            void clone.offsetWidth;

            // Animate
            setTimeout(() => {
                clone.style.top = `${iconRect.top + iconRect.height / 2 - 15}px`;
                clone.style.left = `${iconRect.left + iconRect.width / 2 - 15}px`;
                clone.style.width = '30px';
                clone.style.height = '30px';
                clone.style.opacity = '0';
                clone.style.transform = 'scale(0.1) rotate(15deg)';
                clone.style.borderRadius = '50%';
            }, 30);

            setTimeout(() => {
                if (clone.parentNode) clone.parentNode.removeChild(clone);
                // Also give the cart icon a tiny bump animation
                cartIcon.style.transform = 'scale(1.25)';
                cartIcon.style.transition = 'transform 0.2s ease';
                setTimeout(() => {
                    cartIcon.style.transform = 'scale(1)';
                }, 200);
            }, 1100);
        }

        for (let i = 0; i < qty; i++) {
            addToCart({ ...product, name: displayName, price: effectivePrice });
        }
    };

    const handleBuyNow = () => {
        const item = {
            product_id: product.product_id,
            flower_name: product.flower_name,
            name: displayName,
            price: effectivePrice,
            quantity: qty,
            thumbnail: product.thumbnail,
            stock: product.stock,
            seller_id: product.seller_id,
            seller: product.seller,
        };
        localStorage.setItem('buy_now_item', JSON.stringify(item));
        router.visit(route('checkout', { buy_now: 1 }));
    };

    const submitReview = (e) => {
        e.preventDefault();
        post(route('reviews.store', product.product_id), {
            preserveScroll: true,
            onSuccess: () => { reset(); setReviewSuccess(true); },
        });
    };

    const defaultImage = 'https://images.unsplash.com/photo-1563241597-12a4145ee5ff?auto=format&fit=crop&w=800&q=80';

    return (
        <>
            <Head title={`${displayName} — Bloom&Glow`} />
            <CartDrawer />
            <div className="store-shell">
                <StoreHeader auth={auth} />

                <main className="store-container py-10 md:py-16">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-xs text-ink-muted mb-8">
                        <Link href="/" className="hover:text-rose">Home</Link>
                        <span>/</span>
                        {product.category && (
                            <>
                                <Link href={`/search?category=${product.category.id}`} className="hover:text-rose">{product.category.name}</Link>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-ink">{displayName}</span>
                    </nav>

                    <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                        {/* Images */}
                        <div className="space-y-3">
                            <div className="aspect-[3/4] overflow-hidden rounded-xl bg-rose-light/30">
                                <img
                                    id={`product-image-${product.product_id}`}
                                    src={images[activeImage] ?? defaultImage}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                    onError={e => { e.target.src = defaultImage; }}
                                />
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setActiveImage(i)}
                                            className={`shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all
                                                ${activeImage === i ? 'border-rose' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={img} alt="" className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            <div>
                                {product.category && (
                                    <Link href={`/search?category=${product.category.id}`} className="eyebrow mb-2 block hover:text-rose-dark">
                                        {product.category.name}
                                    </Link>
                                )}
                                <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">{displayName}</h1>
                            </div>

                            {/* Rating and Sold */}
                            <div className="flex items-center gap-3">
                                <StarRating rating={product.average_rating ?? 0} count={product.reviews_count ?? 0} />
                                
                                {product.sales_count > 0 && (
                                    <>
                                        <span className="text-gray-300 text-sm">|</span>
                                        <span className="text-sm font-medium text-gray-600">{product.sales_count} sold</span>
                                    </>
                                )}

                                {product.occasion && (
                                    <>
                                        <span className="text-gray-300 text-sm">|</span>
                                        <span className="rounded-full border border-rose/20 px-2.5 py-0.5 text-xs text-ink-muted">{product.occasion}</span>
                                    </>
                                )}
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <span className="font-serif text-4xl font-semibold text-ink">
                                    ₱{Number(effectivePrice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </span>
                                {hasDiscount && (
                                    <>
                                        <span className="text-lg text-ink-muted line-through">₱{Number(product.price).toFixed(2)}</span>
                                        <span className="rounded-full bg-rose text-white text-xs font-bold px-2.5 py-1">-{discountPct}%</span>
                                    </>
                                )}
                            </div>

                            {/* Stock */}
                            <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold
                                ${inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {inStock ? `${product.stock} in stock` : 'Out of Stock'}
                            </div>

                            {/* Description */}
                            {product.description && (
                                <p className="text-ink-muted leading-relaxed">{product.description}</p>
                            )}

                            {/* Delivery / Pickup badges */}
                            <div className="flex gap-2">
                                {product.delivery_available && (
                                    <div className="flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                                        <TruckIcon className="h-3.5 w-3.5" />
                                        Delivery
                                    </div>
                                )}
                                {product.pickup_available && (
                                    <div className="flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                                        <BuildingStorefrontIcon className="h-3.5 w-3.5" />
                                        Pickup
                                    </div>
                                )}
                            </div>

                            {/* Qty + Cart */}
                            {isAdmin ? null : (auth?.user?.id && product.seller?.user_id && auth.user.id === product.seller.user_id) || (auth?.user?.seller?.id && product.seller_id && auth.user.seller.id === product.seller_id) ? (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 flex items-center gap-2">
                                    <svg className="h-5 w-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>You cannot purchase your own product.</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm font-medium text-ink">Qty:</label>
                                        <div className="flex items-center rounded-full border border-rose/20 bg-white overflow-hidden">
                                            <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                                                className="px-4 py-2 text-ink-muted hover:text-rose hover:bg-rose-light/40 transition-colors font-semibold">−</button>
                                            <span className="px-3 text-sm font-semibold text-ink">{qty}</span>
                                            <button type="button" onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                                                disabled={!inStock}
                                                className="px-4 py-2 text-ink-muted hover:text-rose hover:bg-rose-light/40 transition-colors font-semibold disabled:opacity-30">+</button>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={handleAddToCart}
                                            disabled={!inStock}
                                            className="btn-primary flex-1 gap-2 disabled:opacity-40"
                                        >
                                            <ShoppingCartIcon className="h-4 w-4" />
                                            {inStock ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleBuyNow}
                                            disabled={!inStock}
                                            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-emerald-700 text-white text-sm font-semibold py-3 hover:bg-emerald-800 hover:shadow-[0_4px_14px_rgba(6,95,70,0.3)] transition-all disabled:opacity-40"
                                        >
                                            <ShoppingBagIcon className="h-4 w-4" />
                                            Buy Now
                                        </button>
                                        </div>
                                    </div>
                            )}

                            {/* Seller card */}
                            {product.seller && (
                                <Link
                                    href={route('shop.show', product.seller.id)}
                                    className="flex items-center gap-3 rounded-2xl border border-rose/10 bg-rose-light/20 p-4 hover:border-rose/30 transition-all"
                                >
                                    {product.seller.shop_logo_url ? (
                                        <img src={product.seller.shop_logo_url} alt="" className="h-12 w-12 rounded-full object-cover border border-rose/15" />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-rose-light flex items-center justify-center text-rose font-bold">
                                            {product.seller.shop_name?.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="font-semibold text-ink text-sm">{product.seller.shop_name}</p>
                                            {product.seller.is_verified && (
                                                <CheckBadgeIcon className="h-4 w-4 text-sky-500" />
                                            )}
                                        </div>
                                        {product.seller.city && (
                                            <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                                                <MapPinIcon className="h-3 w-3" />
                                                {product.seller.city}, {product.seller.province}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs font-semibold text-rose">Visit Shop →</span>
                                </Link>
                            )}
                        </div>
                    </ScrollReveal>

                    {/* Reviews Section */}
                    <ScrollReveal className="mt-16">
                        <h2 className="font-serif text-2xl font-semibold text-ink mb-8">Customer Reviews</h2>
                        <div className={`grid grid-cols-1 ${auth?.user?.seller?.id !== product.seller_id && !isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
                            {/* Review form */}
                            {auth?.user?.seller?.id !== product.seller_id && !isAdmin && (
                                <div>
                                    <div className="rounded-2xl border border-rose/10 bg-white p-6 shadow-soft">
                                        <h3 className="font-serif text-lg font-semibold text-ink mb-4">Write a Review</h3>
                                        {!auth?.user ? (
                                            <p className="text-xs text-gray-500 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                                <Link href="/login" className="text-rose font-bold hover:underline">Sign in</Link> to write a review.
                                            </p>
                                        ) : hasReviewed || reviewSuccess ? (
                                            <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-3.5 text-xs text-amber-800 font-semibold flex items-center gap-2">
                                                <CheckBadgeIcon className="w-4 h-4 text-amber-600 shrink-0" />
                                                <span>You have already submitted a review for this product.</span>
                                            </div>
                                        ) : !hasPurchased ? (
                                            <div className="rounded-xl bg-gray-50 border border-gray-200/80 p-4 text-xs text-gray-600 space-y-2">
                                                <div className="flex items-center gap-2 font-bold text-gray-800">
                                                    <LockClosedIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <span>Verified Purchase Required</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 leading-relaxed">
                                                    Only customers who have purchased and received this item can submit a review to ensure authentic feedback.
                                                </p>
                                            </div>
                                        ) : (
                                            <form onSubmit={submitReview} className="space-y-4">
                                                <div>
                                                    <label className="field-label">Rating</label>
                                                    <div className="flex gap-1 mt-1">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <button
                                                                key={s}
                                                                type="button"
                                                                onClick={() => setData('rating', s)}
                                                                className="p-0.5"
                                                            >
                                                                {s <= data.rating
                                                                    ? <StarSolid className="h-6 w-6 text-amber-400" />
                                                                    : <StarIcon className="h-6 w-6 text-gray-300 hover:text-amber-300" />
                                                                }
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="field-label">Comment</label>
                                                    <textarea
                                                        value={data.comment}
                                                        onChange={e => setData('comment', e.target.value)}
                                                        rows={3}
                                                        placeholder="Share your experience…"
                                                        className="w-full rounded-2xl border border-rose/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-gray-400 focus:border-rose focus:ring-1 focus:ring-rose/30 outline-none"
                                                    />
                                                </div>
                                                {errors.review && <p className="text-xs text-red-600">{errors.review}</p>}
                                                <button type="submit" disabled={processing} className="btn-primary w-full h-10 text-sm">
                                                    Submit Review
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Reviews list */}
                             <div className={`${auth?.user?.seller?.id !== product.seller_id && !isAdmin ? 'lg:col-span-2' : ''} space-y-4`}>
                                {(!product.reviews || product.reviews.length === 0) ? (
                                    <div className="rounded-2xl border border-rose/10 bg-white p-10 text-center text-ink-muted text-sm">
                                        No reviews yet. Be the first to review!
                                    </div>
                                ) : product.reviews.map(review => (
                                    <div key={review.id} className="rounded-2xl border border-rose/10 bg-white p-5 shadow-soft">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <p className="text-sm font-semibold text-ink">{review.user?.name}</p>
                                                <StarRating rating={review.rating} />
                                            </div>
                                            <p className="text-xs text-ink-muted shrink-0">
                                                {new Date(review.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        {review.comment && <p className="text-sm text-ink-muted leading-relaxed">{review.comment}</p>}
                                        {review.is_verified_purchase && (
                                            <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                                                <CheckBadgeIcon className="h-3.5 w-3.5" />
                                                Verified Purchase
                                            </p>
                                        )}
                                        {review.seller_reply && (
                                            <div className="mt-3 rounded-xl bg-rose-light/30 border border-rose/10 p-3">
                                                <p className="text-xs font-bold text-rose mb-1">Seller Reply</p>
                                                <p className="text-xs text-ink-muted">{review.seller_reply}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>


                    {/* You Might Also Like (Related Products) */}
                    {related.length > 0 && (
                        <section className="mt-16">
                            <h2 className="font-serif text-2xl font-semibold text-ink mb-6">You Might Also Like</h2>
                            <ScrollReveal stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                {related.map(p => (
                                    <Link key={p.product_id} href={route('products.show', p.product_id)} className="group">
                                        <div className="aspect-[3/4] overflow-hidden rounded-xl bg-rose-light/30 mb-3">
                                            <img
                                                src={getProductImage(p)}
                                                alt={p.name ?? p.flower_name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <p className="text-sm font-medium text-ink">{p.name ?? p.flower_name}</p>
                                        <p className="text-sm text-ink-muted mt-0.5">₱{Number(p.discount_price ?? p.price).toFixed(2)}</p>
                                    </Link>
                                ))}
                            </ScrollReveal>
                        </section>
                    )}
                </main>
            </div>
        </>
    );
}
