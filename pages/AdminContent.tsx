
import * as React from 'react';
import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../App';
import { VaultItem, ContentType } from '../types';

const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

type SortKey = 'title' | 'date' | 'views' | 'type' | 'categories';
type SortOrder = 'asc' | 'desc';

import AdminLayout from '../components/AdminLayout';

const AdminContent: React.FC = () => {
  const { vaultItems, addItem, updateItem, deleteItem, categories } = useContent();
  const [showModal, setShowModal] = useState(false);
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeploy = async () => {
    if (!formData.title) return alert("MISSING INTEL: Please provide a headline (Title).");
    if (!formData.content) return alert("MISSING INTEL: Please provide a mission briefing (Content).");

    setIsSubmitting(true);

    // Calculate read time based on content length (roughly 200 words per minute)
    const wordCount = (formData.content || '').split(/\s+/).length;
    const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const finalData = {
      ...(formData as VaultItem),
      id: editingId || Date.now().toString(),
      date: formData.date || new Date().toISOString(),
      readTime: formData.readTime || `${readMinutes} min read`,
      views: formData.views || 0,
      likes: formData.likes || 0,
      comments: formData.comments || [],
      userRatings: formData.userRatings || [],
      categories: formData.categories || []
    };
    try {
      if (editingId) await updateItem(finalData);
      else await addItem(finalData);
      setShowModal(false);
      alert("Signal transmitted successfully.");
    } catch (error: any) {
      console.error("Deploy failed:", error);
      alert(`Failed to commit signal: ${error?.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => setFormData({
    title: '', type: 'Article', categories: [], status: 'Published',
    author: 'Command HQ', imageUrl: '', videoUrl: '', thumbnailUrl: '', content: '',
    isHero: false, isScroller: false, isTrending: false, isVideoSection: false, isMainFeed: true,
    isMarvelTrending: false, isDCTrending: false
  });


  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return <span className="material-symbols-outlined text-[10px] opacity-20">sort</span>;
    return <span className={`material-symbols-outlined text-[10px] text-primary-blue`}>{sortConfig.order === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>;
  };

  const ytId = getYouTubeId(formData.videoUrl || '');

  return (
    <AdminLayout title="THE VAULT" subtitle="Intelligence Storage">
      <div className="flex-1 flex flex-col bg-[#0a0f1a] overflow-hidden h-full">
        <div className="px-6 md:px-12 py-6 md:py-10 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4 md:gap-6 items-start md:items-center">
          <div className="md:block hidden truncate">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">DATA <span className="text-primary-blue">REPOSITORY</span></h2>
          </div>
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">search</span>
              <input
                type="text"
                placeholder="Filter signals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold focus:border-primary-blue outline-none transition-all"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 md:px-8 py-3 bg-primary-blue text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all shrink-0"
            >
              Inject Intel
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 no-scrollbar">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white/5 border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl">
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 pb-20">
            {filteredAndSorted.map(item => (
              <div key={item.id} className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                <div className="flex gap-4">
                  <img src={item.thumbnailUrl || item.imageUrl} className="size-20 rounded-2xl object-cover shrink-0 border border-white/5" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`size-1.5 rounded-full ${item.status === 'Published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${item.status === 'Published' ? 'text-green-500' : 'text-yellow-500'}`}>{item.status}</span>
                    </div>
                    <h4 className="text-[13px] font-black uppercase italic tracking-tight leading-tight mb-1 truncate">{item.title}</h4>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate">{item.type} • {new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button onClick={() => handleOpenModal(item)} className="flex-1 py-3 bg-white/5 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-primary-blue/10 hover:text-primary-blue transition-all">
                    <span className="material-symbols-outlined text-sm">edit</span> Recalibrate
                  </button>
                  <button onClick={() => { if (confirm('Deconstruct signal?')) deleteItem(item.id); }} className="px-4 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 hover:text-primary-red transition-all">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
            {filteredAndSorted.length === 0 && (
              <div className="py-20 text-center opacity-20">
                <span className="material-symbols-outlined text-5xl mb-4">search_off</span>
                <p className="text-xs font-black uppercase tracking-widest">No Signals Detected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-3xl overflow-hidden">
          <div className="relative w-full max-w-7xl bg-[#0c0c0c] border border-white/10 rounded-[2rem] md:rounded-[4rem] shadow-2xl flex flex-col max-h-[98vh] overflow-hidden animate-fadeIn">
            <header className="px-6 md:px-10 py-6 md:py-8 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">{editingId ? 'Recalibrate Signal' : 'Inject New Signal'}</h2>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="bg-black/60 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-1.5 md:py-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary-blue text-white w-fit">
                  <option value="Published">Status: Published</option><option value="Draft">Status: Draft</option><option value="Archived">Status: Archived</option>
                </select>
              </div>
              <button onClick={() => setShowModal(false)} className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all shrink-0"><span className="material-symbols-outlined">close</span></button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-12 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                <div className="md:col-span-8 space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest px-2">Agent ID</label>
                      <input type="text" placeholder="AUTHOR" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl md:rounded-2xl p-4 text-[13px] font-bold text-white outline-none focus:border-primary-blue" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest px-2">Release Date</label>
                      <input type="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={e => setFormData({ ...formData, date: new Date(e.target.value).toISOString() })} className="w-full bg-black/60 border border-white/10 rounded-xl md:rounded-2xl p-4 text-[13px] font-bold text-white outline-none focus:border-primary-blue" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest px-2">Type</label>
                      <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as ContentType })} className="w-full bg-black/60 border border-white/10 rounded-xl md:rounded-2xl p-4 text-[13px] font-black uppercase text-white outline-none focus:border-primary-blue"><option value="Article">Article</option><option value="Blog">Blog</option><option value="Trailer">Trailer</option><option value="Review">Review</option></select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest px-2">Headline</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-base md:text-lg font-black uppercase italic text-white outline-none focus:border-primary-blue" placeholder="Broadcast Headline..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600 px-2 block">Intelligence Body</label>
                    <textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} rows={10} className="w-full bg-black/60 border border-white/10 rounded-2xl md:rounded-[3rem] p-6 md:p-10 text-[14px] md:text-base text-white outline-none focus:border-primary-blue resize-none leading-relaxed" placeholder="Detailed mission briefing..."></textarea>
                  </div>
                </div>

                <div className="md:col-span-4 space-y-6 md:space-y-8">
                  <div className="p-6 md:p-8 bg-black/40 rounded-2xl md:rounded-[3rem] border border-white/5 space-y-4 md:space-y-8">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em] block text-center">Matrix Placement</label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { f: 'isHero', l: 'Hero Slider', c: 'text-primary-red', d: 'Main cinematic display' },
                        { f: 'isScroller', l: 'Breaking Ticker', c: 'text-primary-red', d: 'Top scroller' },
                        { f: 'isMarvelTrending', l: 'Marvel Sidebar', c: 'text-primary-red', d: 'Sidebar Marvel' },
                        { f: 'isDCTrending', l: 'DC Sidebar', c: 'text-primary-blue', d: 'Sidebar DC' },
                        { f: 'isMainFeed', l: 'Archive Feed', c: 'text-white', d: 'Historical archive' }
                      ].map(flag => (
                        <label key={flag.f} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl cursor-pointer group hover:bg-white/10 transition-all">
                          <input type="checkbox" checked={(formData as any)[flag.f]} onChange={e => setFormData({ ...formData, [flag.f]: e.target.checked })} className="size-5 rounded-md bg-black border-white/10 text-primary-blue focus:ring-0" />
                          <div>
                            <p className={`text-[9px] font-black uppercase tracking-widest ${flag.c}`}>{flag.l}</p>
                            <p className="text-[7px] text-gray-600 uppercase font-bold">{flag.d}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                  <span className="material-symbols-outlined text-primary-blue text-sm">cloud_upload</span>
                  <label className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Visual Matrix Uplink</label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* THUMBNAIL ZONE */}
                  <div className="p-5 md:p-8 bg-black/40 rounded-2xl md:rounded-[3rem] border border-white/5 space-y-3 md:space-y-4 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Thumbnail (Small)</label>
                      <button onClick={() => thumbInputRef.current?.click()} className="size-8 rounded-lg bg-white/5 border border-white/10 hover:bg-primary-blue hover:text-black transition-all flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm">upload</span>
                      </button>
                    </div>
                    <input type="text" placeholder="URL" value={formData.thumbnailUrl} onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-[10px] font-bold text-white outline-none focus:border-primary-blue" />
                    <input type="file" ref={thumbInputRef} onChange={e => handleFileUpload(e, 'thumbnailUrl')} accept="image/*" className="hidden" />

                    <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/60 relative group/asset">
                      {formData.thumbnailUrl ? (
                        <>
                          <img src={formData.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                          <button onClick={() => clearAsset('thumbnailUrl')} className="absolute top-1.5 right-1.5 size-7 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md">
                            <span className="material-symbols-outlined text-[10px]">close</span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 opacity-20 italic">
                          <span className="material-symbols-outlined text-3xl mb-1">image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MAIN IMAGE ZONE */}
                  <div className="p-5 md:p-8 bg-black/40 rounded-2xl md:rounded-[3rem] border border-white/5 space-y-3 md:space-y-4 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Hero Asset (Large)</label>
                      <button onClick={() => fileInputRef.current?.click()} className="size-8 rounded-lg bg-white/5 border border-white/10 hover:bg-primary-blue hover:text-black transition-all flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm">upload</span>
                      </button>
                    </div>
                    <input type="text" placeholder="URL" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-[10px] font-bold text-white outline-none focus:border-primary-blue" />
                    <input type="file" ref={fileInputRef} onChange={e => handleFileUpload(e, 'imageUrl')} accept="image/*" className="hidden" />

                    <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/60 relative group/asset">
                      {formData.imageUrl ? (
                        <>
                          <img src={formData.imageUrl} className="w-full h-full object-cover" alt="" />
                          <button onClick={() => clearAsset('imageUrl')} className="absolute top-1.5 right-1.5 size-7 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md">
                            <span className="material-symbols-outlined text-[10px]">close</span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 opacity-20 italic">
                          <span className="material-symbols-outlined text-3xl mb-1">photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VIDEO ZONE */}
                  <div className="p-5 md:p-8 bg-black/40 rounded-2xl md:rounded-[3rem] border border-white/5 space-y-3 md:space-y-4 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Video stream</label>
                      <button onClick={() => videoInputRef.current?.click()} className="size-8 rounded-lg bg-white/5 border border-white/10 hover:bg-primary-blue hover:text-black transition-all flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm">upload</span>
                      </button>
                    </div>
                    <input type="text" placeholder="URL / YouTube" value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-[10px] font-bold text-white outline-none focus:border-primary-blue" />
                    <input type="file" ref={videoInputRef} onChange={e => handleFileUpload(e, 'videoUrl')} accept="video/*" className="hidden" />

                    <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-black relative group/asset">
                      {formData.videoUrl ? (
                        <div className="w-full h-full"> {/* Video Preview Container */}
                          {ytId ? (
                            <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full border-0" allowFullScreen title="Video Preview" />
                          ) : (
                            <video src={formData.videoUrl} className="w-full h-full object-contain" controls playsInline />
                          )}
                          <button onClick={() => clearAsset('videoUrl')} className="absolute top-1.5 right-1.5 z-10 size-7 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md">
                            <span className="material-symbols-outlined text-[10px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 opacity-20 italic">
                          <span className="material-symbols-outlined text-3xl mb-1">movie</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="p-6 md:p-10 border-t border-white/5 flex flex-col md:flex-row gap-4 bg-black shrink-0">
              <button onClick={() => setShowModal(false)} className="py-4 md:py-6 bg-white/5 rounded-xl md:rounded-[2rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white hover:bg-white/10 transition-all md:order-1 order-2">Abort Ops</button>
              <button
                onClick={handleDeploy}
                disabled={isSubmitting}
                className={`py-4 md:py-6 flex-1 rounded-xl md:rounded-[2rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.4em] shadow-lg transition-all md:order-2 order-1 ${isSubmitting ? 'bg-gray-600 opacity-50' : 'bg-primary-blue text-black hover:scale-[1.01]'}`}
              >
                {isSubmitting ? 'TRANSMITTING...' : 'Commit Signal'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminContent;
