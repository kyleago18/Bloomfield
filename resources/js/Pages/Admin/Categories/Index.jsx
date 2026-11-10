import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import { PlusIcon, PencilSquareIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const EMOJI_OPTIONS = ['🌸', '🌺', '🌻', '🌷', '🌹', '🎁', '🎀', '💐', '🌼', '🍀', '🌿', '🪴', '🍃', '🌱', '🌾'];

export default function AdminCategoriesIndex({ categories }) {
    const [editing, setEditing]  = useState(null);
    const [showNew, setShowNew]  = useState(false);

    const createForm = useForm({ name: '', icon: '🌸', description: '', sort_order: '' });
    const editForm   = useForm({ name: '', icon: '', description: '', sort_order: '', is_active: true });

    const startEdit = (cat) => {
        setEditing(cat.id);
        editForm.setData({
            name:        cat.name,
            icon:        cat.icon ?? '',
            description: cat.description ?? '',
            sort_order:  cat.sort_order ?? '',
            is_active:   cat.is_active,
        });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.categories.store'), {
            preserveScroll: true,
            onSuccess: () => { createForm.reset(); setShowNew(false); },
        });
    };

    const handleUpdate = (e, catId) => {
        e.preventDefault();
        editForm.patch(route('admin.categories.update', catId), {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    };

    const handleDelete = (catId) => {
        if (confirm('Delete this category? Products will become uncategorized.')) {
            router.delete(route('admin.categories.destroy', catId), { preserveScroll: true });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Head title="Categories — Admin" />
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="font-serif text-2xl font-semibold text-ink">Categories</h1>
                    <div className="flex gap-3">
                        <Link href={route('admin.dashboard')} className="text-sm text-ink-muted hover:text-rose">← Dashboard</Link>
                        <button
                            type="button"
                            onClick={() => setShowNew(true)}
                            className="btn-primary gap-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            New Category
                        </button>
                    </div>
                </div>

                {/* Create form */}
                {showNew && (
                    <div className="rounded-2xl border border-rose/15 bg-white p-6 shadow-soft">
                        <h2 className="font-serif text-lg font-semibold text-ink mb-4">New Category</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="field-label">Name *</label>
                                    <input
                                        type="text"
                                        value={createForm.data.name}
                                        onChange={e => createForm.setData('name', e.target.value)}
                                        className="field-input h-10 rounded-full border border-rose/20 px-4 focus:outline-none"
                                        placeholder="e.g. Bouquets"
                                        required
                                    />
                                    <InputError message={createForm.errors.name} className="mt-1" />
                                </div>
                                <div>
                                    <label className="field-label">Icon (emoji)</label>
                                    <div className="flex gap-1 flex-wrap mt-1">
                                        {EMOJI_OPTIONS.map(em => (
                                            <button
                                                key={em}
                                                type="button"
                                                onClick={() => createForm.setData('icon', em)}
                                                className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center border transition-all
                                                    ${createForm.data.icon === em ? 'border-rose bg-rose-light' : 'border-transparent hover:bg-rose-light/50'}`}
                                            >
                                                {em}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="field-label">Sort Order</label>
                                    <input
                                        type="number"
                                        value={createForm.data.sort_order}
                                        onChange={e => createForm.setData('sort_order', e.target.value)}
                                        className="field-input h-10 rounded-full border border-rose/20 px-4 focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="field-label">Description</label>
                                <input
                                    type="text"
                                    value={createForm.data.description}
                                    onChange={e => createForm.setData('description', e.target.value)}
                                    className="field-input h-10 rounded-full border border-rose/20 px-4 focus:outline-none"
                                    placeholder="Optional description"
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={createForm.processing} className="btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Categories list */}
                <div className="rounded-2xl border border-rose/10 bg-white shadow-soft overflow-hidden">
                    <div className="px-6 py-4 border-b border-rose/10 flex items-center justify-between">
                        <p className="text-sm font-medium text-ink-muted">{categories.length} categories</p>
                    </div>
                    {categories.length === 0 ? (
                        <div className="p-12 text-center text-ink-muted text-sm">No categories yet. Create the first one!</div>
                    ) : (
                        <div className="divide-y divide-rose/5">
                            {categories.map(cat => (
                                <div key={cat.id}>
                                    {editing === cat.id ? (
                                        <form onSubmit={e => handleUpdate(e, cat.id)} className="p-5 bg-rose-light/10 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="field-label">Name *</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.data.name}
                                                        onChange={e => editForm.setData('name', e.target.value)}
                                                        className="field-input h-10 rounded-full border border-rose/20 px-4 focus:outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="field-label">Icon</label>
                                                    <div className="flex gap-1 flex-wrap mt-1">
                                                        {EMOJI_OPTIONS.map(em => (
                                                            <button key={em} type="button"
                                                                onClick={() => editForm.setData('icon', em)}
                                                                className={`h-8 w-8 rounded-lg text-base flex items-center justify-center border transition-all
                                                                    ${editForm.data.icon === em ? 'border-rose bg-rose-light' : 'border-transparent hover:bg-rose-light/50'}`}
                                                            >{em}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="field-label">Sort Order</label>
                                                    <input
                                                        type="number"
                                                        value={editForm.data.sort_order}
                                                        onChange={e => editForm.setData('sort_order', e.target.value)}
                                                        className="field-input h-10 rounded-full border border-rose/20 px-4 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                                <input type="checkbox" checked={editForm.data.is_active} onChange={e => editForm.setData('is_active', e.target.checked)} className="h-4 w-4 accent-rose" />
                                                Active (visible on store)
                                            </label>
                                            <div className="flex gap-3 justify-end">
                                                <button type="button" onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
                                                <button type="submit" disabled={editForm.processing} className="btn-primary">Save</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="flex items-center gap-4 px-5 py-4 hover:bg-rose-light/10 transition-colors">
                                            <span className="text-2xl shrink-0">{cat.icon ?? '🌸'}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-ink">{cat.name}</p>
                                                {cat.description && <p className="text-xs text-ink-muted truncate">{cat.description}</p>}
                                            </div>
                                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${cat.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {cat.is_active ? 'Active' : 'Hidden'}
                                            </span>
                                            <span className="text-sm text-ink-muted">{cat.products_count} products</span>
                                            <div className="flex items-center gap-1">
                                                <button type="button" onClick={() => startEdit(cat)}
                                                    className="p-2 rounded-xl hover:bg-rose-light text-rose transition-colors">
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => handleDelete(cat.id)}
                                                    className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors">
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
