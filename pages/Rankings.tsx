
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../App';
import { storageService } from '../services/storage';
import { RankingList } from '../types';

const Rankings: React.FC = () => {
  const { vaultItems, theme, refreshItems } = useContent();
  const [lists, setLists] = useState<RankingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeListId, setActiveListId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        await refreshItems(); // Ensure we have latest vault items
        const rankingData = await storageService.getRankingLists();
        setLists(rankingData);
        if (rankingData.length > 0) {
          setActiveListId(rankingData[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch rankings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  const activeList = useMemo(() => lists.find(l => l.id === activeListId), [lists, activeListId]);

  const rankedItems = useMemo(() => {
    if (!activeList) return [];
    return activeList.items
      .map(rankItem => {
        const item = vaultItems.find(v => v.id === rankItem.vaultItemId);
        return item ? { ...item, rank: rankItem.rank, override: rankItem.overrideDescription } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.rank - b!.rank);
  }, [activeList, vaultItems]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-background-black' : 'bg-slate-50'}`}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10">
        <header className="mb-16 space-y-10">
          <div>
            <span className="text-primary-blue text-xs font-black uppercase tracking-[0.3em] mb-2 block">Premium Intelligence Hub</span>
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter">EPIC <span className="text-primary-blue glow-blue">TOP 10</span></h1>
          </div>

          {loading ? (
            <div className="flex items-center gap-4 py-8">
              <div className="size-6 border-2 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-blue">Accessing Ranking Data...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {lists.map(list => (
                <button
                  key={list.id}
                  onClick={() => setActiveListId(list.id)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeListId === list.id ? 'bg-primary-blue text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                >
                  {list.title}
                </button>
              ))}
            </div>
          )}
        </header>

        {loading ? (
          <div className="space-y-12">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-64 animate-pulse rounded-[3rem] border ${theme === 'dark' ? 'bg-surface-dark border-white/5' : 'bg-white border-slate-200'}`}></div>
            ))}
          </div>
        ) : rankedItems.length > 0 ? (
          <div className="space-y-12">
            {rankedItems.map((item: any) => (
              <div key={item.id} className={`group grid grid-cols-1 lg:grid-cols-12 gap-10 p-10 rounded-[3rem] border transition-all ${theme === 'dark' ? 'bg-surface-dark/50 border-white/5' : 'bg-white border-slate-200 shadow-sm hover:shadow-xl'}`}>
                <div className="lg:col-span-1 flex items-center justify-center">
                  <span className="text-6xl md:text-8xl font-black italic text-primary-blue opacity-50 group-hover:opacity-100 transition-opacity">0{item.rank}</span>
                </div>
                <div className="lg:col-span-4 aspect-video relative rounded-3xl overflow-hidden shadow-2xl">
                  <img src={item.thumbnailUrl || item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" alt="" />
                </div>
                <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">{item.title}</h2>
                    <div className="flex items-center gap-2 bg-primary-blue/10 px-4 py-2 rounded-xl text-primary-blue text-xs font-black">
                      <span className="material-symbols-outlined text-sm">star</span> {item.rating || '9.5'}
                    </div>
                  </div>
                  <p className="text-gray-400 text-lg leading-relaxed italic">"{item.override || item.content.substring(0, 200)}..."</p>
                  <Link to={`/news/${item.id}`} className="self-start px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-blue hover:text-black transition-all">Full Analysis</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center opacity-20"><p className="text-2xl font-black uppercase italic">No managed ranks found</p></div>
        )}
      </div>
    </div>
  );
};

export default Rankings;
