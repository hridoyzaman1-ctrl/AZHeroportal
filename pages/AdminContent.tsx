
import * as React from 'react';
import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../App';
import { VaultItem, ContentType } from '../types';
import { geminiService } from '../services/gemini';

const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

type SortKey = 'title' | 'date' | 'views' | 'type' | 'categories';
type SortOrder = 'asc' | 'desc';

const AdminContent: React.FC = () => {
  const { vaultItems, addItem, updateItem, deleteItem, categories } = useContent();
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Sectors');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: 'date', order: 'desc' });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<Partial<VaultItem>>({
    title: '', type: 'Article', categories: [], status: 'Published',
    author: 'Command HQ', imageUrl: '', videoUrl: '', thumbnailUrl: '', content: '',
    isHero: false, isScroller: false, isTrending: false, isVideoSection: false, isMainFeed: true,
    isMarvelTrending: false, isDCTrending: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'videoUrl' | 'thumbnailUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAsset = (field: 'imageUrl' | 'videoUrl' | 'thumbnailUrl') => {
    setFormData(prev => ({ ...prev, [field]: '' }));
    if (field === 'imageUrl' && fileInputRef.current) fileInputRef.current.value = '';
    if (field === 'videoUrl' && videoInputRef.current) videoInputRef.current.value = '';
    if (field === 'thumbnailUrl' && thumbInputRef.current) thumbInputRef.current.value = '';
  };

  const requestSort = (key: SortKey) => {
    let order: SortOrder = 'asc';
    if (sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }
    setSortConfig({ key, order });
  };

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let items = vaultItems.filter(i => {
      const matchesSearch = i.title.toLowerCase().includes(term) || i.author.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === 'All Sectors' || i.categories.includes(categoryFilter);
      return matchesSearch && matchesCategory;
    });

    items.sort((a, b) => {
      let aVal: any = a[sortConfig.key];
      let bVal: any = b[sortConfig.key];

      if (sortConfig.key === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      } else if (sortConfig.key === 'categories') {
        aVal = a.categories[0] || '';
        bVal = b.categories[0] || '';
      }

      if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [vaultItems, searchTerm, categoryFilter, sortConfig]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSorted.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredAndSorted.map(i => i.id)));
  };

  const toggleSelectItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleOpenModal = (item?: VaultItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ ...item, categories: [...(item.categories || [])] });
    }
    else {
      setEditingId(null);
      resetForm();
    }
    setShowModal(true);
  };

  const handleDeploy = async () => {
    if (!formData.title || !formData.content) return alert("Incomplete operational data detected.");
    const finalData = {
      ...(formData as VaultItem),
      id: editingId || Date.now().toString(),
      date: formData.date || new Date().toISOString(),
      views: formData.views || 0,
      likes: formData.likes || 0,
      comments: formData.comments || [],
      userRatings: formData.userRatings || []
    };
    try {
      if (editingId) await updateItem(finalData);
      else await addItem(finalData);
      setShowModal(false);
    } catch (error: any) {
      console.error("Deploy failed:", error);
      alert(`Failed to commit signal: ${error?.message || error}`);
    }
  };

  const resetForm = () => setFormData({
    title: '', type: 'Article', categories: [], status: 'Published',
    author: 'Command HQ', imageUrl: '', videoUrl: '', thumbnailUrl: '', content: '',
    isHero: false, isScroller: false, isTrending: false, isVideoSection: false, isMainFeed: true,
    isMarvelTrending: false, isDCTrending: false
  });

  const handleAIGenerate = async () => {
    if (!formData.title) return;
    setIsGenerating(true);
    const result = await geminiService.generateSummary(formData.title);
    setFormData(prev => ({ ...prev, content: result }));
    setIsGenerating(false);
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return <span className="material-symbols-outlined text-[10px] opacity-20">sort</span>;
    return <span className={`material-symbols-outlined text-[10px] text-primary-blue`}>{sortConfig.order === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>;
  };

  const ytId = getYouTubeId(formData.videoUrl || '');

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <aside className="w-72 bg-[#0c0c0c] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-10 border-b border-white/5">
          <Link to="/" className="text-2xl font-black italic tracking-tighter text-primary-red flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl animate-boltFlash">bolt</span> COMMAND
          </Link>
        </div>
        <nav className="flex-1 p-8 space-y-4">
          <Link to="/admin" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"><span className="material-symbols-outlined">grid_view</span><span className="font-bold text-[11px] uppercase tracking-widest">Dashboard</span></Link>
          <Link to="/admin/content" className="flex items-center gap-5 p-5 rounded-2xl bg-primary-blue/10 text-primary-blue border border-primary-blue/20 transition-all"><span className="material-symbols-outlined">inventory_2</span><span className="font-bold text-[11px] uppercase tracking-widest">Vault Content</span></Link>
          <Link to="/admin/rankings" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"><span className="material-symbols-outlined">trophy</span><span className="font-bold text-[11px] uppercase tracking-widest">Rankings</span></Link>
          <Link to="/admin/settings" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"><span className="material-symbols-outlined">settings</span><span className="font-bold text-[11px] uppercase tracking-widest">Settings</span></Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col bg-[#0a0f1a] overflow-hidden">
        <header className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-[#0a0f1a]/80 backdrop-blur-xl sticky top-0 z-40 shadow-2xl">
          <div><span className="text-primary-blue text-[10px] font-black uppercase tracking-[0.4em] mb-1 block">Signal Storage</span><h1 className="text-3xl font-black italic uppercase tracking-tighter">THE <span className="text-primary-blue">VAULT</span></h1></div>
          <div className="flex items-center gap-6">
            <div className="relative w-64"><span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">search</span><input type="text" placeholder="Filter signals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold focus:border-primary-blue outline-none transition-all" /></div>
            <button onClick={() => handleOpenModal()} className="px-8 py-3 bg-primary-blue text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Inject Intel</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-8 no-scrollbar">
          <div className="bg-white/5 border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                <tr>
                  <th className="px-10 py-6 w-10 text-center"><input type="checkbox" checked={selectedIds.size === filteredAndSorted.length && filteredAndSorted.length > 0} onChange={toggleSelectAll} className="size-4 bg-black border-white/10 rounded focus:ring-primary-blue text-primary-blue cursor-pointer" /></th>
                  <th className="px-6 py-6 cursor-pointer hover:bg-white/10 transition-colors select-none" onClick={() => requestSort('title')}>
                    <div className="flex items-center gap-2">Signal Summary {getSortIndicator('title')}</div>
                  </th>
                  <th className="px-10 py-6 cursor-pointer hover:bg-white/10 transition-colors select-none" onClick={() => requestSort('categories')}>
                    <div className="flex items-center gap-2">Category {getSortIndicator('categories')}</div>
                  </th>
                  <th className="px-10 py-6 cursor-pointer hover:bg-white/10 transition-colors select-none" onClick={() => requestSort('type')}>
                    <div className="flex items-center gap-2">Type {getSortIndicator('type')}</div>
                  </th>
                  <th className="px-10 py-6 cursor-pointer hover:bg-white/10 transition-colors select-none" onClick={() => requestSort('date')}>
                    <div className="flex items-center gap-2">Date {getSortIndicator('date')}</div>
                  </th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAndSorted.map(item => (
                  <tr key={item.id} className={`hover:bg-white/5 transition-all group ${selectedIds.has(item.id) ? 'bg-primary-blue/5' : ''}`}>
                    <td className="px-10 py-6 text-center"><input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelectItem(item.id)} className="size-4 bg-black border-white/10 rounded focus:ring-primary-blue text-primary-blue cursor-pointer" /></td>
                    <td className="px-6 py-6 flex items-center gap-4">
                      <img src={item.thumbnailUrl || item.imageUrl} className="size-16 rounded-2xl object-cover border border-white/10" alt="" />
                      <div>
                        <p className="text-sm font-black uppercase italic truncate max-w-[200px] mb-1">{item.title}</p>
                        <p className="text-[9px] font-bold text-gray-700 uppercase">{item.author}</p>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-wrap gap-2">
                        {item.categories.slice(0, 1).map(c => (
                          <span key={c} className="text-[8px] font-black px-2 py-0.5 bg-white/5 text-gray-400 rounded uppercase">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-10 py-6"><span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.type}</span></td>
                    <td className="px-10 py-6"><span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{new Date(item.date).toLocaleDateString()}</span></td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${item.status === 'Published' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : item.status === 'Draft' ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-gray-500'}`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'Published' ? 'text-green-500' : item.status === 'Draft' ? 'text-yellow-500' : 'text-gray-500'}`}>{item.status}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(item)} className="p-3 bg-white/5 rounded-xl hover:text-primary-blue transition-all"><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button onClick={() => { if (confirm('Permanently delete this item?')) deleteItem(item.id); }} className="p-3 bg-white/5 rounded-xl hover:text-primary-red transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-3xl overflow-y-auto">
          <div className="relative w-full max-w-7xl bg-surface-dark border border-white/10 rounded-[4rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-fadeIn">
            <header className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-6">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">{editingId ? 'Recalibrate Signal' : 'Inject New Signal'}</h2>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="bg-black/60 border border-white/10 rounded-2xl px-6 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary-blue text-white">
                  <option value="Published">Status: Published</option><option value="Draft">Status: Draft</option><option value="Archived">Status: Archived</option>
                </select>
              </div>
              <button onClick={() => setShowModal(false)} className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"><span className="material-symbols-outlined">close</span></button>
            </header>

            <div className="p-10 overflow-y-auto space-y-12 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                <div className="md:col-span-8 space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                    <input type="text" placeholder="Agent Identity (Author)" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-primary-blue" />
                    <input type="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={e => setFormData({ ...formData, date: new Date(e.target.value).toISOString() })} className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-primary-blue" title="Publication Date" />
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as ContentType })} className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-sm font-black uppercase text-white outline-none focus:border-primary-blue"><option value="Article">Article</option><option value="Blog">Blog</option><option value="Trailer">Trailer</option><option value="Review">Review</option></select>
                  </div>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-lg font-black uppercase italic text-white outline-none focus:border-primary-blue" placeholder="Broadcast Headline..." />

                  <div className="flex justify-between items-center px-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Intelligence Body</label>
                    <button onClick={handleAIGenerate} disabled={isGenerating || !formData.title} className="text-[10px] font-black uppercase text-primary-blue flex items-center gap-2 hover:glow-blue transition-all disabled:opacity-30">
                      <span className={`material-symbols-outlined text-sm ${isGenerating ? 'animate-spin' : ''}`}>auto_awesome</span> Neural Sync
                    </button>
                  </div>
                  <textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} rows={12} className="w-full bg-black/60 border border-white/10 rounded-[3rem] p-10 text-base text-white outline-none focus:border-primary-blue resize-none leading-relaxed" placeholder="Detailed mission briefing..."></textarea>
                </div>

                <div className="md:col-span-4 space-y-8">
                  <div className="p-8 bg-black/40 rounded-[3rem] border border-white/5 space-y-8">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] block text-center">Matrix Placement</label>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { f: 'isHero', l: 'Hero Slider', c: 'text-primary-red', d: 'Main cinematic display' },
                        { f: 'isScroller', l: 'Breaking Ticker', c: 'text-primary-red', d: 'Animated text scroller' },
                        { f: 'isMarvelTrending', l: 'Marvel Sidebar', c: 'text-primary-red', d: 'Right column curated Marvel' },
                        { f: 'isDCTrending', l: 'DC Sidebar', c: 'text-primary-blue', d: 'Right column curated DC' },
                        { f: 'isMainFeed', l: 'Archive Priority', c: 'text-white', d: 'Include in historical feed' }
                      ].map(flag => (
                        <label key={flag.f} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer group hover:bg-white/10 transition-all">
                          <input type="checkbox" checked={(formData as any)[flag.f]} onChange={e => setFormData({ ...formData, [flag.f]: e.target.checked })} className="size-6 rounded-lg bg-black border-white/10 text-primary-blue focus:ring-0" />
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${flag.c}`}>{flag.l}</p>
                            <p className="text-[8px] text-gray-600 uppercase font-bold mt-1">{flag.d}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 ml-4">
                  <span className="material-symbols-outlined text-primary-blue text-sm">cloud_upload</span>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Visual Matrix Uplink</label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* THUMBNAIL ZONE */}
                  <div className="p-8 bg-black/40 rounded-[3rem] border border-white/5 space-y-4 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Custom Thumbnail</label>
                      <button onClick={() => thumbInputRef.current?.click()} className="size-8 rounded-lg bg-white/5 border border-white/10 hover:bg-primary-blue hover:text-black transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">upload</span>
                      </button>
                    </div>
                    <input type="text" placeholder="Thumbnail URL" value={formData.thumbnailUrl} onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-primary-blue" />
                    <input type="file" ref={thumbInputRef} onChange={e => handleFileUpload(e, 'thumbnailUrl')} accept="image/*" className="hidden" />

                    <div className="flex-1 aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/60 relative group/asset">
                      {formData.thumbnailUrl ? (
                        <>
                          <img src={formData.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                          <button onClick={() => clearAsset('thumbnailUrl')} className="absolute top-2 right-2 size-8 rounded-full bg-black/60 text-white opacity-0 group-hover/asset:opacity-100 transition-all flex items-center justify-center backdrop-blur-md">
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 opacity-20 italic">
                          <span className="material-symbols-outlined text-4xl mb-2">image_search</span>
                          <span className="text-[8px] font-black uppercase">No Thumbnail</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MAIN IMAGE ZONE */}
                  <div className="p-8 bg-black/40 rounded-[3rem] border border-white/5 space-y-4 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Hero Asset (Main)</label>
                      <button onClick={() => fileInputRef.current?.click()} className="size-8 rounded-lg bg-white/5 border border-white/10 hover:bg-primary-blue hover:text-black transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">upload</span>
                      </button>
                    </div>
                    <input type="text" placeholder="Main Image URL" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-primary-blue" />
                    <input type="file" ref={fileInputRef} onChange={e => handleFileUpload(e, 'imageUrl')} accept="image/*" className="hidden" />

                    <div className="flex-1 aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/60 relative group/asset">
                      {formData.imageUrl ? (
                        <>
                          <img src={formData.imageUrl} className="w-full h-full object-cover" alt="" />
                          <button onClick={() => clearAsset('imageUrl')} className="absolute top-2 right-2 size-8 rounded-full bg-black/60 text-white opacity-0 group-hover/asset:opacity-100 transition-all flex items-center justify-center backdrop-blur-md">
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 opacity-20 italic">
                          <span className="material-symbols-outlined text-4xl mb-2">add_photo_alternate</span>
                          <span className="text-[8px] font-black uppercase">No Main Asset</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VIDEO ZONE: LIVE PREVIEW SYSTEM */}
                  <div className="p-8 bg-black/40 rounded-[3rem] border border-white/5 space-y-4 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Multimedia Intel (Video)</label>
                      <button onClick={() => videoInputRef.current?.click()} className="size-8 rounded-lg bg-white/5 border border-white/10 hover:bg-primary-blue hover:text-black transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">upload</span>
                      </button>
                    </div>
                    <input type="text" placeholder="Video Stream URL (YouTube or Direct)" value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-primary-blue" />
                    <input type="file" ref={videoInputRef} onChange={e => handleFileUpload(e, 'videoUrl')} accept="video/*" className="hidden" />

                    <div className="flex-1 aspect-video min-h-[180px] rounded-2xl overflow-hidden border border-white/10 bg-black relative group/asset">
                      {formData.videoUrl ? (
                        <>
                          {ytId ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}?rel=0&autoplay=0&modestbranding=1`}
                              className="w-full h-full absolute inset-0"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                              allowFullScreen
                              title="Video Preview"
                              loading="lazy"
                              onLoad={(e) => {
                                const iframe = e.target as HTMLIFrameElement;
                                iframe.style.opacity = '1';
                              }}
                              style={{ opacity: 0.8 }}
                            />
                          ) : (
                            <video
                              src={formData.videoUrl}
                              className="w-full h-full object-contain absolute inset-0"
                              controls
                              playsInline
                              muted={false}
                              onError={(e) => {
                                const target = e.target as HTMLVideoElement;
                                target.style.display = 'none';
                              }}
                            />
                          )}
                          <button onClick={() => clearAsset('videoUrl')} className="absolute top-2 right-2 z-10 size-8 rounded-full bg-black/60 text-white opacity-0 group-hover/asset:opacity-100 transition-all flex items-center justify-center backdrop-blur-md">
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 opacity-20 italic">
                          <span className="material-symbols-outlined text-4xl mb-2">videocam</span>
                          <span className="text-[8px] font-black uppercase">No Video Intel</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="p-10 border-t border-white/5 flex gap-6 bg-black/40">
              <button onClick={() => setShowModal(false)} className="flex-1 py-6 bg-white/5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.5em] text-white hover:bg-white/10 transition-all">Abort Ops</button>
              <button onClick={handleDeploy} className="flex-1 py-6 bg-primary-blue text-black rounded-[2rem] font-black text-[11px] uppercase tracking-[0.5em] shadow-[0_10px_40px_rgba(0,242,255,0.2)] hover:scale-[1.02] transition-all">Commit Signal</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
