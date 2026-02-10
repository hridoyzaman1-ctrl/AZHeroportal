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
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const menuItems = [
        { path: '/admin', icon: 'grid_view', label: 'Command HQ' },
        { path: '/admin/content', icon: 'inventory_2', label: 'Neural Vault' },
        { path: '/admin/comments', icon: 'rate_review', label: 'Moderation Hub' },
        { path: '/admin/users', icon: 'groups', label: 'Access Control' },
        { path: '/admin/subscribers', icon: 'mail', label: 'Uplink Feed' },
        { path: '/admin/categories', icon: 'category', label: 'Grid Sectors' },
        { path: '/admin/rankings', icon: 'trophy', label: 'Neural Rankings' },
        { path: '/admin/profile', icon: 'account_circle', label: 'Operative Profile' },
        { path: '/admin/settings', icon: 'settings', label: 'Core Settings' },
    ];

    const isActive = (path: string) => location.pathname === path;

    // Close sidebar on navigation (mobile)
    React.useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            {/* SIDEBAR - Responsive Drawer for Mobile */}
            <aside className={`
                fixed inset-y-0 left-0 w-80 bg-[#0c0c0c] border-r border-white/5 flex flex-col shrink-0 z-[100] transition-transform duration-300 transform md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-black italic tracking-tighter text-primary-red flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl">bolt</span> COMMAND
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-2 text-gray-500 hover:text-white"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
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

            {/* Backdrop for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden animate-fadeIn"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* MAIN CONTENT FIELD */}
            <main className="flex-1 flex flex-col overflow-hidden relative w-full">
                {/* GLOBAL ANALYTIC HEADER */}
                <header className="bg-[#0a0f1a]/80 backdrop-blur-3xl border-b border-white/5 px-6 md:px-10 py-6 md:py-8 flex items-center justify-between z-[40]">
                    <div className="flex items-center gap-4 md:gap-8 overflow-hidden">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 bg-white/5 border border-white/10 rounded-xl text-white"
                        >
                            <span className="material-symbols-outlined">menu_open</span>
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="hidden sm:flex items-center gap-3 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all group"
                        >
                            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Back
                        </button>
                        <div className="hidden sm:block h-6 w-px bg-white/5"></div>
                        <div className="truncate">
                            <span className="text-primary-blue text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] mb-1 block opacity-60 truncate">{subtitle || 'OPERATIONAL ACCESS'}</span>
                            <h1 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter leading-none truncate">
                                {title?.split(' ')[0] || 'ADMIN'} <span className="text-primary-blue">{title?.split(' ').slice(1).join(' ') || 'COMMAND'}</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6 shrink-0">
                        <div className="text-right hidden lg:block">
                            <p className="text-[10px] font-black uppercase text-white/90">{currentUser?.name || 'ADMIN'}</p>
                            <p className="text-[8px] text-primary-blue uppercase font-black tracking-widest">{currentUser?.role || 'SUPREME'} CLEARANCE</p>
                        </div>
                        <img src={currentUser?.avatar} className="size-8 md:size-10 rounded-xl border border-white/10 shadow-lg" alt="" />
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
