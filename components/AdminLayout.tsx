import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContent } from '../App';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, currentUser } = useContent();

    const menuItems = [
        { path: '/admin', icon: 'grid_view', label: 'Dashboard' },
        { path: '/admin/content', icon: 'inventory_2', label: 'Vault Content' },
        { path: '/admin/comments', icon: 'rate_review', label: 'Review Control' },
        { path: '/admin/users', icon: 'groups', label: 'Personnel Matrix' },
        { path: '/admin/subscribers', icon: 'mail', label: 'Subscribers' },
        { path: '/admin/categories', icon: 'category', label: 'Sectors' },
        { path: '/admin/rankings', icon: 'trophy', label: 'Rankings' },
        { path: '/admin/profile', icon: 'account_circle', label: 'My Profile' },
        { path: '/admin/settings', icon: 'settings', label: 'Settings' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-72 bg-[#0c0c0c] border-r border-white/5 flex flex-col shrink-0">
                <div className="p-10 border-b border-white/5">
                    <Link to="/" className="text-2xl font-black italic tracking-tighter text-primary-red flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl">bolt</span> COMMAND
                    </Link>
                </div>

                <nav className="flex-1 p-8 space-y-3 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-5 p-5 rounded-2xl transition-all ${isActive(item.path)
                                    ? 'bg-primary-blue/10 text-primary-blue border border-primary-blue/20'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
                        </Link>
                    ))}

                    {/* BACK TO PORTAL */}
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all mt-6 border-t border-white/5 pt-9"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span className="font-bold text-[11px] uppercase tracking-widest">Back to Portal</span>
                    </button>
                </nav>

                {/* LOGOUT */}
                <div className="p-8 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-primary-red hover:bg-white/5 transition-all"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="font-bold text-[11px] uppercase tracking-widest">Logout Ops</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
