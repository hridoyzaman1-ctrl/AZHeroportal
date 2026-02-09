import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContent } from '../App';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, currentUser } = useContent();

    const menuItems = [
        { path: '/admin', icon: 'grid_view', label: 'Command HQ' },
        { path: '/admin/content', icon: 'inventory_2', label: 'Neural Vault' },
        { path: '/admin/comments', icon: 'rate_review', label: 'Moderation Hub' },
        { path: '/admin/users', icon: 'groups', label: 'Security Clearance' },
        { path: '/admin/subscribers', icon: 'mail', label: 'Uplink Feed' },
        { path: '/admin/categories', icon: 'category', label: 'Grid Sectors' },
        { path: '/admin/rankings', icon: 'trophy', label: 'Neural Rankings' },
        { path: '/admin/profile', icon: 'account_circle', label: 'Operative Profile' },
        { path: '/admin/settings', icon: 'settings', label: 'Core Settings' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            {/* SIDEBAR - FORCE PERSISTENT ACROSS ALL ADMIN PAGES */}
            <aside className="w-80 bg-[#0c0c0c] border-r border-white/5 flex flex-col shrink-0 z-50">
                <div className="p-10 border-b border-white/5">
                    <Link to="/" className="text-2xl font-black italic tracking-tighter text-primary-red flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl">bolt</span> COMMAND
                    </Link>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-5 p-5 rounded-2xl transition-all group ${isActive(item.path)
                                ? 'bg-primary-blue/10 text-primary-blue border border-primary-blue/20 shadow-[0_0_30px_rgba(0,242,255,0.1)]'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${isActive(item.path) ? 'text-primary-blue' : 'group-hover:text-primary-blue transition-colors'}`}>{item.icon}</span>
                            <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 space-y-3 bg-black/40">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-5 p-4 rounded-xl text-primary-blue bg-primary-blue/5 border border-primary-blue/10 hover:bg-primary-blue hover:text-black transition-all group"
                    >
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">exit_to_app</span>
                        <span className="font-bold text-[9px] uppercase tracking-widest">Return to Portal</span>
                    </button>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-5 p-4 rounded-xl text-gray-500 hover:text-primary-red hover:bg-primary-red/5 transition-all"
                    >
                        <span className="material-symbols-outlined">power_settings_new</span>
                        <span className="font-bold text-[9px] uppercase tracking-widest">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT FIELD */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* GLOBAL ANALYTIC HEADER */}
                <header className="bg-[#0a0f1a]/80 backdrop-blur-3xl border-b border-white/5 px-10 py-8 flex items-center justify-between z-[40]">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-3 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all group"
                        >
                            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Back
                        </button>
                        <div className="h-6 w-px bg-white/5"></div>
                        <div>
                            <span className="text-primary-blue text-[9px] font-black uppercase tracking-[0.4em] mb-1 block opacity-60">{subtitle || 'OPERATIONAL ACCESS'}</span>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
                                {title?.split(' ')[0] || 'ADMIN'} <span className="text-primary-blue">{title?.split(' ').slice(1).join(' ') || 'COMMAND'}</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black uppercase text-white/90">{currentUser?.name || 'ADMIN'}</p>
                            <p className="text-[8px] text-primary-blue uppercase font-black tracking-widest">{currentUser?.role || 'SUPREME'} CLEARANCE</p>
                        </div>
                        <img src={currentUser?.avatar} className="size-10 rounded-xl border border-white/10 shadow-lg" alt="" />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar bg-[#050505]">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
