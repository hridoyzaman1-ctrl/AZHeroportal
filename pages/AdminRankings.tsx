import React, { useState, useEffect } from 'react';
import { useContent } from '../App';
import { storageService } from '../services/storage';
import { RankingList } from '../types';
import AdminLayout from '../components/AdminLayout';

const AdminRankings: React.FC = () => {
  const { vaultItems } = useContent();
  const [lists, setLists] = useState<RankingList[]>([]);
  const [editingList, setEditingList] = useState<Partial<RankingList> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLists = async () => {
      try {
        const data = await storageService.getRankingLists();
        setLists(data || []);
      } catch (error) {
        console.error("Error loading rankings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadLists();
  }, []);

  const handleSave = async () => {
    if (!editingList?.title) return;

    const newList: RankingList = {
      id: editingList.id || Date.now().toString(),
      title: editingList.title,
      description: editingList.description || '',
      type: editingList.type || 'Best',
      items: editingList.items || []
    };

    const updated = editingList.id
      ? lists.map(l => l.id === newList.id ? newList : l)
      : [...lists, newList];

    setLists(updated);
    await storageService.saveRankingLists(updated);
    setEditingList(null);
  };

  const addItemToList = (itemId: string) => {
    if (!editingList) return;
    const currentItems = editingList.items || [];
    if (currentItems.length >= 10) return alert("Rank quota reached (10 max)");

    // Don't add if already in list
    if (currentItems.some(it => it.vaultItemId === itemId)) return;

    setEditingList({
      ...editingList,
      items: [...currentItems, { vaultItemId: itemId, rank: currentItems.length + 1 }]
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full bg-[#0a0f1a]">
          <div className="text-primary-blue animate-pulse font-black uppercase tracking-[0.5em]">Syncing Rankings...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="RANKING COMMAND" subtitle="Epic Content Curation">
      <div className="flex flex-col bg-[#0a0f1a] h-full overflow-hidden uppercase">
        <div className="flex-1 p-4 md:p-12 space-y-6 md:space-y-12 overflow-y-auto no-scrollbar">
          {!editingList && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
              <div className="md:block hidden">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Operational Data</p>
                <h2 className="text-xl font-black italic uppercase tracking-tighter">{lists.length} ACTIVE <span className="text-primary-blue">SEQUENCES</span></h2>
              </div>
              <button
                onClick={() => setEditingList({ title: '', items: [], type: 'Best', description: '' })}
                className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-primary-blue text-black font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] rounded-2xl active:scale-95 transition-all shadow-[0_0_30px_rgba(0,242,255,0.2)]"
              >
                Initiate New Rank Sequence
              </button>
            </div>
          )}

          {editingList ? (
            <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 space-y-8 md:space-y-10 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
                <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Edit Neural Ranking</h2>
                <span className="text-[9px] md:text-[10px] font-black uppercase text-primary-blue tracking-widest">Buffer Status: Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest px-2">List Title</label>
                  <input
                    type="text"
                    placeholder="LIST TITLE"
                    value={editingList.title}
                    onChange={e => setEditingList({ ...editingList, title: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-black uppercase text-white outline-none focus:border-primary-blue transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest px-2">Curation Bias</label>
                  <select
                    value={editingList.type}
                    onChange={e => setEditingList({ ...editingList, type: e.target.value as any })}
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-black uppercase text-white outline-none focus:border-primary-blue appearance-none"
                  >
                    <option value="Best">Best Of</option>
                    <option value="Worst">Worst Of</option>
                    <option value="Trending">Trending Hub</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Signal Assignments</h3>
                <div className="grid grid-cols-1 gap-3">
                  {(editingList.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-primary-blue/30 transition-all overflow-hidden">
                      <div className="flex items-center gap-4 md:gap-6 min-w-0">
                        <span className="text-primary-blue font-black italic text-base md:text-lg w-6 md:w-8 shrink-0">#{item.rank}</span>
                        <span className="text-[10px] md:text-xs font-bold truncate text-white/90">
                          {vaultItems.find(v => v.id === item.vaultItemId)?.title || 'UNKNOWN SIGNAL'}
                        </span>
                      </div>
                      <button
                        onClick={() => setEditingList({
                          ...editingList,
                          items: editingList.items?.filter((_, idx) => idx !== i).map((it, ni) => ({ ...it, rank: ni + 1 }))
                        })}
                        className="text-gray-600 hover:text-primary-red material-symbols-outlined transition-colors shrink-0"
                      >
                        delete
                      </button>
                    </div>
                  ))}
                  {(editingList.items || []).length === 0 && (
                    <div className="p-8 md:p-12 border border-dashed border-white/10 rounded-2xl md:rounded-3xl text-center text-gray-700 text-[10px] italic uppercase tracking-[0.3em]">
                      No signals linked to this rank
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-8 md:pt-10 border-t border-white/5">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-2">Inject Signals</h4>
                  <div className="h-60 md:h-72 overflow-y-auto space-y-2 no-scrollbar pr-2 md:pr-4">
                    {vaultItems.length > 0 ? (
                      vaultItems.filter(v => v.status === 'Published').map(v => (
                        <button
                          key={v.id}
                          onClick={() => addItemToList(v.id)}
                          disabled={editingList.items?.some(it => it.vaultItemId === v.id)}
                          className={`w-full text-left p-3 md:p-4 rounded-xl text-[9px] md:text-[10px] font-bold truncate uppercase transition-all ${editingList.items?.some(it => it.vaultItemId === v.id)
                            ? 'bg-white/5 opacity-30 cursor-not-allowed'
                            : 'bg-white/5 hover:bg-primary-blue/10 hover:text-primary-blue'
                            }`}
                        >
                          {v.title}
                        </button>
                      ))
                    ) : (
                      <p className="text-[10px] text-gray-700 italic">No published signals available</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-end gap-3 md:gap-4 mt-6 md:mt-0">
                  <button
                    onClick={handleSave}
                    className="w-full py-4 md:py-5 bg-primary-blue text-black font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] rounded-2xl md:rounded-3xl shadow-xl shadow-primary-blue/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Commit Changes
                  </button>
                  <button
                    onClick={() => setEditingList(null)}
                    className="w-full py-4 md:py-5 bg-white/5 text-gray-500 font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] rounded-2xl md:rounded-3xl hover:text-white hover:bg-white/10 transition-all"
                  >
                    Abort Ops
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lists.map(list => (
                <div key={list.id} className="p-10 bg-white/5 border border-white/5 rounded-[3rem] space-y-6 hover:border-primary-blue/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary-blue bg-primary-blue/10 px-3 py-1 rounded-full">{list.type}</span>
                    <button
                      onClick={async () => {
                        if (confirm('Deconstruct this ranking list?')) {
                          const updated = lists.filter(l => l.id !== list.id);
                          setLists(updated);
                          await storageService.saveRankingLists(updated);
                        }
                      }}
                      className="text-gray-600 hover:text-primary-red material-symbols-outlined md:opacity-0 group-hover:opacity-100 transition-all p-2"
                    >
                      delete
                    </button>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-tight">{list.title}</h3>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span className="material-symbols-outlined text-sm">analytics</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest">{list.items.length} signals tracked</p>
                  </div>
                  <button
                    onClick={() => setEditingList(list)}
                    className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-blue hover:text-black transition-all border border-white/5"
                  >
                    Modify Ranks
                  </button>
                </div>
              ))}
              {lists.length === 0 && (
                <div className="col-span-full py-40 border border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center opacity-20">
                  <span className="material-symbols-outlined text-7xl mb-6">leaderboard</span>
                  <p className="text-xl font-black uppercase tracking-[0.5em]">No Rank Lists Defined</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRankings;
