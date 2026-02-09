
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Rankings from './pages/Rankings';
import NewsDetail from './pages/NewsDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminContent from './pages/AdminContent';
import AdminComments from './pages/AdminComments';
import AdminUsers from './pages/AdminUsers';
import AdminSubscribers from './pages/AdminSubscribers';
import AdminCategories from './pages/AdminCategories';
import AdminRankings from './pages/AdminRankings';
import AdminSettings from './pages/AdminSettings';
import AdminAuth from './pages/AdminAuth';
import Trailers from './pages/Trailers';
import CategoryPage from './pages/CategoryPage';
import Reviews from './pages/Reviews';
import Blog from './pages/Blog';
import Footer from './components/Footer';
import Header from './components/Header';
import { VaultItem, User, Category, SiteSettings } from './types';
import { storageService } from './services/storage';

interface ContentContextType {
  vaultItems: VaultItem[];
  categories: Category[];
  settings: SiteSettings;
  addItem: (item: VaultItem) => void;
  updateItem: (item: VaultItem) => void;
  deleteItem: (id: string) => void;
  refreshItems: () => void;
  addCategory: (cat: string) => void;
  deleteCategory: (cat: string) => void;
  updateSettings: (settings: SiteSettings) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within ContentProvider');
  return context;
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useContent();
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (isAdminRoute) return null;

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-slate-200 dark:border-white/5 bg-white dark:bg-background-black z-50 p-6 transition-colors duration-500">
      <div className="mb-10">
        <Link to="/" className="text-xl font-black tracking-widest text-slate-900 dark:text-white uppercase flex items-center gap-2 italic group">
          <span className="text-primary-red material-symbols-outlined text-3xl animate-boltFlash">bolt</span>
          <span>HERO <span className="text-primary-red">PORTAL</span></span>
        </Link>
      </div>

      <button
        onClick={toggleTheme}
        className="group mb-8 w-full bg-slate-100 dark:bg-white/5 py-4 rounded-2xl border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase flex items-center justify-between px-4 hover:scale-[1.02] active:scale-95 transition-all shadow-sm hover:shadow-lg dark:hover:shadow-primary-blue/10"
      >
        <span className="text-slate-600 dark:text-gray-400 group-hover:text-primary-blue transition-colors">
          {theme === 'dark' ? 'Multiverse Mode' : 'Prime Reality'}
        </span>
        <span className={`material-symbols-outlined text-lg transition-all duration-700 ${theme === 'dark' ? 'rotate-[360deg] text-primary-blue' : 'rotate-0 text-primary-red'}`}>
          {theme === 'dark' ? 'flare' : 'shield'}
        </span>
      </button>

      <nav className="flex-1 space-y-1">
        <Link to="/" className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 font-bold uppercase text-[11px] tracking-widest transition-all">
          <span className="material-symbols-outlined text-xl">home</span> Front Page
        </Link>
        <Link to="/trailers" className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 font-bold uppercase text-[11px] tracking-widest transition-all">
          <span className="material-symbols-outlined text-xl">movie</span> Trailers
        </Link>
        <Link to="/reviews" className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 font-bold uppercase text-[11px] tracking-widest transition-all">
          <span className="material-symbols-outlined text-xl">star</span> Reviews
        </Link>
        <Link to="/blog" className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 font-bold uppercase text-[11px] tracking-widest transition-all">
          <span className="material-symbols-outlined text-xl">draw</span> Blog
        </Link>
      </nav>
      <div className="pt-6 border-t border-slate-200 dark:border-white/5">
        <Link to="/admin" className="flex items-center gap-4 px-4 py-4 rounded-xl bg-slate-900 text-white dark:bg-white/5 border border-white/10 hover:bg-primary-red transition-all font-bold uppercase text-[11px] group">
          <span className="material-symbols-outlined group-hover:animate-boltFlash">shield</span> Admin Control
        </Link>
      </div>
    </aside>
  );
};

const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser } = useContent();
  return currentUser ? <>{children}</> : <Navigate to="/admin/auth" />;
};

const LayoutWrapper = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const { theme } = useContent();
  const isAdmin = location.pathname.startsWith('/admin');
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 800);
    return () => clearTimeout(timer);
  }, [theme]);

  return (
    <div className={`flex min-h-screen font-display transition-colors duration-500 ${theme === 'dark' ? 'bg-background-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      {animating && (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
          <div className="absolute top-0 bottom-0 w-2 bg-primary-red/50 shadow-[0_0_30px_#f20d0d] animate-scanWipe"></div>
        </div>
      )}
      <Navigation />
      <div className={`flex-1 flex flex-col min-w-0 ${!isAdmin ? 'md:pl-64' : ''}`}>
        {!isAdmin && <Header />}
        <main className="flex-1 w-full relative">{children}</main>
        {!isAdmin && <Footer />}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try { return storageService.getSettings(); } catch { return { siteName: 'Hero Portal', tagline: '', logoUrl: '', socialLinks: [] }; }
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('portal_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return (localStorage.getItem('portal_theme') as any) || 'dark'; } catch { return 'dark'; }
  });

  const refreshItems = () => {
    setVaultItems(storageService.getItems());
    setCategories(storageService.getCategories());
    setSettings(storageService.getSettings());
  };

  useEffect(() => { refreshItems(); }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('portal_theme', theme);
  }, [theme]);

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('portal_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('portal_user');
  };

  return (
    <ContentContext.Provider value={{
      vaultItems, categories, settings,
      addItem: (i) => setVaultItems(storageService.addItem(i)),
      updateItem: (i) => setVaultItems(storageService.updateItem(i)),
      deleteItem: (id) => setVaultItems(storageService.deleteItem(id)),
      refreshItems,
      addCategory: (c) => setCategories(storageService.addCategory(c)),
      deleteCategory: (c) => setCategories(storageService.deleteCategory(c)),
      updateSettings: (s) => { storageService.saveSettings(s); setSettings(s); },
      theme,
      toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark'),
      currentUser, login, logout
    }}>
      <Router>
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trailers" element={<Trailers />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/category/:type" element={<CategoryPage />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/content" element={<PrivateRoute><AdminContent /></PrivateRoute>} />
            <Route path="/admin/comments" element={<PrivateRoute><AdminComments /></PrivateRoute>} />
            <Route path="/admin/users" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
            <Route path="/admin/subscribers" element={<PrivateRoute><AdminSubscribers /></PrivateRoute>} />
            <Route path="/admin/categories" element={<PrivateRoute><AdminCategories /></PrivateRoute>} />
            <Route path="/admin/rankings" element={<PrivateRoute><AdminRankings /></PrivateRoute>} />
            <Route path="/admin/settings" element={<PrivateRoute><AdminSettings /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LayoutWrapper>
      </Router>
    </ContentContext.Provider>
  );
};

export default App;
