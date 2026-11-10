import { useState, useEffect } from 'react';
import { Settings, Sun, Moon } from 'lucide-react';

export default function Preferences() {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    return (
        <section className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8">
            <header className="mb-6 border-b border-pink-200/40 pb-4">
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-gray-800 tracking-tight flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#E91E63] stroke-[1.8]" />
                    Preferences
                </h2>
                <p className="mt-0.5 text-xs text-gray-500 font-normal">Manage your display theme and regional settings.</p>
            </header>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                    <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-800">Visual Theme</h4>
                        <p className="text-[11px] text-gray-500">Toggle between soft light and dark theme.</p>
                    </div>
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff]">
                        <button
                            type="button"
                            onClick={() => setTheme('light')}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                theme === 'light'
                                    ? 'bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white shadow-xs'
                                    : 'text-gray-600 hover:text-[#E91E63]'
                            }`}
                        >
                            <Sun className="w-3.5 h-3.5" />
                            Light
                        </button>
                        <button
                            type="button"
                            onClick={() => setTheme('dark')}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                theme === 'dark'
                                    ? 'bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white shadow-xs'
                                    : 'text-gray-600 hover:text-[#E91E63]'
                            }`}
                        >
                            <Moon className="w-3.5 h-3.5" />
                            Dark
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
