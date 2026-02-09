
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../App';

const Trailers: React.FC = () => {
  const { vaultItems, theme } = useContent();
  const trailers = vaultItems.filter(item => (item.type === 'Trailer' || item.isVideoSection) && item.status === 'Published');
  const [visibleCount, setVisibleCount] = useState(6);

  return (
    <div className={`min-h-screen p-4 md:p-10 transition-colors duration-500 ${theme === 'dark' ? 'bg-background-black' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <span className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 block ${theme === 'dark' ? 'text-primary-blue' : 'text-primary-blue'}`}>Exclusive Access</span>
          <h1 className={`text-4xl md:text-6xl font-black italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            MULTIVERSE <span className="text-primary-blue glow-blue">TRAILERS</span>
          </h1>
        </header>

        {trailers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trailers.slice(0, visibleCount).map((trailer) => (
                <Link key={trailer.id} to={`/news/${trailer.id}`} className={`group relative border rounded-[2.5rem] overflow-hidden transition-all hover:-translate-y-2 shadow-xl ${
                  theme === 'dark' ? 'bg-surface-dark border-white/5 hover:border-primary-blue/30' : 'bg-white border-slate-200 hover:border-primary-blue/30 shadow-sm'
                }`}>
                  <div className="aspect-video relative overflow-hidden">
                    <img src={trailer.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" alt={trailer.title} />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-6xl text-primary-blue glow-blue">play_circle</span>
                    </div>
                    <div className="absolute bottom-6 left-6">
                       <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-primary-blue border border-primary-blue/30 rounded-xl">HD Teaser</span>
                    </div>
                    <div className="absolute bottom-6 right-6 text-[10px] font-black text-white/80 uppercase">{trailer.readTime}</div>
                  </div>
                  <div className="p-8">
                    <h3 className={`text-xl font-black uppercase italic leading-tight group-hover:text-primary-blue transition-colors mb-4 truncate tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{trailer.title}</h3>
                    <p className={`text-sm mb-6 line-clamp-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>{trailer.content}</p>
                    <div className={`flex items-center justify-between pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{trailer.categories?.[0] || 'Uncategorized'}</span>
                      <div className="text-primary-blue text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Watch Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {visibleCount < trailers.length && (
              <div className="flex justify-center mt-12 mb-20">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="px-12 py-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary-red hover:text-white transition-all shadow-xl active:scale-95"
                >
                  Load More Trailers
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={`py-40 text-center rounded-[3rem] border border-dashed ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            <p className="text-gray-500 font-black uppercase tracking-[0.5em] text-sm">No transmissions detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trailers;
