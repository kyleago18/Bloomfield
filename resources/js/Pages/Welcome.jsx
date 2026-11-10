import { Head, router } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import { useCart } from '../Contexts/CartContext';
import CartDrawer from '../Components/CartDrawer';
import StoreHeader from '../Components/StoreHeader';
import StoreFooter from '../Components/StoreFooter';
import ProductCard from '../Components/ProductCard';
import ProductCarousel from '../Components/ProductCarousel';
import { Search, X, Loader2, Clock, Gift, Heart, Sparkles, HandHeart, Feather, Footprints, Mail, Truck, Leaf, ShieldCheck, Flower2, ShoppingBag, Star } from 'lucide-react';
import BackgroundSlideshow from '../Components/BackgroundSlideshow';
import { getProductImage } from '@/utils/productImages';
import ScrollReveal from '../Components/ScrollReveal';

const HERO_IMAGES = [
    '/images/d1.png',
    '/images/d2.png',
    '/images/d3.png',
    '/images/d4.png',
    '/images/d5.png',
    '/images/d6.png'
];

export default function Welcome({ auth, products = [] }) {
    const { addToCart } = useCart();
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterMessage, setNewsletterMessage] = useState('');

    const sellerId = auth?.user?.seller?.id;

    const safeProducts = useMemo(
        () => {
            const list = Array.isArray(products) ? products : [];
            if (sellerId) {
                return list.filter(p => p.seller_id !== sellerId);
            }
            return list;
        },
        [products, sellerId]
    );

    const featured = useMemo(() => safeProducts.filter(p => p.is_featured).slice(0, 8), [safeProducts]);
    const featuredBottom = useMemo(() => safeProducts.slice(8, 16), [safeProducts]);
    
    const [heroImageIndex, setHeroImageIndex] = useState(0);
    const [heroFade, setHeroFade] = useState(true);

    useEffect(() => {
        if (HERO_IMAGES.length <= 1) {
            setHeroImageIndex(0);
            return;
        }
        const interval = setInterval(() => {
            setHeroFade(false);
            setTimeout(() => {
                setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
                setHeroFade(true);
            }, 800); // 800ms smooth fade transition
        }, 5000); // 5s rotation
        return () => clearInterval(interval);
    }, []);

    const currentHeroImageUrl = HERO_IMAGES[heroImageIndex] || '/images/d1.png';

    // Dynamic Story Banner slideshow
    const storyBannerImages = [
        '/images/2.jpg',
        '/images/3.jpg',
        '/images/4.jpg',
        '/images/5.jpg',
        '/images/6.jpg'
    ];
    const [storyBannerIndex, setStoryBannerIndex] = useState(0);
    const [storyBannerFade, setStoryBannerFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setStoryBannerFade(false);
            setTimeout(() => {
                setStoryBannerIndex((prev) => (prev + 1) % storyBannerImages.length);
                setStoryBannerFade(true);
            }, 800); // 800ms smooth fade transition
        }, 4000); // 4s rotation
        return () => clearInterval(interval);
    }, []);

    // Dynamic Hero Title
    const titleWords = [
        "BRIGHTER.",
        "FRESHER.",
        "SWEETER.",
        "BOLDER."
    ];
    const [titleIndex, setTitleIndex] = useState(0);
    const [titleFade, setTitleFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setTitleFade(false);
            setTimeout(() => {
                setTitleIndex((prev) => (prev + 1) % titleWords.length);
                setTitleFade(true);
            }, 500);
        }, 3000);
        return () => clearInterval(interval);
    }, [titleWords.length]);



    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setIsSearching(false);
            setSearchResults([]);
            setIsLoading(false);
            return;
        }

        setIsSearching(true);
        setIsLoading(true);

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data);
                    console.log(`[Search Debug] Keyword: "${searchQuery}" | Matching Products: ${data.length}`, data);
                }
            } catch (error) {
                console.error("Error searching products:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);


    const popular = useMemo(() => [...safeProducts].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)).slice(0, 8), [safeProducts]);

    const filteredSearchResults = useMemo(() => {
        if (sellerId) {
            return searchResults.filter(p => p.seller_id !== sellerId);
        }
        return searchResults;
    }, [searchResults, sellerId]);
    
    // Spotlight Carousel State
    const [spotlightIndex, setSpotlightIndex] = useState(0);
    const spotlightHooks = [
        "Crowd Favorite",
        "Trending Now",
        "Perfect Gift Idea",
        "Highly Recommended",
        "Our Signature Pick"
    ];

    useEffect(() => {
        if (!popular || popular.length === 0) return;
        const interval = setInterval(() => {
            setSpotlightIndex((prev) => (prev + 1) % Math.min(5, popular.length));
        }, 10000); // 10s rotation
        return () => clearInterval(interval);
    }, [popular]);
    const newArrivals = useMemo(() => safeProducts.filter(p => p.is_flash_sale).slice(0, 8), [safeProducts]);
    const recommended = useMemo(() => {
        const copy = [...safeProducts];
        return copy.reverse().slice(0, 8).length ? copy.reverse().slice(0, 8) : safeProducts.slice(0, 8);
    }, [safeProducts]);

    const subscribeNewsletter = (event) => {
        event.preventDefault();
        if (!newsletterEmail.trim()) {
            setNewsletterMessage('Enter a valid email address to join our list.');
            return;
        }
        setNewsletterMessage(`Thanks! ${newsletterEmail.trim()} has been added to our list.`);
        setNewsletterEmail('');
    };

    return (
        <>
            <Head title="Bloom&Glow — Fresh Flowers, Thoughtfully Arranged" />
            <CartDrawer />

            <div className="store-shell font-sans bg-[#FAF0F3] min-h-screen">

                <StoreHeader auth={auth} />

                {/* Hero Section */}
                <section className="relative pt-8 pb-16 md:pt-16 md:pb-20 overflow-hidden bg-pink-100">
                    <div className="store-container relative z-10 flex flex-col md:flex-row items-center justify-between">
                        <ScrollReveal className="w-full md:w-[40%] z-10 relative">
                            <h1 className="font-serif text-5xl md:text-6xl lg:text-[72px] font-bold text-gray-800 leading-[1.05] tracking-tight mb-6">
                                BIGGER.<br/>
                                <span className={`text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] to-[#F472B6] transition-opacity duration-500 inline-block min-w-[300px] ${titleFade ? 'opacity-100' : 'opacity-0'}`}>{titleWords[titleIndex]}</span><br/>
                                BETTER.
                            </h1>
                            <div className="mb-8">
                                <p className="text-gray-900/80 text-base md:text-lg max-w-sm leading-relaxed transition-opacity duration-500 ease-in-out">
                                    Thoughtfully designed flowers and gifts that celebrate life, nature and every meaningful moment.
                                </p>
                            </div>
                            <div className="flex">
                                <a href="#collections" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 shadow-[4px_4px_12px_rgba(233,30,99,0.25)] uppercase">
                                    Explore Blooms
                                </a>
                            </div>
                        </ScrollReveal>
                        
                        {/* Organic image area */}
                        <div className="w-full md:w-[60%] mt-12 md:mt-0 relative flex justify-end">
                            <div className="relative w-full flex items-center justify-center">
                                {/* Full product image area */}
                                <img 
                                    src={currentHeroImageUrl}
                                    alt="Featured Bouquet"
                                    className={`w-full h-auto max-h-[550px] md:max-h-[650px] lg:max-h-[750px] object-contain transition-opacity duration-1000 ease-in-out ${heroFade ? 'opacity-100' : 'opacity-40'} transform scale-105 md:scale-[1.1] lg:scale-[1.15]`}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Bar */}
                <section className="py-8 border-b border-rose/10 bg-transparent">
                    <div className="store-container">
                        <ScrollReveal stagger className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { title: 'SAME DAY DELIVERY', subtitle: 'Order before 11:00AM', icon: <Truck className="w-6 h-6 text-gray-800" strokeWidth={1.5} /> },
                                { title: 'FRESH FROM FARMS', subtitle: 'Handpicked with care', icon: <Leaf className="w-6 h-6 text-gray-800" strokeWidth={1.5} /> },
                                { title: 'EXPERT FLORISTS', subtitle: 'Crafted by professionals', icon: <Flower2 className="w-6 h-6 text-gray-800" strokeWidth={1.5} /> },
                                { title: 'HAPPINESS GUARANTEED', subtitle: 'Your satisfaction, always', icon: <ShieldCheck className="w-6 h-6 text-gray-800" strokeWidth={1.5} /> },
                            ].map((feature, i) => (
                                <div key={i} className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4 bg-white p-5 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 text-center lg:text-left h-full">
                                    <div className="flex-shrink-0 bg-gray-50/80 border border-gray-100 w-12 h-12 flex items-center justify-center rounded-full mx-auto lg:mx-0">
                                        {feature.icon}
                                    </div>
                                    <div className="flex flex-col justify-center h-full flex-1 min-w-0">
                                        <div className="text-[10px] sm:text-[11px] font-bold text-gray-800 uppercase tracking-[0.12em] mb-1 font-sans truncate whitespace-normal break-words">{feature.title}</div>
                                        <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium font-sans leading-tight">{feature.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </ScrollReveal>
                    </div>
                </section>

                {/* Collections */}
                <section id="collections" className="py-12 md:py-16 bg-transparent">
                    <div className="store-container">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-800">
                                    {isSearching ? 'Search Results' : 'Shop Our Collections'}
                                </h2>
                            </div>
                            {!isSearching && (
                                <a href="#collections" className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:border-pink-300 hover:text-[#E91E63] transition-colors">
                                    View All
                                </a>
                            )}
                        </div>

                        {/* Search Input Removed */}

                        {isSearching ? (
                            isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-80 bg-gray-100 rounded-[24px]" />
                                    ))}
                                </div>
                            ) : filteredSearchResults.length > 0 ? (
                                <ScrollReveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredSearchResults.map((product) => (
                                        <ProductCard key={product.product_id} product={product} onAdd={addToCart} searchQuery={searchQuery} />
                                    ))}
                                </ScrollReveal>
                            ) : (
                                <div className="text-center py-16">
                                    <h3 className="font-serif text-2xl font-semibold text-gray-800 mb-2">No blooms found</h3>
                                    <p className="text-gray-500 text-sm">Try different keywords.</p>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col gap-12 md:gap-16 pb-4">
                                {/* Featured Flowers */}
                                {featured.length > 0 && (
                                    <ScrollReveal>
                                        <div className="flex justify-between items-end mb-2">
                                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-800">Featured Flowers</h2>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <ProductCarousel products={featured} onAdd={addToCart} />
                                        </div>
                                    </ScrollReveal>
                                )}

                                {/* Best Seller Spotlight Banner */}
                                {popular.length > 0 && (() => {
                                    const topProducts = popular.slice(0, 5);
                                    
                                    const nextSlide = () => setSpotlightIndex((p) => (p + 1) % topProducts.length);
                                    const prevSlide = () => setSpotlightIndex((p) => (p - 1 + topProducts.length) % topProducts.length);

                                    return (
                                        <div className="flex flex-col gap-6 pt-0 pb-8 relative">
                                            {/* Decorative Background Elements */}
                                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                                                <div className="absolute top-10 left-10 w-64 h-64 bg-pink-100/50 rounded-full blur-3xl"></div>
                                                <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-100/40 rounded-full blur-3xl"></div>
                                            </div>

                                            {/* Section Header */}
                                            <div id="story" className="flex flex-col items-center text-center px-4">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="h-[1px] w-12 bg-pink-200"></div>
                                                    <span className="text-[10px] sm:text-xs font-bold text-[#E91E63] uppercase tracking-[0.25em]">Curated Classics</span>
                                                    <div className="h-[1px] w-12 bg-pink-200"></div>
                                                </div>
                                                <h2 className="font-serif text-4xl md:text-5xl lg:text-[56px] text-[#0f172a] mb-4">Our Favorites</h2>
                                                <p className="text-gray-500 text-sm md:text-base max-w-lg mb-6 leading-relaxed">
                                                    Handpicked arrangements that never go out of style. <br className="hidden sm:block" /> Made to make every moment extra special.
                                                </p>
                                                <div className="flex items-center gap-3 w-full max-w-[200px] opacity-60">
                                                    <div className="h-[1px] flex-1 bg-pink-200"></div>
                                                    <Heart className="w-4 h-4 text-[#E91E63] stroke-[1.5]" />
                                                    <div className="h-[1px] flex-1 bg-pink-200"></div>
                                                </div>
                                            </div>

                                            <ScrollReveal>
                                                <div className="relative group overflow-hidden bg-transparent px-2 sm:px-4 py-8">
                                                    {/* Sliding Track */}
                                                    <div 
                                                        className="flex transition-transform duration-700 cubic-bezier(0.25, 1, 0.5, 1) ease-out"
                                                        style={{ transform: `translateX(-${spotlightIndex * 100}%)` }}
                                                    >
                                                        {topProducts.map((product, idx) => {
                                                            const hook = spotlightHooks[idx % spotlightHooks.length];
                                                            return (
                                                                <div 
                                                                    key={product.product_id || idx}
                                                                    className="w-full flex-shrink-0"
                                                                >
                                                                    <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-16 max-w-6xl mx-auto">
                                                                        {/* Left Side: Product Image */}
                                                                        <div className="w-full md:w-1/2 relative group-hover:scale-[1.02] transition-transform duration-500">
                                                                            <img 
                                                                                src={getProductImage(product)} 
                                                                                alt={product.display_name ?? product.name ?? product.flower_name}
                                                                                className="w-full h-auto max-h-[500px] object-contain drop-shadow-2xl"
                                                                            />
                                                                        </div>
                                                                        
                                                                        {/* Right Side: Text & Actions */}
                                                                        <div className="w-full md:w-1/2 flex flex-col justify-center">
                                                                            {/* Eyebrow badge */}
                                                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-100 text-[#E91E63] text-[10px] font-bold uppercase tracking-[0.15em] mb-4 w-fit">
                                                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                                                <span>{hook}</span>
                                                                            </div>
                                                                            
                                                                            <div className="flex items-center gap-4 mb-2">
                                                                                <h3 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#0f172a] leading-tight">
                                                                                    {product.display_name ?? product.name ?? product.flower_name}
                                                                                </h3>
                                                                                <Heart className="w-8 h-8 text-pink-300 stroke-[1.5] -mt-4 opacity-70" />
                                                                            </div>
                                                                            
                                                                            <p className="mb-6 flex items-baseline gap-4">
                                                                                <span className="text-[#E91E63] font-serif font-bold text-3xl sm:text-4xl">₱{parseFloat(product.effective_price ?? product.price).toFixed(2)}</span>
                                                                                {product.discount_price && parseFloat(product.discount_price) < parseFloat(product.price) && (
                                                                                    <span className="text-lg sm:text-xl text-gray-400 font-medium line-through">₱{parseFloat(product.price).toFixed(2)}</span>
                                                                                )}
                                                                            </p>

                                                                            <div className="flex items-center gap-3 w-full max-w-[200px] opacity-40 mb-6">
                                                                                <div className="h-[1px] flex-1 bg-pink-200"></div>
                                                                                <Heart className="w-3.5 h-3.5 text-[#E91E63] stroke-[1.5]" />
                                                                                <div className="h-[1px] flex-1 bg-pink-200"></div>
                                                                            </div>
                                                                            
                                                                            <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-10 max-w-lg">
                                                                                {product.description || "A premium hand-arranged bouquet featuring carefully selected fresh flowers, balanced colors, and elegant presentation. Every bloom is thoughtfully positioned to create a sophisticated and luxurious appearance."}
                                                                            </p>

                                                                            {/* Features Grid */}
                                                                            <div className="grid grid-cols-4 gap-2 mb-10 max-w-lg">
                                                                                {[
                                                                                    { icon: <Flower2 className="w-5 h-5 text-[#E91E63]" strokeWidth={1.5} />, label: "FRESH BLOOMS" },
                                                                                    { icon: <Leaf className="w-5 h-5 text-[#E91E63]" strokeWidth={1.5} />, label: "PREMIUM QUALITY" },
                                                                                    { icon: <Gift className="w-5 h-5 text-[#E91E63]" strokeWidth={1.5} />, label: "PERFECT FOR ANY OCCASION" },
                                                                                    { icon: <Heart className="w-5 h-5 text-[#E91E63]" strokeWidth={1.5} />, label: "MADE WITH LOVE" }
                                                                                ].map((feat, i) => (
                                                                                    <div key={i} className="flex flex-col items-center text-center gap-3">
                                                                                        <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center">
                                                                                            {feat.icon}
                                                                                        </div>
                                                                                        <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-wider leading-tight w-full max-w-[80px]">
                                                                                            {feat.label}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            
                                                                            <div className="flex items-center gap-8">
                                                                                {/* Buy Now Button */}
                                                                                <button 
                                                                                    onClick={async () => {
                                                                                        await addToCart(product);
                                                                                        router.visit(route('checkout'));
                                                                                    }} 
                                                                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E91E63] to-[#F472B6] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-[0_8px_20px_rgba(233,30,99,0.25)] hover:shadow-[0_10px_25px_rgba(233,30,99,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                                                                                >
                                                                                    <ShoppingBag className="w-4 h-4" />
                                                                                    Buy Now
                                                                                </button>
                                                                                
                                                                                {/* Controls */}
                                                                                <div className="flex items-center gap-4">
                                                                                    <button onClick={prevSlide} className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 text-gray-400 border border-gray-100 shadow-sm transition-colors">
                                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                                                    </button>
                                                                                    
                                                                                    <div className="flex gap-2">
                                                                                        {topProducts.map((_, dotIdx) => (
                                                                                            <button
                                                                                                key={dotIdx}
                                                                                                onClick={() => setSpotlightIndex(dotIdx)}
                                                                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                                                                    dotIdx === spotlightIndex ? 'w-2 bg-[#E91E63]' : 'w-2 bg-gray-200 hover:bg-gray-300'
                                                                                                }`}
                                                                                                aria-label={`Go to slide ${dotIdx + 1}`}
                                                                                            />
                                                                                        ))}
                                                                                    </div>
                                                                                    
                                                                                    <button onClick={nextSlide} className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 text-gray-400 border border-gray-100 shadow-sm transition-colors">
                                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </ScrollReveal>
                                        </div>
                                    );
                                })()}

                                {/* Best Seller */}
                                {popular.length > 0 && (
                                    <ScrollReveal delay={100}>
                                        <div className="flex justify-between items-end mb-6">
                                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-800">Best Seller</h2>
                                        </div>
                                        <ProductCarousel products={popular} onAdd={addToCart} />
                                    </ScrollReveal>
                                )}

                                {/* Flash Sale */}
                                {newArrivals.length > 0 && (
                                    <ScrollReveal delay={200}>
                                        <div className="flex justify-between items-end mb-6">
                                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-800">Flash Sale</h2>
                                        </div>
                                        <ProductCarousel products={newArrivals} onAdd={addToCart} />
                                    </ScrollReveal>
                                )}
                            </div>
                        )}
                    </div>
                </section>



                {/* Shop By Occasion */}
                {!isSearching && (
                    <section id="occasions" className="py-12 md:py-16 bg-transparent border-t border-rose/10">
                        <div className="store-container">
                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-800 mb-10">Shop By Occasion</h2>
                            <ScrollReveal stagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 justify-items-center">
                                {[
                                    { name: 'BIRTHDAY', icon: <Gift className="w-6 h-6 md:w-7 md:h-7 text-gray-800" strokeWidth={1.5} /> },
                                    { name: 'ANNIVERSARY', icon: <Heart className="w-6 h-6 md:w-7 md:h-7 text-gray-800" strokeWidth={1.5} /> },
                                    { name: 'CONGRATULATIONS', icon: <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-gray-800" strokeWidth={1.5} /> },
                                    { name: 'THANK YOU', icon: <HandHeart className="w-6 h-6 md:w-7 md:h-7 text-gray-800" strokeWidth={1.5} /> },
                                    { name: 'SYMPATHY', icon: <Feather className="w-6 h-6 md:w-7 md:h-7 text-gray-800" strokeWidth={1.5} /> },
                                    { name: 'NEW BABY', icon: <Footprints className="w-6 h-6 md:w-7 md:h-7 text-gray-800" strokeWidth={1.5} /> },
                                ].map((occ, idx) => (
                                    <a href="#collections" key={idx} className="flex flex-col items-center group">
                                        <div className="w-20 h-20 md:w-[90px] md:h-[90px] rounded-full bg-gray-50/80 flex items-center justify-center mb-5 transition-all duration-500 group-hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-transparent group-hover:border-gray-200">
                                            {occ.icon}
                                        </div>
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] text-center group-hover:text-gray-900 transition-colors">{occ.name}</span>
                                    </a>
                                ))}
                            </ScrollReveal>
                        </div>
                    </section>
                )}





                <StoreFooter />
            </div>
        </>
    );
}
