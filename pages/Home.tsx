
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { useContent } from '../App';
import { VaultItem } from '../types';

const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

const Home: React.FC = () => {
  const { vaultItems, theme } = useContent();
  const [activeVideo, setActiveVideo] = useState<VaultItem | null>(null);
  const [visibleFeedCount, setVisibleFeedCount] = useState(6);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const published = useMemo(() =>
    vaultItems
      .filter(item => item.status === 'Published')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    , [vaultItems]);

  const heroItems = useMemo(() => published.filter(item => item.isHero), [published]);
  const scrollerItems = useMemo(() => published.filter(item => item.isScroller), [published]);
  const marvelTrending = useMemo(() => published.filter(item => item.isMarvelTrending).slice(0, 3), [published]);
  const dcTrending = useMemo(() => published.filter(item => item.isDCTrending).slice(0, 3), [published]);
  const mainFeedItems = published;

  useEffect(() => {
    if (heroItems.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [heroItems.length, heroIndex]);

  // CRITICAL: Disable ALL scrolling when video modal is open
  useEffect(() => {
    if (activeVideo) {
      const scrollY = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      const scrollY = document.body.style.top;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    }
  }, [activeVideo]);

  const handleNext = () => setHeroIndex(p => (p + 1) % (heroItems.length || 1));
  const handlePrev = () => setHeroIndex(p => (p === 0 ? (heroItems.length - 1) : p - 1));

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) handlePrev();
    else if (deltaX < -50) handleNext();
    touchStartX.current = null;
  };

  const openVideo = (item: VaultItem) => { if (item.videoUrl) setActiveVideo(item); };

  // Trending items - sorted by views + likes (engagement score)
  const trendingItems = useMemo(() =>
    published
      .map(item => ({ ...item, engagementScore: (item.views || 0) + (item.likes || 0) * 10 }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5)
    , [published]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 animate-fadeIn">

      {/* Hero Section - Two Column Layout */}
      <div className="hero-section grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 mb-4 h-auto min-h-[420px] lg:h-[calc(100vh-140px)] lg:max-h-[550px]">

        {/* Trending Sidebar - Right (Full Height) */}
        <aside className="hidden lg:flex lg:col-span-3 lg:order-2 flex-col bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
            <span className="material-symbols-outlined text-primary-red text-xl">trending_up</span>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Trending Now</h3>
          </div>
          <div className="flex-1 flex flex-col">
            {trendingItems.map((item, idx) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="flex-1 flex gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition-all group"
              >
                <span className="text-3xl font-black text-primary-red/40 group-hover:text-primary-red transition-colors">{idx + 1}</span>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-primary-red transition-colors mb-1">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 font-medium">{item.categories[0]}</span>
                    <span className="text-[10px] text-gray-600">•</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[11px]">visibility</span>
                      {(item.views || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[11px]">favorite</span>
                      {(item.likes || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        {/* Hero Slider - Left */}
        <div className="lg:col-span-9 lg:order-1 flex flex-col gap-2 lg:gap-3">
          {heroItems.length > 0 && (
            <section
              className="relative flex-1 min-h-[50vh] lg:min-h-0 rounded-xl lg:rounded-2xl overflow-hidden group shadow-2xl border border-white/5 bg-black"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {heroItems.map((item, idx) => (
                <div key={item.id} className={`absolute inset-0 transition-all duration-[1.5s] ease-in-out ${idx === heroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
                  <img src={item.imageUrl || item.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                  <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full md:w-3/4 animate-fadeIn">
                    <div className="flex gap-2 mb-4">
                      {item.categories.slice(0, 2).map(c => (
                        <span key={c} className="bg-primary-red px-2 py-1 md:px-3 md:py-1 text-[8px] md:text-[8px] font-black uppercase text-white rounded-full tracking-widest shadow-lg">{c}</span>
                      ))}
                    </div>
                    <h1 className="text-2xl md:text-2xl lg:text-3xl font-black text-white italic uppercase tracking-tighter line-clamp-2 leading-tight md:leading-[0.95] mb-5 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                      {item.title}
                    </h1>
                    <div className="flex flex-wrap gap-3 pb-2">
                      <Link to={`/news/${item.id}`} className="bg-white text-black px-4 py-2 md:px-5 rounded-xl font-black text-[9px] md:text-[8px] uppercase tracking-widest hover:bg-primary-red hover:text-white transition-all shadow-2xl active:scale-95">Analyze Signal</Link>
                      {item.videoUrl && (
                        <button onClick={() => openVideo(item)} className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-xl font-black text-[9px] md:text-[8px] uppercase tracking-widest hover:bg-primary-blue hover:text-black transition-all flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">play_arrow</span> Briefing
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Slider Controls */}
              <div className="absolute bottom-3 right-3 flex gap-2 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handlePrev} className="size-8 rounded-lg bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-primary-red transition-all shadow-2xl">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button onClick={handleNext} className="size-8 rounded-lg bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-primary-red transition-all shadow-2xl">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>

              {/* Slide indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {heroItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === heroIndex ? 'bg-primary-red w-6' : 'bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Breaking Ticker */}
          {scrollerItems.length > 0 && (
            <div className="bg-primary-red h-9 lg:h-10 rounded-lg lg:rounded-xl flex items-center overflow-hidden shadow-xl flex-shrink-0">
              <div className="px-3 lg:px-4 bg-primary-red z-10 border-r border-white/10 h-full flex items-center">
                <span className="text-[7px] lg:text-[8px] font-black uppercase text-white tracking-[0.1em] whitespace-nowrap">Breaking</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="animate-marquee inline-flex gap-6 lg:gap-10 py-2">
                  {scrollerItems.concat(scrollerItems).map((s, i) => (
                    <Link key={i} to={`/news/${s.id}`} className="text-[8px] lg:text-[9px] font-bold text-white uppercase tracking-wider hover:underline whitespace-nowrap">/// {s.title}</Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content below the fold */}
      <div className="space-y-16 pt-8">

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Transmission Archive (Main Feed) */}
          <div className="lg:col-span-8 space-y-16">
            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary-blue text-3xl animate-pulse">rss_feed</span>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Transmission <span className="text-primary-blue">Archive</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {mainFeedItems.slice(0, visibleFeedCount).map(item => (
                  <Link key={item.id} to={`/news/${item.id}`} className={`group rounded-[3.5rem] border overflow-hidden transition-all hover:-translate-y-2 shadow-2xl ${theme === 'dark' ? 'bg-surface-dark border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img src={item.thumbnailUrl || item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      {item.videoUrl && (
                        <div className="absolute top-6 right-6 p-2 bg-black/50 backdrop-blur-md rounded-xl">
                          <span className="material-symbols-outlined text-white text-sm">videocam</span>
                        </div>
                      )}
                    </div>
                    <div className="p-10">
                      <div className="flex gap-2 mb-4">
                        {item.categories.slice(0, 2).map(c => (
                          <span key={c} className="text-primary-red text-[9px] font-black uppercase tracking-widest">{c}</span>
                        ))}
                      </div>
                      <h3 className={`text-2xl font-black uppercase italic leading-tight tracking-tighter mb-6 group-hover:text-primary-red transition-colors line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {item.title}
                      </h3>
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 border-t pt-6 border-white/5">
                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">verified</span> {item.author}</span>
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {visibleFeedCount < mainFeedItems.length && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={() => setVisibleFeedCount(prev => prev + 6)}
                    className="px-12 py-5 bg-primary-blue text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-[2rem] hover:bg-white transition-all shadow-[0_10px_40px_rgba(0,242,255,0.2)]"
                  >
                    Load More Intelligence
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            <div className="p-10 bg-surface-dark border border-primary-blue/20 rounded-[3.5rem] relative overflow-hidden group shadow-2xl">
              <div className="absolute -top-12 -right-12 size-40 bg-primary-blue/5 rounded-full border border-primary-blue/10"></div>
              <div className="relative z-10 space-y-8 text-center">
                <h3 className="text-primary-blue text-[11px] font-black uppercase tracking-[0.4em]">Global Security Hub</h3>
                <p className="text-gray-500 text-sm italic leading-relaxed">Stay ahead of every variant and multiversal timeline shift.</p>
                <button
                  onClick={() => setShowSecurityModal(true)}
                  className="w-full py-5 bg-primary-blue text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl shadow-xl shadow-primary-blue/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Establish Link
                </button>
              </div>
            </div>

            <div className="space-y-8 p-8 bg-white/5 border border-white/5 rounded-[3.5rem]">
              <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <span className="size-2 rounded-full bg-primary-red animate-pulse"></span> MARVEL <span className="text-primary-red">SIGNALS</span>
              </h2>
              <div className="space-y-6">
                {marvelTrending.map(item => (
                  <Link key={item.id} to={`/news/${item.id}`} className="flex gap-4 group items-center p-4 hover:bg-white/5 rounded-2xl transition-all">
                    <img src={item.thumbnailUrl || item.imageUrl} className="size-16 rounded-2xl object-cover shadow-lg" alt="" />
                    <div>
                      <h4 className={`text-[11px] font-black uppercase italic group-hover:text-primary-red transition-colors line-clamp-2 leading-tight tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                      <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-8 p-8 bg-white/5 border border-white/5 rounded-[3.5rem]">
              <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <span className="size-2 rounded-full bg-primary-blue animate-pulse"></span> DC <span className="text-primary-blue">SIGNALS</span>
              </h2>
              <div className="space-y-6">
                {dcTrending.map(item => (
                  <Link key={item.id} to={`/news/${item.id}`} className="flex gap-4 group items-center p-4 hover:bg-white/5 rounded-2xl transition-all">
                    <img src={item.thumbnailUrl || item.imageUrl} className="size-16 rounded-2xl object-cover shadow-lg" alt="" />
                    <div>
                      <h4 className={`text-[11px] font-black uppercase italic group-hover:text-primary-blue transition-colors line-clamp-2 leading-tight tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                      <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* VIDEO MODAL - Rendered via Portal to document.body */}
        {
          activeVideo && ReactDOM.createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Blurred backdrop */}
              <div
                onClick={() => setActiveVideo(null)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(20px)',
                  cursor: 'pointer',
                }}
              />

              {/* Modal container */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 10,
                  width: '90vw',
                  maxWidth: '800px',
                  backgroundColor: '#000',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 30px 100px rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setActiveVideo(null)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 100,
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)'}
                >
                  ✕
                </button>

                {/* Video */}
                <div style={{ aspectRatio: '16/9', width: '100%' }}>
                  {activeVideo.videoUrl?.includes('youtube.com') || activeVideo.videoUrl?.includes('youtu.be') ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.videoUrl)}?autoplay=1&rel=0&modestbranding=1`}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      title={activeVideo.title || 'Video'}
                    />
                  ) : (
                    <video
                      src={activeVideo.videoUrl}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
                      controls
                      autoPlay
                      playsInline
                    />
                  )}
                </div>

                {/* Title */}
                <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.9)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {activeVideo.title}
                  </h3>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Security Hub Modal */}
        {showSecurityModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/98 animate-fadeIn">
            <div className="max-w-md w-full bg-surface-dark border border-primary-blue/20 rounded-[3.5rem] p-12 text-center space-y-8 shadow-[0_0_120px_rgba(0,242,255,0.15)]">
              <span className="material-symbols-outlined text-primary-blue text-8xl animate-pulse">shield</span>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Uplink Established</h2>
              <p className="text-gray-400 text-sm leading-relaxed">Intelligence identity confirmed. You are now receiving encrypted multiversal news summaries directly from Command HQ.</p>
              <button onClick={() => setShowSecurityModal(false)} className="w-full py-5 bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest rounded-3xl hover:text-white transition-all border border-white/5">Close Terminal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

