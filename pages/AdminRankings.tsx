
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../App';
import { storageService } from '../services/storage';
import { RankingList } from '../types';
import AdminLayout from '../components/AdminLayout';

const AdminRankings: React.FC = () => {
  const { vaultItems } = useContent();
  const [lists, setLists] = useState<RankingList[]>([]);
  const [editingList, setEditingList] = useState<Partial<RankingList> | null>(null);

  useEffect(() => {
    const loadLists = async () => {
      const data = await storageService.getRankingLists();
      setLists(data);
    };
    loadLists();
  }, []);

  const handleSave = async () => {
    if (!editingList?.title) return;
    const newList = {
      id: editingList.id || Date.now().toString(),
      title: editingList.title,
      description: editingList.description || '',
      type: editingList.type || 'Best',
      items: editingList.items || []
    } as RankingList;

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
    setEditingList({
      ...editingList,
      items: [...currentItems, { vaultItemId: itemId, rank: currentItems.length + 1 }]
    });
  };


  return (
    <AdminLayout>
      <div className="flex flex-col bg-[#0a0f1a] h-full overflow-hidden">
        <header className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-[#0a0f1a]/80 backdrop-blur-xl">
          <div>
            <span className="text-primary-blue text-[10px] font-black uppercase tracking-[0.4em] mb-1 block">Epic Curation</span>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">RANKING <span className="text-primary-blue">COMMAND</span></h1>
          </div>
          <button onClick={() => setEditingList({ title: '', items: [] })} className="px-8 py-3 bg-primary-blue text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Create List</button>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-8 no-scrollbar">
          {editingList ? (
            <div className="max-w-4xl mx-auto bg-surface-dark border border-white/10 rounded-[3rem] p-12 space-y-10 animate-fadeIn">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Edit Neural Ranking</h2>
              <div className="grid grid-cols-2 gap-8">
                <input type="text" placeholder="LIST TITLE" value={editingList.title} onChange={e => setEditingList({ ...editingList, title: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-black uppercase text-white outline-none focus:border-primary-blue" />
                <select value={editingList.type} onChange={e => setEditingList({ ...editingList, type: e.target.value as any })} className="bg-black border border-white/10 rounded-2xl p-4 text-xs font-black uppercase text-white outline-none">
                  <option value="Best">Best Of</option>
                  <option value="Worst">Worst Of</option>
                  <option value="Trending">Trending Hub</option>
                </select>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Signal Assignments</h3>
                <div className="grid grid-cols-1 gap-3">
                  {editingList.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-primary-blue font-black italic">#{item.rank}</span>
                      <span className="text-xs font-bold truncate max-w-xs">{vaultItems.find(v => v.id === item.vaultItemId)?.title}</span>
                      <button onClick={() => setEditingList({ ...editingList, items: editingList.items?.filter((_, idx) => idx !== i).map((it, ni) => ({ ...it, rank: ni + 1 })) })} className="text-primary-red material-symbols-outlined">delete</button>
                    </div>
                  ))}
                  {editingList.items?.length === 0 && <p className="text-center py-6 text-gray-700 text-xs italic uppercase tracking-widest">No signals linked to this rank</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-500">Inject Signals</h4>
                  <div className="h-64 overflow-y-auto space-y-2 no-scrollbar pr-2">
                    {vaultItems.filter(v => v.status === 'Published').map(v => (
                      <button key={v.id} onClick={() => addItemToList(v.id)} className="w-full text-left p-3 bg-white/5 rounded-xl hover:bg-white/10 text-[10px] font-bold truncate uppercase">{v.title}</button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-end gap-4">
                  <button onClick={handleSave} className="w-full py-5 bg-primary-blue text-black font-black text-[11px] uppercase tracking-widest rounded-3xl shadow-xl shadow-primary-blue/20">Commit Changes</button>
                  <button onClick={() => setEditingList(null)} className="w-full py-5 bg-white/5 text-gray-500 font-black text-[11px] uppercase tracking-widest rounded-3xl hover:text-white">Abort Ops</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lists.map(list => (
                <div key={list.id} className="p-10 bg-white/5 border border-white/5 rounded-[3rem] space-y-6 hover:border-primary-blue/30 transition-all">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">{list.title}</h3>
                  <p className="text-xs text-gray-500 italic">{list.items.length} signals tracked</p>
                  <button onClick={() => setEditingList(list)} className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-blue hover:text-black transition-all">Modify Ranks</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRankings;
