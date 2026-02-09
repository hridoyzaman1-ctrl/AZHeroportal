
import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
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
import AdminProfile from './pages/AdminProfile';
import Trailers from './pages/Trailers';
import CategoryPage from './pages/CategoryPage';
import Reviews from './pages/Reviews';
import Blog from './pages/Blog';
import Footer from './components/Footer';
import Header from './components/Header';
import { VaultItem, User, Category, SiteSettings } from './types';
import { storageService } from './services/storage';
import { soundManager } from './utils/SoundManager';

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
        onClick={() => {
          const newTheme = theme === 'dark' ? 'light' : 'dark';
          toggleTheme();
          soundManager.playThemeSwitch(newTheme);
        }}
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


import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    address: 'Multiverse HQ, Sector 7-G, Prime Reality Tower, New York, NY 10001',
    showAddress: true,
    contactEmail: 'uplink@heroportal.io',
    socialLinks: [
      { id: 'fb', platform: 'Facebook', url: '', icon: 'facebook', visible: false },
      { id: 'wa', platform: 'WhatsApp', url: '', icon: 'chat', visible: false },
      { id: 'yt', platform: 'YouTube', url: '', icon: 'play_circle', visible: false },
      { id: 'x', platform: 'X', url: '', icon: 'brand_family', visible: false },
      { id: 'tk', platform: 'TikTok', url: '', icon: 'music_note', visible: false }
    ],
    copyrightYear: '2026'
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalActivated, setPortalActivated] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return (localStorage.getItem('portal_theme') as any) || 'dark'; } catch { return 'dark'; }
  });

  const refreshItems = async () => {
    try {
      const [items, cats, sets] = await Promise.all([
        storageService.getItems(),
        storageService.getCategories(),
        storageService.getSettings()
      ]);
      setVaultItems(items);
      setCategories(cats);
      setSettings(sets);
    } catch (error) {
      console.error('Failed to refresh content:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await refreshItems();
      setLoading(false);
    };
    init();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch user profile from Firestore if needed, or just use basic auth info
          const users = await storageService.getUsers();
          const userProfile = users.find(u => u.email === firebaseUser.email);
          setCurrentUser(userProfile || {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: 'Guest',
            avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`,
            joinedDate: new Date().toLocaleDateString(),
            isVerified: firebaseUser.emailVerified,
            isApproved: false,
            isRejected: false
          });
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        // Still set user even if profile fetch fails
        if (firebaseUser) {
          setCurrentUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: 'Guest',
            avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`,
            joinedDate: new Date().toLocaleDateString(),
            isVerified: firebaseUser.emailVerified,
            isApproved: false,
            isRejected: false
          });
        } else {
          setCurrentUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('portal_theme', theme);
  }, [theme]);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = async () => {
    await auth.signOut();
    setCurrentUser(null);
  };

  if (loading || !portalActivated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 overflow-hidden relative">
        {/* Cinematic Background Pulse */}
        <div className="absolute inset-0 bg-primary-red/5 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-red/10 rounded-full blur-[120px] opacity-20"></div>

        <div className="relative z-10 flex flex-col items-center gap-12 max-w-sm w-full text-center">
          <div className="flex flex-col items-center gap-4">
            <span className="text-primary-red material-symbols-outlined text-6xl animate-boltFlash">bolt</span>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">
              HERO <span className="text-primary-red">PORTAL</span>
            </h1>
          </div>

          <div className="w-full space-y-6">
            {loading ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <div className="size-10 border-2 border-primary-red border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-red ml-2">Synchronizing Multiverse...</p>
              </div>
            ) : (
              <button
                onClick={() => {
                  soundManager.unlockAudio();
                  soundManager.playStartup();
                  setPortalActivated(true);
                  // Sound effects will end when App transitions, 
                  // but we want the crackle to stay for the brief splash
                  setTimeout(() => {
                    soundManager.stopStartup();
                  }, 1500);
                }}
                className="w-full group relative py-6 bg-white rounded-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary-red/20"
              >
                <div className="absolute inset-0 bg-primary-red translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative z-10 text-black group-hover:text-white font-black text-xs uppercase tracking-[0.5em] ml-2">Initiate Neural Link</span>
              </button>
            )}
            <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest leading-loose">
              System Authorization Required <br /> Establish Connection to Proceed
            </p>
          </div>
        </div>

        {/* Global Loading Scanline */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-primary-red/30 shadow-[0_0_10px_#f20d0d] animate-[scanH_3s_linear_infinite]"></div>
      </div>
    );
  }

  return (
    <ContentContext.Provider value={{
      vaultItems, categories, settings,
      addItem: async (i) => { await storageService.addItem(i); refreshItems(); },
      updateItem: async (i) => { await storageService.updateItem(i); refreshItems(); },
      deleteItem: async (id) => { await storageService.deleteItem(id); refreshItems(); },
      refreshItems,
      addCategory: async (c) => { await storageService.addCategory(c); refreshItems(); },
      deleteCategory: async (c) => { await storageService.deleteCategory(c); refreshItems(); },
      updateSettings: async (s) => { await storageService.saveSettings(s); refreshItems(); },
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
            <Route path="/admin/profile" element={<PrivateRoute><AdminProfile /></PrivateRoute>} />
            <Route path="/admin/settings" element={<PrivateRoute><AdminSettings /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LayoutWrapper>
      </Router>
    </ContentContext.Provider>
  );
};

export default App;
