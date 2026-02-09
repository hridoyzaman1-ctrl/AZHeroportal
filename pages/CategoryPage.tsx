
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../App';
import { ContentType } from '../types';

const CategoryPage: React.FC = () => {
  const { type } = useParams();
  const { vaultItems, theme } = useContent();
  const [activeFilter, setActiveFilter] = useState<ContentType | 'All'>('All');
  const [visibleCount, setVisibleCount] = useState(6);
  
  const filtered = useMemo(() => {
    return vaultItems
      .filter(item => {
        const matchesCategory = item.categories.some(c => c.toLowerCase() === type?.toLowerCase());
        const matchesType = activeFilter === 'All' || item.type === activeFilter;
        return matchesCategory && matchesType && item.status === 'Published';
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vaultItems, type, activeFilter]);

  const contentTypes: (ContentType | 'All')[] = ['All', 'Article', 'Trailer', 'Review', 'Blog'];

  return (
    <div className={`min-h-screen p-4 md:p-10 transition-colors duration-500 ${theme === 'dark' ? 'bg-background-black' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-primary-blue text-[10px] font-black uppercase tracking-[0.5em] mb-3 block">Channel Active</span>
            <h1 className={`text-4xl md:text-7xl font-black italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {type} <span className="text-primary-blue glow-blue">HUB</span>
            </h1>
          </div>
          
          <div className={`flex flex-wrap rounded-2xl p-1.5 border gap-1 ${theme === 'dark' ? 'bg-surface-dark border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            {contentTypes.map(ct => (
              <button 
                key={ct} 
                onClick={() => { setActiveFilter(ct); setVisibleCount(6); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === ct ? 'bg-primary-blue text-black shadow-lg shadow-primary-blue/30' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {ct}s
              </button>
            ))}
          </div>
        </header>

        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filtered.slice(0, visibleCount).map((item) => (
                <Link key={item.id} to={`/news/${item.id}`} className={`group border rounded-[2.5rem] overflow-hidden transition-all hover:-translate-y-2 shadow-2xl ${
                  theme === 'dark' ? 'bg-surface-dark border-white/5 hover:border-primary-blue/30' : 'bg-white border-slate-200 hover:border-primary-blue/30 shadow-sm'
                }`}>
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                    <div className="absolute top-6 left-6">
                       <span className="px-3 py-1.5 bg-black/60 backdrop-blur-xl text-[10px] font-black uppercase tracking-widest text-primary-blue border border-primary-blue/30 rounded-xl">{item.type}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.categories.slice(0, 3).map(c => (
                        <span key={c} className="text-[8px] font-black uppercase text-gray-500 tracking-widest">{c}</span>
                      ))}
                    </div>
                    <h3 className={`text-2xl font-black uppercase italic leading-tight group-hover:text-primary-blue transition-colors mb-4 line-clamp-2 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                    <div className={`flex items-center justify-between pt-6 border-t text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'border-white/5 text-gray-500' : 'border-slate-100 text-slate-400'}`}>
                      <span>{item.author}</span>
                      <button className="text-primary-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read File <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="flex justify-center mt-12 mb-20">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="px-12 py-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary-red hover:text-white transition-all shadow-xl active:scale-95"
                >
                  Load More Content
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={`py-40 text-center rounded-[3rem] border border-dashed ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-6">satellite_alt</span>
            <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-sm">No Active Signals Detected In This Sector</p>
            <Link to="/" className="mt-8 inline-block text-primary-blue font-black uppercase tracking-widest text-xs hover:underline">Return to Prime Frequency</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
