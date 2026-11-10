import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Users, Store, ShieldCheck, Globe, LogOut, ChevronDown, Bell, Flag } from 'lucide-react';

export default function AdminLayout({ children, title }) {
    const user = usePage().props.auth.user;

    const navItems = [
        { name: 'Dashboard', href: route('admin.dashboard'), icon: LayoutDashboard, active: route().current('admin.dashboard') },
        { name: 'Users', href: route('admin.users.index'), icon: Users, active: route().current('admin.users.*') },
        { name: 'Sellers', href: route('admin.sellers.index'), icon: Store, active: route().current('admin.sellers.*') },
        { name: 'Verifications', href: route('admin.verifications.index'), icon: ShieldCheck, active: route().current('admin.verifications.*') },
        { name: 'Reports', href: route('admin.reports.index'), icon: Flag, active: route().current('admin.reports.*') },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 flex-shrink-0 min-h-screen border-r border-slate-800 z-20 flex flex-col text-white">
                <div className="px-6 py-7">
                    <Link href={route('home')} className="flex items-center gap-3 group">
                        <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="font-serif text-[21px] font-semibold text-white tracking-tight group-hover:text-rose-300 transition-colors">
                            Bloom & Glow
                        </span>
                    </Link>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-slate-400 pl-11">Admin Panel</p>
                </div>
                
                <nav className="flex-1 px-4 space-y-1.5 mt-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-[15px] font-medium ${
                                item.active 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            <item.icon className={`h-5 w-5 ${item.active ? 'stroke-[2.5]' : 'stroke-[2] text-slate-400 group-hover:text-white'}`} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Link 
                        href={route('home')} 
                        className="flex items-center gap-3 px-3.5 py-2.5 text-[15px] font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200"
                    >
                        <Globe className="h-5 w-5 stroke-[2] text-slate-400" />
                        View Platform
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <header className="bg-white border-b border-slate-200 h-[72px] flex items-center justify-between px-8 shrink-0 z-10 relative">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-0.5">
                            <span>Admin</span>
                            <span>/</span>
                            <span className="font-medium text-slate-900">{title || 'Dashboard'}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-5">
                        <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-rose-500 border-2 border-white"></span>
                        </button>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div className="flex items-center gap-3 group relative cursor-pointer">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-semibold text-slate-900 leading-none mb-1">{user?.name}</span>
                                <span className="text-xs text-slate-500 leading-none">Administrator</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase ring-2 ring-white shadow-sm">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            
                            {/* Simple hover dropdown for logout */}
                            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-[160px]">
                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button" 
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-8 relative">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
