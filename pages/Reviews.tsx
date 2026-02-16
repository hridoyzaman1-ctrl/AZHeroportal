
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../App';

const Reviews: React.FC = () => {
  const { vaultItems, theme } = useContent();
  const reviews = vaultItems.filter(item => item.type === 'Review' && item.status === 'Published');
  const [filter, setFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredReviews = filter === 'All'
    ? reviews
    : reviews.filter(r => r.categories[0] === filter);

  return (
    <div className={`min-h-screen p-4 md:p-10 transition-colors duration-500 ${theme === 'dark' ? 'bg-background-black' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-primary-blue text-[10px] font-black uppercase tracking-[0.5em] mb-2 block">Critical Assessment</span>
            <h1 className={`text-4xl md:text-6xl font-black italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              EPIC <span className="text-primary-blue glow-blue">REVIEWS</span>
            </h1>
          </div>
          <div className={`flex rounded-2xl p-1.5 self-start border ${theme === 'dark' ? 'bg-surface-dark border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            {['All', 'Movies', 'Games'].map(cat => (
              <button
                key={cat}
                onClick={() => { setFilter(cat); setVisibleCount(6); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-primary-blue text-black shadow-lg shadow-primary-blue/30' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {filteredReviews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredReviews.slice(0, visibleCount).map((item) => (
                <Link key={item.id} to={`/news/${item.id}`} className={`group border rounded-[2.5rem] overflow-hidden transition-all hover:-translate-y-2 shadow-2xl ${theme === 'dark' ? 'bg-surface-dark border-white/5 hover:border-primary-blue/30' : 'bg-white border-slate-200 hover:border-primary-blue/30 shadow-sm'
                  }`}>
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img src={item.thumbnailUrl || item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                    <div className="absolute top-6 right-6">
                      <div className="size-16 bg-primary-blue text-black rounded-2xl flex flex-col items-center justify-center shadow-2xl shadow-primary-blue/40 border border-white/20">
                        <span className="text-lg font-black leading-none">{item.rating}</span>
                        <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">Score</span>
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6">
                      <span className="px-3 py-1.5 bg-black/60 backdrop-blur-xl text-[9px] font-black uppercase tracking-widest text-primary-blue border border-primary-blue/30 rounded-lg">{item.categories[0]}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className={`text-xl font-black uppercase italic leading-tight group-hover:text-primary-blue transition-colors mb-4 line-clamp-2 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                    <div className={`flex items-center justify-between pt-6 border-t text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'border-white/5 text-gray-500' : 'border-slate-100 text-slate-400'}`}>
                      <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">person</span> {item.author}</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Full Verdict <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {visibleCount < filteredReviews.length && (
              <div className="flex justify-center mt-12 mb-20">
                <button
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="px-12 py-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary-red hover:text-white transition-all shadow-xl active:scale-95"
                >
                  Load More Reviews
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={`py-40 text-center rounded-[3rem] border border-dashed ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            <span className="material-symbols-outlined text-5xl text-gray-600 mb-4">search</span>
            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">No Reviews Recorded In This Sector</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
