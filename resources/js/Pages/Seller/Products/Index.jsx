import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { getProductImage } from '@/utils/productImages';
import {
    Plus,
    Pencil,
    Trash2,
    RotateCcw,
    Copy,
    Search,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
    ShoppingBag,
    Archive
} from 'lucide-react';

function ProductStatusBadge({ product }) {
    if (product.deleted_at) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">Archived</span>;
    }
    if (!product.is_active) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Inactive</span>;
    }
    if (product.stock === 0) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">Out of Stock</span>;
    }
    if (product.stock <= 5) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Low Stock</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Active</span>;
}

export default function SellerProductsIndex({ products, seller, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [localProducts, setLocalProducts] = useState(products.data);

    useEffect(() => {
        setLocalProducts(products.data);
    }, [products.data]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('seller.products.index'), { ...filters, search }, { preserveState: true });
    };

    const handleFilter = (status) => {
        router.get(route('seller.products.index'), { ...filters, status, search }, { preserveState: true });
    };

    const handleToggle = (product) => {
        const previousProducts = [...localProducts];
        setLocalProducts(prev => prev.map(p => p.product_id === product.product_id ? { ...p, is_active: !p.is_active } : p));
        
        router.patch(route('seller.products.toggle', product.product_id), {}, { 
            preserveScroll: true,
            onError: () => setLocalProducts(previousProducts)
        });
    };

    const handleDelete = (product) => {
        router.delete(route('seller.products.destroy', product.product_id), {
            preserveScroll: true,
            onSuccess: () => setConfirmDelete(null),
        });
    };

    const handleRestore = (productId) => {
        router.post(route('seller.products.restore', productId), {}, { preserveScroll: true });
    };

    const handleDuplicate = (product) => {
        router.post(route('seller.products.duplicate', product.product_id), {}, { preserveScroll: true });
    };

    const [editingStockId, setEditingStockId] = useState(null);
    const [tempStock, setTempStock] = useState('');

    const handleUpdateStock = (productId, newStock) => {
        if (newStock < 0) return;
        
        const previousProducts = [...localProducts];
        setLocalProducts(prev => prev.map(p => p.product_id === productId ? { ...p, stock: newStock } : p));
        
        router.patch(route('seller.products.update-stock', productId), { stock: newStock }, {
            preserveScroll: true,
            onSuccess: () => setEditingStockId(null),
            onError: () => setLocalProducts(previousProducts)
        });
    };

    const statusFilters = [
        { label: 'All', value: undefined },
        { label: 'Active', value: 'active' },
        { label: 'Low Stock (≤5)', value: 'low_stock' },
        { label: 'Out of Stock', value: 'out_of_stock' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Archived', value: 'archived' },
    ];

    return (
        <SellerLayout seller={seller} title="My Products">
            <Head title="Products — Seller Dashboard" />

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-xs p-4">
                    <div className="bg-[#FAF0F3] rounded-[24px] shadow-[10px_10px_25px_#e2d7da,-10px_-10px_25px_#ffffff] border border-white/80 p-6 max-w-sm w-full">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 mb-4">
                            <Trash2 className="h-6 w-6 text-rose-600 stroke-[1.8]" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Archive product?</h3>
                        <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
                            "{confirmDelete.name ?? confirmDelete.flower_name}" will be hidden from customers.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-gray-600 font-medium rounded-full px-4 py-2 transition-all text-xs sm:text-sm">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium rounded-full px-4 py-2 shadow-md hover:bg-rose-700 transition-all text-xs sm:text-sm">
                                Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6 pb-10">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-serif font-semibold text-gray-800 tracking-tight">Products Catalog</h2>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 font-normal">Manage your boutique catalog of {products.total} flower arrangements.</p>
                    </div>
                    <Link
                        href={route('seller.products.create')}
                        className="bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white font-medium px-5 py-2.5 rounded-full shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all flex items-center gap-2 text-xs sm:text-sm"
                    >
                        <Plus className="h-4 w-4 stroke-[2]" />
                        Add Product
                    </Link>
                </div>

                {/* Search + Neumorphic Filters Bar */}
                <div className="flex flex-wrap items-center gap-4">
                    <form onSubmit={handleSearch} className="flex-1 min-w-[250px] max-w-md">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400 stroke-[1.8]" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search products…"
                                className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all"
                            />
                        </div>
                    </form>
                    <div className="flex gap-2 flex-wrap">
                        {statusFilters.map(({ label, value }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => handleFilter(value)}
                                className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all
                                    ${filters?.status === value || (!filters?.status && !value)
                                        ? 'bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]'
                                        : 'bg-[#FAF0F3] text-gray-600 shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff] hover:text-[#E91E63]'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Neumorphic Products Table Container */}
                <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 overflow-hidden">
                    {localProducts.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag className="h-8 w-8 text-pink-400 stroke-[1.8]" />
                            </div>
                            <p className="text-base font-semibold text-gray-800 mb-1">No products found.</p>
                            <p className="text-xs sm:text-sm text-gray-500 mb-6">Start building your catalog to receive customer orders.</p>
                            <Link href={route('seller.products.create')} className="bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white font-medium px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all inline-flex text-xs sm:text-sm">
                                Add your first product
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-pink-200/40 text-xs sm:text-sm">
                                <thead>
                                    <tr className="text-left text-[#E91E63] font-semibold uppercase tracking-wider">
                                        <th className="pb-4 px-4">Product</th>
                                        <th className="pb-4 px-4">Price</th>
                                        <th className="pb-4 px-4">Stock</th>
                                        <th className="pb-4 px-4">Status</th>
                                        <th className="pb-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-pink-200/30">
                                    {localProducts.map(product => (
                                        <tr key={product.product_id} className="hover:bg-pink-50/40 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3.5">
                                                    <img
                                                        src={getProductImage(product)}
                                                        alt={product.name ?? product.flower_name}
                                                        className="h-11 w-11 rounded-xl object-cover border border-gray-200 shadow-xs"
                                                    />
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                                            {product.name ?? product.flower_name}
                                                        </p>
                                                        {product.sku && (
                                                            <p className="text-xs text-gray-400 mt-0.5 font-normal">SKU: {product.sku}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                                    ₱{Number(product.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </p>
                                                {product.discount_price && (
                                                    <p className="text-xs text-emerald-600 font-medium mt-0.5">
                                                        Sale: ₱{Number(product.discount_price).toFixed(2)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                {editingStockId === product.product_id ? (
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            handleUpdateStock(product.product_id, parseInt(tempStock, 10) || 0);
                                                        }}
                                                        className="flex items-center gap-1.5"
                                                    >
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={tempStock}
                                                            onChange={(e) => setTempStock(e.target.value)}
                                                            className="w-16 h-8 text-xs font-medium rounded-lg bg-[#FAF0F3] shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] px-2 text-center outline-none border-none"
                                                            autoFocus
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="px-2.5 py-1 text-xs font-medium bg-[#E91E63] text-white rounded-lg hover:bg-[#D81B60] transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingStockId(null)}
                                                            className="px-2 py-1 text-xs text-gray-400 hover:text-gray-700"
                                                        >
                                                            ✕
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <div className="flex items-center gap-2 group/stock">
                                                        <span
                                                            onClick={() => {
                                                                if (!product.deleted_at) {
                                                                    setEditingStockId(product.product_id);
                                                                    setTempStock(product.stock.toString());
                                                                }
                                                            }}
                                                            className={`font-semibold text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                                                                product.stock === 0
                                                                    ? 'bg-rose-100 text-rose-800'
                                                                    : product.stock <= 5
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : 'bg-pink-100 text-pink-800'
                                                            }`}
                                                            title="Click to edit stock"
                                                        >
                                                            {product.stock} units
                                                        </span>
                                                        {!product.deleted_at && (
                                                            <div className="opacity-0 group-hover/stock:opacity-100 flex items-center gap-1 transition-opacity">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateStock(product.product_id, Math.max(0, product.stock - 1))}
                                                                    className="w-5 h-5 rounded-full bg-[#FAF0F3] shadow-[2px_2px_4px_#e2d7da,-2px_-2px_4px_#ffffff] text-gray-600 text-xs font-medium flex items-center justify-center transition-colors"
                                                                    title="Decrease stock"
                                                                >
                                                                    -
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateStock(product.product_id, product.stock + 1)}
                                                                    className="w-5 h-5 rounded-full bg-[#FAF0F3] shadow-[2px_2px_4px_#e2d7da,-2px_-2px_4px_#ffffff] text-gray-600 text-xs font-medium flex items-center justify-center transition-colors"
                                                                    title="Increase stock"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4"><ProductStatusBadge product={product} /></td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {product.deleted_at ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRestore(product.product_id)}
                                                            title="Restore"
                                                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                                        >
                                                            <RotateCcw className="h-4 w-4 stroke-[1.8]" />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggle(product)}
                                                                title={product.is_active ? 'Deactivate' : 'Activate'}
                                                                className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-pink-100/50 rounded-xl transition-colors"
                                                            >
                                                                {product.is_active
                                                                    ? <EyeOff className="h-4 w-4 stroke-[1.8]" />
                                                                    : <Eye className="h-4 w-4 stroke-[1.8]" />
                                                                }
                                                            </button>
                                                            <Link
                                                                href={route('seller.products.edit', product.product_id)}
                                                                title="Edit"
                                                                className="p-1.5 text-gray-400 hover:text-[#E91E63] hover:bg-pink-100/50 rounded-xl transition-colors"
                                                            >
                                                                <Pencil className="h-4 w-4 stroke-[1.8]" />
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDuplicate(product)}
                                                                title="Duplicate"
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                            >
                                                                <Copy className="h-4 w-4 stroke-[1.8]" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setConfirmDelete(product)}
                                                                title="Archive"
                                                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4 stroke-[1.8]" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Neumorphic Pagination */}
                {products.links && (
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {products.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all
                                    ${link.active ? 'bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]' : 'bg-[#FAF0F3] text-gray-600 shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff] hover:text-[#E91E63]'}
                                    ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </SellerLayout>
    );
}
