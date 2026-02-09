
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContent } from '../App';
import { geminiService } from '../services/gemini';
import { Comment, VaultItem } from '../types';

const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

const NewsDetail: React.FC = () => {
  const { id } = useParams();
  const { vaultItems, updateItem, theme } = useContent();
  const navigate = useNavigate();
  const news = vaultItems.find(item => item.id === id);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [userScore, setUserScore] = useState<number>(10);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [visibleLimit, setVisibleLimit] = useState(5);

  useEffect(() => {
    if (news) {
      setLocalComments(news.comments || []);
    }
  }, [news?.id, news?.comments]);

  useEffect(() => {
    if (!news) return;
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      updateItem({ ...news, views: (news.views || 0) + 1 });
    }, 2000);
    return () => clearTimeout(timer);
  }, [news?.id]);

  const relatedContent = useMemo(() => {
    if (!news) return [];
    return vaultItems
      .filter(v => v.id !== news.id && v.status === 'Published')
      .map(v => {
        let score = 0;
        v.categories.forEach(c => {
          if (news.categories.includes(c)) score += 10;
        });
        if (v.type === news.type) score += 5;
        return { item: v, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(r => r.item);
  }, [news, vaultItems]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news?.title,
          text: news?.summary || news?.content.substring(0, 100),
          url: window.location.href,
        });
      } catch (err) { console.error("Share failed", err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  if (!news) return null;

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !authorName.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: authorName,
      email: authorEmail || undefined,
      date: new Date().toLocaleDateString(),
      text: commentText,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authorName,
      userScore: userScore,
      isVisible: true
    };

    // Optimistic Update
    const updatedComments = [...localComments, newComment];
    setLocalComments(updatedComments);

    setCommentText('');
    setAuthorName('');
    setAuthorEmail('');
    setUserScore(10);

    try {
      await updateItem({
        ...news,
        comments: updatedComments,
        userRatings: [...(news.userRatings || []), userScore]
      });
      // Optionally show a subtle success toast instead of alert
    } catch (error) {
      console.error("Failed to post comment:", error);
      // Rollback on failure
      setLocalComments(localComments);
      alert("Multiversal uplink failed. Please retry.");
    }
  };

  const filteredComments = localComments.filter(c => c.isVisible);
  const displayComments = filteredComments.slice(0, visibleLimit);

  const averageScore = news.userRatings && news.userRatings.length > 0
    ? (news.userRatings.reduce((a, b) => a + b, 0) / news.userRatings.length).toFixed(1)
    : 'N/A';

  const ytId = getYouTubeId(news.videoUrl || '');

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 animate-fadeIn ${theme === 'dark' ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="w-full max-w-7xl mx-auto md:px-8">
        <header className={`sticky top-0 z-50 w-full flex items-center justify-between px-6 py-6 backdrop-blur-xl border-b transition-colors ${theme === 'dark' ? 'bg-black/80 border-white/5' : 'bg-white/80 border-slate-200'}`}>
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-primary-red hover:text-white transition-all shadow-sm">
            <span className="material-symbols-outlined text-sm font-black">arrow_back_ios_new</span>
          </button>

          <div className="flex gap-3">
            <button onClick={() => updateItem({ ...news, likes: (news.likes || 0) + 1 })} className="px-6 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white flex items-center gap-2 hover:bg-primary-red/10 group transition-all">
              <span className="material-symbols-outlined text-lg text-primary-red group-hover:scale-125 transition-transform">favorite</span>
              <span className="text-xs font-black uppercase">{news.likes || 0}</span>
            </button>
            <button onClick={handleShare} className="px-6 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white flex items-center gap-2 hover:bg-primary-blue/10 group transition-all">
              <span className="material-symbols-outlined text-lg text-primary-blue">{shareSuccess ? 'check' : 'share'}</span>
              <span className="text-xs font-black uppercase">{shareSuccess ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto py-10 px-6">
          <div className="relative aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-12 shadow-2xl border border-slate-200 dark:border-white/10 group">
            <img src={news.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 p-6 md:p-10 lg:p-16 w-full">
              <div className="flex flex-wrap gap-2 mb-4">
                {news.categories.map(c => (
                  <span key={c} className="bg-primary-red px-4 py-1.5 text-[10px] font-black uppercase text-white rounded-full tracking-widest">{c}</span>
                ))}
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-black leading-tight tracking-tighter text-white uppercase italic drop-shadow-2xl mb-4 break-words">{news.title}</h1>

              {/* Author and Date Info */}
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                {news.author && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary-blue">person</span>
                    <span className="text-sm font-medium">{news.author}</span>
                  </div>
                )}
                {news.date && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary-red">calendar_today</span>
                    <span className="text-sm font-medium">{new Date(news.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-green-400">visibility</span>
                  <span className="text-sm font-medium">{(news.views || 0).toLocaleString()} views</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              {/* TACTICAL BRIEFING: VIDEO PLAYER */}
              {news.videoUrl && (
                <section className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary-red animate-pulse">play_circle</span>
                      <h2 className="text-xl font-black uppercase italic tracking-tighter">Tactical <span className="text-primary-red">Briefing</span></h2>
                    </div>
                    <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-gray-500">Multiversal Stream Active</span>
                  </div>
                  <div className="aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-black border border-white/10 shadow-[0_20px_60px_rgba(242,13,13,0.15)] ring-1 ring-white/5">
                    {ytId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=0&showinfo=0`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={news.videoUrl} className="w-full h-full" controls playsInline />
                    )}
                  </div>
                </section>
              )}

              <article className={`max-w-4xl prose prose-slate dark:prose-invert transition-colors duration-500 overflow-hidden`}>
                {news.content.split('\n\n').map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={`text-lg md:text-xl font-medium leading-relaxed md:leading-[1.85] tracking-tight mb-10 selection:bg-primary-red selection:text-white ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'
                      }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </article>

              <section id="comments" className="pt-20 border-t border-white/5 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <span className="text-primary-blue text-[10px] font-black uppercase tracking-[0.5em] mb-2 block">Community Feedback</span>
                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">READERS <span className="text-primary-blue">REVIEWS</span></h2>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] flex items-center gap-4">
                    <span className="text-4xl md:text-5xl font-black italic text-primary-blue">{averageScore}</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Average Grid Score</span>
                      <span className="text-[9px] font-bold text-gray-600 uppercase">{localComments.length} Transmissions</span>
                    </div>
                  </div>
                </div>

                <div className={`p-6 md:p-10 border rounded-2xl md:rounded-[3.5rem] shadow-2xl transition-colors ${theme === 'dark' ? 'bg-surface-dark border-white/5' : 'bg-white border-slate-100'}`}>
                  <form onSubmit={handleComment} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>Identity (Name)*</label>
                        <input required type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Nexus ID..." className={`w-full border rounded-xl md:rounded-2xl p-4 md:p-5 text-sm font-bold outline-none focus:border-primary-blue transition-all ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                      </div>
                      <div className="space-y-3">
                        <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>Uplink (Email - Optional)</label>
                        <input type="email" value={authorEmail} onChange={e => setAuthorEmail(e.target.value)} placeholder="email@multiverse.com (Optional)" className={`w-full border rounded-xl md:rounded-2xl p-4 md:p-5 text-sm font-bold outline-none focus:border-primary-blue transition-all ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center ml-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>Multiversal Rating</label>
                        <span className="text-xl md:text-2xl font-black text-primary-blue italic">{userScore}/10</span>
                      </div>
                      <input type="range" min="1" max="10" step="1" value={userScore} onChange={e => setUserScore(parseInt(e.target.value))} className={`w-full accent-primary-blue h-2 rounded-full appearance-none cursor-pointer ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`} />
                    </div>

                    <div className="space-y-3">
                      <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>Signal Data (Comment)*</label>
                      <textarea required value={commentText} onChange={e => setCommentText(e.target.value)} rows={4} placeholder="Establishing connection... Write your review." className={`w-full border rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-sm font-medium outline-none focus:border-primary-blue transition-all resize-none ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}></textarea>
                    </div>

                    <button type="submit" className="w-full py-4 md:py-5 bg-primary-blue text-black font-black text-[10px] md:text-[11px] uppercase tracking-[0.5em] rounded-xl md:rounded-[2rem] shadow-[0_10px_40px_rgba(0,242,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all">Broadcast Review</button>
                  </form>
                </div>

                <div className="space-y-8">
                  {displayComments.map(comment => (
                    <div key={comment.id} className={`p-6 md:p-8 border rounded-2xl md:rounded-[3rem] flex flex-col md:flex-row gap-6 md:gap-8 group transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                      <div className="shrink-0 flex flex-row md:flex-col items-center gap-4 md:gap-0">
                        <img src={comment.avatar} className="size-12 md:size-16 rounded-xl md:rounded-[1.5rem] border-2 border-primary-blue/20 md:mb-4" alt="" />
                        <div className="size-10 md:size-12 rounded-xl bg-primary-blue/10 border border-primary-blue/20 flex items-center justify-center">
                          <span className="text-xs md:text-sm font-black text-primary-blue italic leading-none">{comment.userScore}</span>
                          <span className="text-[6px] md:text-[7px] font-black uppercase text-primary-blue/60 ml-0.5">Pts</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`text-base md:text-lg font-black uppercase italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{comment.author}</h4>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{comment.date}</span>
                          </div>
                        </div>
                        <p className={`text-sm md:text-base italic leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>"{comment.text}"</p>
                      </div>
                    </div>
                  ))}

                  {filteredComments.length > visibleLimit && (
                    <button
                      onClick={() => setVisibleLimit(prev => prev + 5)}
                      className="w-full py-6 border-2 border-dashed border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-primary-blue hover:border-primary-blue/30 transition-all"
                    >
                      View More Signal Data ({filteredComments.length - visibleLimit} Remaining)
                    </button>
                  )}

                  {filteredComments.length === 0 && (
                    <div className="py-20 text-center opacity-20 italic font-black uppercase tracking-widest">No reader signals yet...</div>
                  )}
                </div>
              </section>
            </div>

            <aside className="lg:col-span-4 space-y-12">
              <div className={`p-6 md:p-8 border rounded-2xl md:rounded-[3rem] sticky top-32 transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <span className="size-2 md:size-3 bg-primary-blue rounded-full animate-pulse"></span> Related <span className="text-primary-blue">Signals</span>
                </h3>
                <div className="space-y-6">
                  {relatedContent.map(item => (
                    <Link key={item.id} to={`/news/${item.id}`} className={`group flex gap-4 items-center p-3 md:p-4 rounded-xl md:rounded-2xl transition-all border border-transparent ${theme === 'dark' ? 'hover:bg-white/5 hover:border-white/5' : 'hover:bg-slate-50 hover:border-slate-100'}`}>
                      <img src={item.thumbnailUrl || item.imageUrl} className="size-16 md:size-20 rounded-xl md:rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 mb-1">
                          {item.categories.slice(0, 1).map(c => (
                            <span key={c} className="text-[7px] md:text-[8px] font-black uppercase text-primary-blue tracking-widest">{c}</span>
                          ))}
                        </div>
                        <h4 className={`text-[10px] md:text-xs font-black uppercase italic leading-tight group-hover:text-primary-blue transition-colors break-words line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                        <p className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase mt-1 truncate">{item.type} • {new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))}
                  {relatedContent.length === 0 && (
                    <p className="text-[10px] text-gray-500 uppercase font-black text-center py-10 opacity-30 italic">No similar signals nearby...</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewsDetail;
