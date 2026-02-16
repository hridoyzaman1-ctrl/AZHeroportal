import React, { useState, useEffect, useMemo, useRef } from 'react';
import { storageService, ComicEntry } from '../services/storage';
import AdminLayout from '../components/AdminLayout';

const AdminComics: React.FC = () => {
    const [comics, setComics] = useState<ComicEntry[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Edit Mode State
    const [editingComic, setEditingComic] = useState<ComicEntry | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        cover: '',
        pdf: '',
        style: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const fetchComics = async () => {
        const data = await storageService.getComics();
        setComics(data);
    };

    useEffect(() => {
        fetchComics();
    }, []);

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 5MB Limit for images
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File too large. Maximum size is 5MB.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Invalid file type. Please upload an image.');
            return;
        }

        setIsUploading(true);
        try {
            const path = `comics/covers/${Date.now()}_${file.name}`;
            const downloadUrl = await storageService.uploadFile(file, path);
            setFormData(prev => ({ ...prev, cover: downloadUrl }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload cover image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 100MB Limit (100 * 1024 * 1024 bytes)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File too large. Maximum size is 100MB.');
            return;
        }

        if (file.type !== 'application/pdf') {
            alert('Invalid file type. Please upload a PDF.');
            return;
        }

        setIsUploading(true);
        try {
            // Upload to comics/timestamp_filename
            const path = `comics/${Date.now()}_${file.name}`;
            const downloadUrl = await storageService.uploadFile(file, path);
            setFormData(prev => ({ ...prev, pdf: downloadUrl }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload PDF. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenModal = (comic?: ComicEntry) => {
        if (comic) {
            setEditingComic(comic);
            setFormData({
                title: comic.title,
                author: comic.authorName,
                cover: comic.coverImage,
                pdf: comic.pdfUrl || '',
                style: comic.style
            });
        } else {
            setEditingComic(null);
            setFormData({ title: '', author: '', cover: '', pdf: '', style: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newComic: ComicEntry = {
                id: editingComic ? editingComic.id : Date.now().toString(),
                title: formData.title,
                authorName: formData.author,
                authorId: editingComic ? editingComic.authorId : 'admin',
                coverImage: formData.cover,
                pdfUrl: formData.pdf,
                type: 'uploaded',
                style: formData.style || 'Comic Book',
                status: editingComic ? editingComic.status : 'approved',
                isShowcased: editingComic ? editingComic.isShowcased : false,
                badge: editingComic ? editingComic.badge : null,
                createdAt: editingComic ? editingComic.createdAt : new Date().toISOString(),
                pages: editingComic ? editingComic.pages : [],
                characters: editingComic ? editingComic.characters : [],
                storyPremise: editingComic ? editingComic.storyPremise : ''
            };

            await storageService.addComic(newComic); // setDoc overwrites, so this works for both add and edit
            setShowModal(false);
            fetchComics();
        } catch (error) {
            console.error(error);
            alert('Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
        await storageService.updateComicStatus(id, status);
        fetchComics();
    };

    const handleShowcaseToggle = async (comic: ComicEntry) => {
        await storageService.updateComicShowcase(comic.id, !comic.isShowcased);
        fetchComics();
    };

    const handleBadgeAssign = async (id: string, badge: '1st' | '2nd' | '3rd' | null) => {
        await storageService.updateComicBadge(id, badge);
        fetchComics();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this comic?')) {
            await storageService.deleteComic(id);
            fetchComics();
        }
    };

    const filteredComics = useMemo(() => {
        return comics.filter(c => {
            const matchesFilter = filter === 'all' ? true : c.status === filter;
            const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.authorName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [comics, filter, searchTerm]);

    return (
        <AdminLayout title="COMICS GALLERY" subtitle="NARRATIVE DATABASE">
            <div className="flex-1 flex flex-col bg-[#0a0f1a] overflow-hidden h-full uppercase">
                {/* TOOLBAR */}
                <div className="px-4 md:px-12 py-4 md:py-10 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4 md:gap-6 items-start md:items-center">
                    <div className="flex gap-2 bg-black/50 p-1 rounded-xl border border-white/10">
                        {['all', 'pending', 'approved'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-4 py-2 rounded-lg uppercase font-bold text-[10px] tracking-widest transition-all ${filter === f ? 'bg-primary-red text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="flex w-full md:w-auto gap-3 md:gap-4">
                        <div className="relative flex-1 md:w-64">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-[12px] md:text-sm">search</span>
                            <input
                                type="text"
                                placeholder="Search comics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[10px] md:text-xs font-bold focus:border-primary-blue outline-none transition-all placeholder:text-gray-700 text-white"
                            />
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-4 md:px-8 py-3 bg-primary-blue text-black rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all shrink-0"
                        >
                            Inject Comic
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-6 md:space-y-8 no-scrollbar bg-[#050505]">

                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Comic Asset</th>
                                    <th className="px-8 py-6">Author</th>
                                    <th className="px-8 py-6">Status</th>
                                    <th className="px-8 py-6">Showcase</th>
                                    <th className="px-8 py-6">Ranking Badge</th>
                                    <th className="px-8 py-6 text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredComics.map(comic => (
                                    <tr key={comic.id} className="hover:bg-white/5 transition-all group">
                                        <td className="px-8 py-6 cursor-pointer" onClick={() => handleOpenModal(comic)}>
                                            <div className="flex items-center gap-4">
                                                <img src={comic.coverImage} className="w-12 h-16 object-cover rounded-lg border border-white/10" alt={comic.title} />
                                                <div>
                                                    <div className="font-black text-white uppercase italic text-sm mb-1">{comic.title}</div>
                                                    <div className="text-[9px] font-bold text-gray-500 tracking-widest">{comic.style}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{comic.authorName}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${comic.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                comic.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                {comic.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleShowcaseToggle(comic); }}
                                                className={`w-12 h-6 rounded-full transition-colors relative border ${comic.isShowcased ? 'bg-primary-red/20 border-primary-red/50' : 'bg-black/40 border-white/10'}`}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${comic.isShowcased ? 'translate-x-7 bg-primary-red' : 'translate-x-1 bg-gray-500'}`}></div>
                                            </button>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                {['1st', '2nd', '3rd'].map(b => (
                                                    <button
                                                        key={b}
                                                        onClick={() => handleBadgeAssign(comic.id, comic.badge === b ? null : b as any)}
                                                        className={`size-8 rounded-lg text-[10px] font-black border transition-all ${comic.badge === b ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-black/40 border-white/10 text-gray-600 hover:text-white hover:border-white/30'
                                                            }`}
                                                    >
                                                        {b === '1st' ? '1' : b === '2nd' ? '2' : '3'}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {comic.status === 'pending' && (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(comic.id, 'approved'); }} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-black transition-all"><span className="material-symbols-outlined text-sm">check</span></button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(comic.id, 'rejected'); }} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-black transition-all"><span className="material-symbols-outlined text-sm">close</span></button>
                                                    </>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenModal(comic); }} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-primary-blue hover:bg-primary-blue/10 transition-all"><span className="material-symbols-outlined text-sm">edit</span></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(comic.id); }} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-primary-red hover:bg-primary-red/10 transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                                                <a href={`/comics/${comic.id}`} target="_blank" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"><span className="material-symbols-outlined text-sm">visibility</span></a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE CARD VIEW */}
                    <div className="md:hidden space-y-4 pb-24">
                        {filteredComics.map(comic => (
                            <div key={comic.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-5">
                                <div className="flex gap-4">
                                    <img src={comic.coverImage} className="w-20 h-28 object-cover rounded-xl shadow-lg border border-white/5" alt={comic.title} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${comic.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                {comic.status}
                                            </span>
                                            {comic.isShowcased && <span className="text-[10px] text-primary-red material-symbols-outlined">star</span>}
                                        </div>
                                        <h3 className="text-lg font-black uppercase italic leading-none mb-1">{comic.title}</h3>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">By {comic.authorName}</p>

                                        <div className="flex gap-1">
                                            {['1st', '2nd', '3rd'].map(b => (
                                                <button
                                                    key={b}
                                                    onClick={() => handleBadgeAssign(comic.id, comic.badge === b ? null : b as any)}
                                                    className={`size-6 rounded text-[8px] font-black border transition-all ${comic.badge === b ? 'bg-white text-black border-white' : 'bg-black/40 border-white/10 text-gray-600'}`}
                                                >
                                                    {b === '1st' ? '1' : b === '2nd' ? '2' : '3'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-4">
                                    <button onClick={() => handleOpenModal(comic)} className="col-span-2 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10">
                                        <span className="material-symbols-outlined text-sm">edit</span> Edit
                                    </button>
                                    <a href={`/comics/${comic.id}`} className="py-3 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white">
                                        <span className="material-symbols-outlined text-sm">visibility</span>
                                    </a>
                                    <button onClick={() => handleDelete(comic.id)} className="py-3 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary-red">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredComics.length === 0 && (
                        <div className="py-20 text-center opacity-20">
                            <span className="material-symbols-outlined text-6xl mb-4">auto_stories</span>
                            <p className="text-xs font-black uppercase tracking-[0.5em]">No Comics In Database</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-8 bg-black/95 backdrop-blur-3xl overflow-hidden animate-fadeIn">
                    <div className="relative w-full max-w-4xl bg-[#0c0c0c] border border-white/10 rounded-2xl md:rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        <header className="px-6 md:px-10 py-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">{editingComic ? 'Recalibrate Comic' : 'Inject New Comic'}</h2>
                            <button onClick={() => setShowModal(false)} className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"><span className="material-symbols-outlined">close</span></button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar">
                            <form onSubmit={handleSubmit} id="comicForm" className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest px-2">Title</label>
                                        <input type="text" placeholder="COMIC TITLE" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-blue" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest px-2">Author</label>
                                        <input type="text" placeholder="AUTHOR NAME" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} required className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-blue" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest px-2">Style</label>
                                        <input type="text" placeholder="E.G. MANGA, NOIR" value={formData.style} onChange={e => setFormData({ ...formData, style: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-blue" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest px-2">PDF Document</label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="PDF URL" value={formData.pdf} onChange={e => setFormData({ ...formData, pdf: e.target.value })} className="flex-1 bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-blue" />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all"
                                            >
                                                <span className="material-symbols-outlined text-gray-400">upload_file</span>
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                accept="application/pdf"
                                                className="hidden"
                                            />
                                        </div>
                                        {isUploading && <p className="text-[10px] text-primary-blue font-bold tracking-widest animate-pulse px-2">UPLOADING SECURE DOCUMENT...</p>}
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest px-2">Cover Image Asset</label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="IMAGE URL" value={formData.cover} onChange={e => setFormData({ ...formData, cover: e.target.value })} required className="flex-1 bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-blue" />
                                            <button
                                                type="button"
                                                onClick={() => coverInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all"
                                            >
                                                <span className="material-symbols-outlined text-gray-400">add_photo_alternate</span>
                                            </button>
                                            <input
                                                type="file"
                                                ref={coverInputRef}
                                                onChange={handleCoverUpload}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {formData.cover && (
                                    <div className="w-32 h-44 rounded-xl overflow-hidden border border-white/10 mx-auto shadow-2xl">
                                        <img src={formData.cover} className="w-full h-full object-cover" alt="Preview" />
                                    </div>
                                )}
                            </form>
                        </div>

                        <footer className="p-6 md:p-10 border-t border-white/5 flex gap-4 bg-black shrink-0">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-white hover:bg-white/10">Abort</button>
                            <button
                                type="submit"
                                form="comicForm"
                                disabled={isSubmitting || isUploading}
                                className={`flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-black shadow-lg transition-all ${isSubmitting || isUploading ? 'bg-gray-600' : 'bg-primary-blue hover:scale-[1.01]'}`}
                            >
                                {isSubmitting ? 'Processing...' : 'Commit Data'}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminComics;
