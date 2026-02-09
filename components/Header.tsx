
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContent } from '../App';

const Header: React.FC = () => {
  const { categories, theme } = useContent();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const mainCategories = ['Movies', 'Games', 'Comics', 'DC', 'Marvel', 'Blog'];

  return (
    <header className={`sticky top-0 z-[60] w-full border-b transition-all duration-500 ${theme === 'dark' ? 'bg-background-black/80 border-white/5 backdrop-blur-xl' : 'bg-white/80 border-slate-200 backdrop-blur-xl shadow-sm'
      }`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="md:hidden flex items-center gap-2 text-xl font-black italic">
            <span className="text-primary-red material-symbols-outlined text-2xl animate-boltFlash">bolt</span>
            <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>HERO</span>
            <span className="text-primary-red">PORTAL</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {mainCategories.map(cat => (
              <Link
                key={cat}
                to={cat === 'Blog' ? '/blog' : `/category/${cat}`}
                className={`text-[11px] font-black uppercase tracking-widest transition-all hover:text-primary-red ${location.pathname.includes(cat) ? 'text-primary-red' : 'text-gray-500'
                  }`}
              >
                {cat}
              </Link>
            ))}
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

          <Link to="/rankings" className="flex items-center gap-2 bg-primary-red/10 text-primary-red px-4 py-2 rounded-xl border border-primary-red/20 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-sm">trophy</span>
            <span>TOP 10</span>
          </Link>
          <div className="md:hidden">
            <button className={`material-symbols-outlined ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>menu</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
