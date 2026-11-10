import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

import StoreHeader from '@/Components/StoreHeader';
import CartDrawer from '@/Components/CartDrawer';
import ProductCard from '@/Components/ProductCard';
import { useCart } from '@/Contexts/CartContext';
import { getProductImage } from '@/utils/productImages';
import ScrollReveal from '@/Components/ScrollReveal';
import {
    MagnifyingGlassIcon, AdjustmentsHorizontalIcon,
    ShoppingCartIcon, StarIcon as StarOutline,
    MapPinIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const SORT_OPTIONS = [
    { value: 'newest',      label: 'Newest' },
    { value: 'price_asc',   label: 'Price: Low to High' },
    { value: 'price_desc',  label: 'Price: High to Low' },
    { value: 'best_selling',label: 'Best Selling' },
];

const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Graduation', 'Sympathy', 'Thank You', 'Congratulations', 'Love', 'New Baby', 'Get Well'];
const FLOWER_TYPES = ['Roses', 'Tulips', 'Lilies', 'Sunflowers', 'Orchids', 'Carnations', 'Mixed Bouquet', 'Dried Flowers', 'Succulents'];

function StarRating({ rating }) {
    return (
        <div className="flex">
            {[1,2,3,4,5].map(s => (
                s <= Math.round(rating)
                    ? <StarSolid key={s} className="h-3 w-3 text-amber-400" />
                    : <StarOutline key={s} className="h-3 w-3 text-gray-300" />
            ))}
        </div>
    );
}

export default function Search({ products: rawProducts, categories: rawCategories, filters: rawFilters, auth }) {
    const { addToCart } = useCart();
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Defensive: normalize props to prevent crashes from corrupted cache data
    const products   = rawProducts && typeof rawProducts === 'object' && Array.isArray(rawProducts.data)
        ? rawProducts
        : { data: [], total: 0, links: [], current_page: 1, last_page: 1 };
    const categories = Array.isArray(rawCategories) ? rawCategories : [];
    const filters    = rawFilters && typeof rawFilters === 'object' ? rawFilters : {};

    const [localFilters, setLocalFilters] = useState({
        q:           filters.q ?? '',
        category:    filters.category ?? '',
        sort:        filters.sort ?? 'newest',
        occasion:    filters.occasion ?? '',
        flower_type: filters.flower_type ?? '',
    });

    const applyFilters = (newFilters = localFilters) => {
        const cleaned = Object.fromEntries(Object.entries(newFilters).filter(([, v]) => v !== ''));
        router.get(route('search'), cleaned, { preserveState: true, preserveScroll: true });
    };

    const updateFilter = (key, value) => {
        const updated = { ...localFilters, [key]: value };
        setLocalFilters(updated);
        applyFilters(updated);
    };

    const clearFilter = (key) => updateFilter(key, '');


    const defaultImg = 'https://images.unsplash.com/photo-1563241597-12a4145ee5ff?auto=format&fit=crop&w=600&q=80';

    const FilterPanel = () => (
        <div className="space-y-6">
            {/* Categories */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-3">Category</h3>
                <div className="space-y-1.5">
                    <button
                        type="button"
                        onClick={() => updateFilter('category', '')}
                        className={`text-[13px] w-full text-left px-3 py-2 rounded-lg transition-colors
                            ${!localFilters.category ? 'bg-gray-900 text-white font-medium shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        All Categories
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => updateFilter('category', cat.id)}
                            className={`text-[13px] w-full text-left px-3 py-2 rounded-lg transition-colors
                                ${localFilters.category == cat.id ? 'bg-gray-900 text-white font-medium shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Occasion */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-3">Occasion</h3>
                <div className="flex flex-wrap gap-1.5">
                    {OCCASIONS.map(o => (
                        <button
                            key={o}
                            type="button"
                            onClick={() => updateFilter('occasion', localFilters.occasion === o ? '' : o)}
                            className={`rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all duration-300
                                ${localFilters.occasion === o ? 'bg-gray-900 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900'}`}
                        >
                            {o}
                        </button>
                    ))}
                </div>
            </div>

            {/* Flower Type */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-3">Flower Type</h3>
                <div className="flex flex-wrap gap-1.5">
                    {FLOWER_TYPES.map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => updateFilter('flower_type', localFilters.flower_type === t ? '' : t)}
                            className={`rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all duration-300
                                ${localFilters.flower_type === t ? 'bg-gray-900 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Head title={`${filters.q ? `"${filters.q}" — ` : ''}Search — Bloom&Glow`} />
            <CartDrawer />
            <div className="store-shell font-sans bg-[#FAF0F3] min-h-screen">
                <StoreHeader auth={auth} />
                <main className="store-container py-8 md:py-12">
                    {/* Search bar */}
                    <div className="mb-8 flex gap-3">
                        <form
                            onSubmit={e => { e.preventDefault(); applyFilters(); }}
                            className="flex flex-1 items-center gap-3 rounded-full bg-white/60 backdrop-blur-md px-6 py-3.5 shadow-sm border border-white/40 focus-within:bg-white focus-within:shadow-md focus-within:border-white transition-all duration-300"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                value={localFilters.q}
                                onChange={e => setLocalFilters(f => ({ ...f, q: e.target.value }))}
                                placeholder="Search flowers, sellers, occasions…"
                                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 border-none focus:border-none focus:ring-0 p-0 outline-none"
                            />
                            {localFilters.q && (
                                <button type="button" onClick={() => updateFilter('q', '')}>
                                    <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-900 transition-colors" />
                                </button>
                            )}
                        </form>
                        <button
                            type="button"
                            onClick={() => setFiltersOpen(f => !f)}
                            className="lg:hidden flex items-center gap-2 rounded-full border border-rose/20 bg-white px-4 py-3 text-sm font-medium text-ink-muted hover:border-rose/40 transition-colors"
                        >
                            <AdjustmentsHorizontalIcon className="h-5 w-5" />
                            Filters
                        </button>
                    </div>

                    {/* Active filters */}
                    {(localFilters.category || localFilters.occasion || localFilters.flower_type) && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[
                                { key: 'category',    value: categories.find(c => c.id == localFilters.category)?.name },
                                { key: 'occasion',    value: localFilters.occasion },
                                { key: 'flower_type', value: localFilters.flower_type },
                            ].filter(f => f.value).map(f => (
                                <button
                                    key={f.key}
                                    type="button"
                                    onClick={() => clearFilter(f.key)}
                                    className="flex items-center gap-1.5 rounded-full bg-rose-light border border-rose/20 px-3 py-1 text-xs font-medium text-rose"
                                >
                                    {f.value}
                                    <XMarkIcon className="h-3 w-3" />
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-8">
                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block w-56 shrink-0">
                            <div className="sticky top-24">
                                <h2 className="font-serif text-lg font-semibold text-ink mb-5">Filter</h2>
                                <FilterPanel />
                            </div>
                        </aside>

                        {/* Mobile sidebar overlay */}
                        {filtersOpen && (
                            <div className="fixed inset-0 z-50 lg:hidden">
                                <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
                                <div className="absolute inset-y-0 left-0 w-80 bg-white p-6 shadow-xl overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="font-serif text-lg font-semibold text-ink">Filter</h2>
                                        <button type="button" onClick={() => setFiltersOpen(false)}>
                                            <XMarkIcon className="h-5 w-5 text-ink-muted" />
                                        </button>
                                    </div>
                                    <FilterPanel />
                                </div>
                            </div>
                        )}

                        {/* Results */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-6 gap-4">
                                <p className="text-sm text-ink-muted">
                                    {products.total} result{products.total !== 1 ? 's' : ''}
                                    {filters.q && <> for "<span className="text-ink font-medium">{filters.q}</span>"</>}
                                </p>
                                <select
                                    value={localFilters.sort}
                                    onChange={e => updateFilter('sort', e.target.value)}
                                    className="rounded-full border border-rose/20 bg-white px-4 py-2 text-sm text-ink focus:border-rose outline-none"
                                >
                                    {SORT_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>

                            {products.data.length === 0 ? (
                                <div className="rounded-3xl border border-rose/10 bg-white p-16 text-center">
                                    <p className="text-4xl mb-4">🌸</p>
                                    <p className="font-serif text-xl font-semibold text-ink mb-2">No products found</p>
                                    <p className="text-sm text-ink-muted">Try adjusting your search or filters.</p>
                                </div>
                            ) : (
                                <ScrollReveal stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                                    {products.data.map(product => (
                                        <ProductCard key={product.product_id} product={product} onAdd={addToCart} searchQuery={filters.q} />
                                    ))}
                                </ScrollReveal>
                            )}

                            {/* Pagination */}
                            {products.links && (
                                <div className="flex flex-wrap justify-center gap-1 mt-10">
                                    {products.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url ?? '#'}
                                            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors
                                                ${link.active ? 'bg-rose text-white' : 'bg-white border border-rose/20 text-ink-muted hover:border-rose/40'}
                                                ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
