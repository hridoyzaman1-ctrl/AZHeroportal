import React, { useState, useEffect } from 'react';
import { storageService, ComicEntry } from '../services/storage';

const AdminComics: React.FC = () => {
    const [comics, setComics] = useState<ComicEntry[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

    const fetchComics = async () => {
        const data = await storageService.getComics();
        setComics(data);
    };

    useEffect(() => {
        fetchComics();
    }, []);

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

    const filteredComics = comics.filter(c => filter === 'all' ? true : c.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase text-white">Comics Management</h1>
                <div className="flex gap-2">
                    {['all', 'pending', 'approved'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded uppercase font-bold text-xs ${filter === f ? 'bg-primary-red text-white' : 'bg-white/10 text-gray-400'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/50 text-xs font-bold uppercase text-gray-400">
                        <tr>
                            <th className="p-4">Comic</th>
                            <th className="p-4">Author</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Showcase</th>
                            <th className="p-4">Badge</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredComics.map(comic => (
                            <tr key={comic.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-4">
                                        <img src={comic.coverImage} className="w-12 h-16 object-cover rounded" />
                                        <div>
                                            <div className="font-bold text-white max-w-[150px] truncate" title={comic.title}>{comic.title}</div>
                                            <div className="text-xs text-gray-500">{comic.style}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-300">{comic.authorName}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${comic.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                                        comic.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                            'bg-red-500/20 text-red-500'
                                        }`}>
                                        {comic.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleShowcaseToggle(comic)}
                                        className={`w-10 h-6 rounded-full transition-colors relative ${comic.isShowcased ? 'bg-primary-red' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${comic.isShowcased ? 'left-5' : 'left-1'}`}></div>
                                    </button>
                                </td>
                                <td className="p-4 flex gap-1">
                                    {['1st', '2nd', '3rd'].map(b => (
                                        <button
                                            key={b}
                                            onClick={() => handleBadgeAssign(comic.id, comic.badge === b ? null : b as any)}
                                            className={`w-6 h-6 rounded-full text-[10px] font-bold border ${comic.badge === b ? 'bg-white text-black border-white' : 'border-gray-600 text-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            {b === '1st' ? '1' : b === '2nd' ? '2' : '3'}
                                        </button>
                                    ))}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {comic.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleStatusChange(comic.id, 'approved')} className="text-green-500 hover:text-green-400 material-symbols-outlined">check_circle</button>
                                                <button onClick={() => handleStatusChange(comic.id, 'rejected')} className="text-red-500 hover:text-red-400 material-symbols-outlined">cancel</button>
                                            </>
                                        )}
                                        <a href={`/comics-gen/${comic.id}`} target="_blank" className="text-gray-400 hover:text-white material-symbols-outlined">visibility</a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminComics;
