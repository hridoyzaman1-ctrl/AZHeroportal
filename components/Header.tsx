
import * as React from 'react';
import { useState, useEffect } from 'react';
import { soundManager } from '../utils/SoundManager';
import { Link, useLocation } from 'react-router-dom';
import { useContent } from '../App';

const Header: React.FC = () => {
  const { categories, theme, toggleTheme } = useContent();
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Use dynamic categories from context, limited to first 6 for header to prevent overflow
  // The rest can be accessed via Mobile Menu or a "More" dropdown (future)
  // We filter out 'Blog', 'Trailers' and 'Reviews' as they have dedicated nav buttons/sections
  const visibleCategories = categories.filter(c => c !== 'Blog').slice(0, 6);

  const getCategoryLink = (cat: string) => {
    if (cat === 'Blog') return '/blog';
    if (cat === 'Trailers') return '/trailers';
    if (cat === 'Reviews') return '/reviews';
    return `/category/${cat}`;
  };

  return (
    <>
      <header className={`sticky top-0 z-[60] w-full border-b transition-all duration-500 ${theme === 'dark' ? 'bg-background-black/80 border-white/5 backdrop-blur-xl' : 'bg-white/80 border-slate-200 backdrop-blur-xl shadow-sm'
        }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-black italic">
              <span className="text-primary-red material-symbols-outlined text-2xl animate-boltFlash">bolt</span>
              <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>HERO</span>
              <span className="text-primary-red">PORTAL</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {visibleCategories.map(cat => (
                <Link
                  key={cat}
                  to={getCategoryLink(cat)}
                  className={`text-[11px] font-black uppercase tracking-widest transition-all hover:text-primary-red ${location.pathname.includes(cat) ? 'text-primary-red' : typeof theme !== 'undefined' && theme === 'dark' ? 'text-gray-400' : 'text-gray-500' // Fixed theme access safely
                    }`}
                >
                  {cat}
                </Link>
              ))}
              <Link to="/comics-gen" className={`text-[11px] font-black uppercase tracking-widest transition-all hover:text-primary-red ${location.pathname.includes('comics') ? 'text-primary-red' : typeof theme !== 'undefined' && theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Comics Gen
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-8">
            {/* Real-time Clock - Fixed Visibility for Light Mode */}
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-blue">Chronos Feed</span>
              <div className={`flex items-center gap-3 text-xs font-bold transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                <span>{time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="size-1 rounded-full bg-primary-red animate-pulse"></span>
                <span className={`tabular-nums font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            <Link to="/rankings" className="hidden md:flex items-center gap-2 bg-primary-red/10 text-primary-red px-4 py-2 rounded-xl border border-primary-red/20 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
              <span className="material-symbols-outlined text-sm">trophy</span>
              <span>TOP 10</span>
            </Link>

            {/* Mobile Theme Toggle - ALWAYS VISIBLE ON MOBILE AT TOP */}
            <button
              onClick={() => {
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                toggleTheme();
                soundManager.playThemeSwitch(newTheme);
              }}
              className={`md:hidden p-2 rounded-lg border flex items-center justify-center transition-all ${theme === 'dark'
                ? 'bg-white/5 border-white/10 text-primary-blue'
                : 'bg-slate-100 border-slate-200 text-primary-red'
                }`}
            >
              <span className={`material-symbols-outlined transition-transform duration-700 ${theme === 'dark' ? 'rotate-[360deg]' : ''}`}>
                {theme === 'dark' ? 'flare' : 'shield'}
              </span>
            </button>

            <button
              data-testid="mobile-menu-btn"
              onClick={() => setIsMenuOpen(true)}
              className={`md:hidden p-2 rounded-lg border ${theme === 'dark' ? 'border-white/10 text-white hover:bg-white/10' : 'border-slate-200 text-slate-900 hover:bg-slate-100'}`}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className={`fixed inset-0 z-[100] md:hidden flex flex-col ${theme === 'dark' ? 'bg-background-black/95' : 'bg-white/95'} backdrop-blur-2xl animate-fadeIn`}>
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">

            {/* Date/Time for Mobile Menu */}
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-blue mb-1">Chronos Link</span>
              <div className={`flex items-center gap-2 text-[10px] font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                <span>{time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="size-1 rounded-full bg-primary-red animate-pulse"></span>
                <span className={`tabular-nums font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen(false)}
              className={`p-2 rounded-full border ${theme === 'dark' ? 'border-white/10 text-white hover:bg-white/10' : 'border-slate-200 text-slate-900 hover:bg-slate-100'}`}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Theme Toggle */}
            <button
              onClick={() => {
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                toggleTheme();
                soundManager.playThemeSwitch(newTheme);
              }}
              className={`w-full py-4 px-6 rounded-2xl flex items-center justify-between border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}
            >
              <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {theme === 'dark' ? 'Multiverse Mode' : 'Prime Reality'}
              </span>
              <span className={`material-symbols-outlined transition-transform duration-700 ${theme === 'dark' ? 'rotate-[360deg] text-primary-blue' : 'text-primary-red'}`}>
                {theme === 'dark' ? 'flare' : 'shield'}
              </span>
            </button>

            {/* System Navigation integration */}
            <div className="space-y-4">
              <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>System Navigation</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/" className={`flex items-center gap-2 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-white/5 text-gray-300' : 'bg-slate-50 text-slate-600'}`}>
                  <span className="material-symbols-outlined text-sm">home</span> Front Page
                </Link>
                <Link to="/trailers" className={`flex items-center gap-2 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-white/5 text-gray-300' : 'bg-slate-50 text-slate-600'}`}>
                  <span className="material-symbols-outlined text-sm">movie</span> Trailers
                </Link>
                <Link to="/reviews" className={`flex items-center gap-2 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-white/5 text-gray-300' : 'bg-slate-50 text-slate-600'}`}>
                  <span className="material-symbols-outlined text-sm">star</span> Reviews
                </Link>
                <Link to="/blog" className={`flex items-center gap-2 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-white/5 text-gray-300' : 'bg-slate-50 text-slate-600'}`}>
                  <span className="material-symbols-outlined text-sm">draw</span> Blog
                </Link>
              </div>
            </div>

            {/* Content Categories */}
            <div className="space-y-4">
              <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>Signals</h3>
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col space-y-2">
                  {categories.filter(c => c !== 'Blog').map(cat => (
                    <Link
                      key={cat}
                      to={getCategoryLink(cat)}
                      className={`text-xl font-black italic uppercase tracking-tighter ${location.pathname.includes(cat) ? 'text-primary-red' : theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin & Top 10 */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <Link to="/rankings" className="flex items-center justify-center gap-2 bg-primary-red/10 text-primary-red px-4 py-4 rounded-xl border border-primary-red/20 text-[11px] font-black uppercase tracking-widest">
                <span className="material-symbols-outlined text-lg">trophy</span>
                <span>Top 10 Rankings</span>
              </Link>

              <Link to="/admin" className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-white/10 text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-900 text-white'}`}>
                <span className="material-symbols-outlined text-lg">shield</span>
                <span>Admin Control</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
