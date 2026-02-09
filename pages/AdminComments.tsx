import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContent } from '../App';
import { adminHandlers } from '../storage/handlers';
import AdminLayout from '../components/AdminLayout';

const AdminComments: React.FC = () => {
  const { vaultItems, refreshItems } = useContent();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [articleFilter, setArticleFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week'>('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Flatten comments with their parent article info
  const allComments = useMemo(() => {
    return vaultItems.flatMap(item =>
      (item.comments || []).map(c => ({
        ...c,
        articleId: item.id,
        articleTitle: item.title
      }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vaultItems]);

  const uniqueArticles = useMemo(() => {
    const titles = vaultItems.map(i => ({ id: i.id, title: i.title }));
    return Array.from(new Set(titles.map(t => JSON.stringify(t)))).map(s => JSON.parse(s));
  }, [vaultItems]);

  const filtered = useMemo(() => {
    return allComments.filter(c => {
      const matchesSearch =
        c.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.articleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesArticle = articleFilter === 'all' || c.articleId === articleFilter;

      let matchesTime = true;
      if (timeFilter !== 'all') {
        const commentDate = new Date(c.date);
        const now = new Date();
        if (timeFilter === 'today') {
          matchesTime = commentDate.toDateString() === now.toDateString();
        } else if (timeFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesTime = commentDate >= weekAgo;
        }
      }

      return matchesSearch && matchesArticle && matchesTime;
    });
  }, [allComments, searchTerm, articleFilter, timeFilter]);

  const displayComments = filtered.slice(0, visibleCount);

  const handleToggle = async (artId: string, comId: string) => {
    setIsRefreshing(true);
    await adminHandlers.toggleCommentVisibility(artId, comId);
    await refreshItems();
    setIsRefreshing(false);
  };

  const handleDelete = async (artId: string, comId: string) => {
    if (window.confirm("Terminate this signal transmission permanently? This will also remove the associated rating from grid calculations.")) {
      setIsRefreshing(true);
      await adminHandlers.deleteComment(artId, comId);
      await refreshItems();
      setIsRefreshing(false);
    }
  };

  return (
    <AdminLayout title="REVIEW CONTROL" subtitle="Reader Intel Moderation">
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1a] h-full overflow-hidden">
        {/* Advanced Filters */}
        <div className="px-6 md:px-12 py-8 border-b border-white/5 flex flex-col lg:flex-row gap-6 bg-black/20">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">search</span>
            <input
              type="text"
              placeholder="Search by name, email, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[11px] font-bold focus:border-primary-blue outline-none transition-all text-white"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={articleFilter}
              onChange={(e) => setArticleFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-gray-400 outline-none focus:border-primary-blue max-w-[200px]"
            >
              <option value="all">ALL ARTICLES</option>
              {uniqueArticles.map((art: any) => (
                <option key={art.id} value={art.id}>{art.title.toUpperCase()}</option>
              ))}
            </select>

            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
              {(['all', 'today', 'week'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${timeFilter === f ? 'bg-primary-blue text-black' : 'text-gray-500 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 no-scrollbar relative">
          {isRefreshing && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="size-10 border-2 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {displayComments.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/5 rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                    <tr>
                      <th className="px-10 py-6">Identity & Intel</th>
                      <th className="px-10 py-6">Signal Transmission</th>
                      <th className="px-10 py-6">Score</th>
                      <th className="px-10 py-6 text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {displayComments.map(comment => (
                      <tr key={comment.id} className={`hover:bg-white/5 transition-all group ${!comment.isVisible ? 'opacity-40' : ''}`}>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <img src={comment.avatar} className="size-14 rounded-2xl border border-white/10 object-cover" alt="" />
                            <div>
                              <p className="text-sm font-black uppercase italic text-white leading-none mb-1">{comment.author}</p>
                              <p className="text-[10px] text-primary-blue font-bold tracking-widest lowercase mb-1">{comment.email || 'NO EMAIL LOGGED'}</p>
                              <Link to={`/news/${comment.articleId}`} className="text-[9px] font-bold text-gray-600 uppercase hover:text-white transition-all underline underline-offset-4 decoration-gray-800">Linked: {comment.articleTitle}</Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="max-w-md">
                            <p className="text-xs text-gray-300 leading-relaxed italic line-clamp-2">"{comment.text}"</p>
                            <p className="text-[9px] font-black text-gray-600 uppercase mt-2">{comment.date}</p>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className={`size-12 rounded-xl flex flex-col items-center justify-center border ${comment.userScore >= 8 ? 'bg-green-500/10 border-green-500/30 text-green-500' : comment.userScore >= 5 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-primary-red/10 border-primary-red/30 text-primary-red'}`}>
                            <span className="text-sm font-black italic leading-none">{comment.userScore}</span>
                            <span className="text-[7px] font-black uppercase opacity-60">Pts</span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleToggle(comment.articleId, comment.id)}
                              className={`p-3 rounded-xl transition-all ${comment.isVisible ? 'bg-white/5 text-gray-500 hover:text-white' : 'bg-primary-blue text-black'}`}
                              title={comment.isVisible ? 'Censor Transmission' : 'Restore Signal'}
                            >
                              <span className="material-symbols-outlined text-sm">{comment.isVisible ? 'visibility_off' : 'visibility'}</span>
                            </button>
                            <button
                              onClick={() => handleDelete(comment.articleId, comment.id)}
                              className="p-3 bg-white/5 text-gray-500 hover:text-primary-red hover:bg-primary-red/10 rounded-xl transition-all"
                              title="Terminate Pulse"
                            >
                              <span className="material-symbols-outlined text-sm">delete_forever</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filtered.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="w-full py-8 bg-white/5 border border-dashed border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-primary-blue hover:border-primary-blue/30 transition-all mb-12"
                >
                  Load More Signals ({filtered.length - visibleCount} Buffered)
                </button>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-40 opacity-20">
              <span className="material-symbols-outlined text-8xl mb-4 text-primary-blue">reviews</span>
              <p className="text-xl font-black uppercase tracking-widest">No filter matches detected</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminComments;
