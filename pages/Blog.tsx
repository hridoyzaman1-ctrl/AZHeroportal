
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../App';

const Blog: React.FC = () => {
  const { vaultItems, theme } = useContent();

  const blogPosts = useMemo(() => {
    return vaultItems
      .filter(item =>
        (item.type === 'Blog' || item.categories.some(c => c.toLowerCase() === 'blog')) &&
        item.status === 'Published'
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vaultItems]);

  const [visibleCount, setVisibleCount] = useState(4);

  return (
    <div className={`min-h-screen p-4 md:p-10 transition-colors duration-500 ${theme === 'dark' ? 'bg-background-black' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <span className="text-primary-red text-[10px] font-black uppercase tracking-[0.5em] mb-3 block">Editorial Core</span>
          <h1 className={`text-4xl md:text-7xl font-black italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            THE <span className="text-primary-red glow-red">BLOG</span>
          </h1>
        </header>

        {blogPosts.length > 0 ? (
          <div className="space-y-20">
            {blogPosts.slice(0, visibleCount).map((post) => (
              <Link key={post.id} to={`/news/${post.id}`} className="group grid grid-cols-1 lg:grid-cols-12 gap-10 lg:items-center">
                <div className={`lg:col-span-7 aspect-[16/9] relative rounded-[3rem] overflow-hidden border ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                  <img src={post.thumbnailUrl || post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={post.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-10 left-10 flex gap-2">
                    {post.categories.slice(0, 3).map(c => (
                      <span key={c} className="px-4 py-2 bg-primary-red text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-5 space-y-6">
                  <div className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    <span className={`h-1 w-1 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-slate-300'}`}></span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className={`text-3xl md:text-5xl font-black italic uppercase tracking-tighter group-hover:text-primary-red transition-colors leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{post.title}</h2>
                  <p className={`text-lg line-clamp-3 italic ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>"{post.content.substring(0, 200)}..."</p>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="size-12 rounded-2xl bg-primary-red/10 border border-primary-red/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-red text-xl">person</span>
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{post.author}</span>
                  </div>
                </div>
              </Link>
            ))}
            {visibleCount < blogPosts.length && (
              <div className="flex justify-center pt-10 pb-20">
                <button
                  onClick={() => setVisibleCount(prev => prev + 4)}
                  className="px-12 py-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary-red hover:text-white transition-all shadow-xl active:scale-95"
                >
                  Expand Archive
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`py-40 text-center rounded-[3rem] border border-dashed ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-6">draw</span>
            <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-sm">Editorial node currently offline</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
