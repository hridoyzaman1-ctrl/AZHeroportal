import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService, ComicEntry } from '../services/storage';

const Comics: React.FC = () => {
    const navigate = useNavigate();
    const [comics, setComics] = useState<ComicEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComics = async () => {
            try {
                const allComics = await storageService.getComics();
                const approvedComics = allComics.filter(c => c.status === 'approved');
                setComics(approvedComics);
            } catch (error) {
                console.error("Failed to fetch comics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchComics();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-display pt-24 px-8">
            {/* HERO SECTION */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 mb-16 animate-fadeIn">
                <div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-4">
                        The <span className="text-primary-red">Multiverse</span> Gallery
                    </h1>
                    <p className="text-xl text-gray-400 max-w-xl">
                        Explore thousands of unique stories created by our community or forge your own destiny in the Creator Studio.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/comics/create')}
                    className="group relative px-8 py-4 bg-primary-red text-white font-black uppercase tracking-widest text-lg overflow-hidden rounded-xl hover:scale-105 transition-transform"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                    <span className="relative flex items-center gap-2">
                        <span className="material-symbols-outlined">edit_square</span>
                        Create Comic
                    </span>
                </button>
            </div>

            {/* SHOWCASE SECTION */}
            {comics.filter(c => c.isShowcased).length > 0 && (
                <div className="max-w-7xl mx-auto mb-16">
                    <h2 className="text-2xl font-black uppercase mb-8 border-l-4 border-primary-red pl-4">Featured Selection</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {comics.filter(c => c.isShowcased).map(comic => (
                            <ComicCard key={comic.id} comic={comic} onClick={() => navigate(`/comics/${comic.id}`)} />
                        ))}
                    </div>
                </div>
            )}

            {/* ALL COMICS GRID */}
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-black uppercase mb-8 flex items-center justify-between">
                    <span>Fresh Off The Press</span>
                    <span className="text-sm font-normal text-gray-500">{comics.length} Stories Found</span>
                </h2>

                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {comics.map(comic => (
                            <ComicCard key={comic.id} comic={comic} onClick={() => navigate(`/comics/${comic.id}`)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ComicCard: React.FC<{ comic: ComicEntry; onClick: () => void }> = ({ comic, onClick }) => {
    return (
        <div onClick={onClick} className="group cursor-pointer">
            <div className="aspect-[2/3] relative rounded-xl overflow-hidden mb-3 border border-white/10 group-hover:border-primary-red transition-colors">
                <img src={comic.coverImage} alt={comic.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

                {/* BADGE */}
                {comic.badge && (
                    <div className={`absolute top-2 left-2 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-lg ${comic.badge === '1st' ? 'bg-yellow-400 text-black' :
                            comic.badge === '2nd' ? 'bg-gray-300 text-black' :
                                'bg-orange-700 text-white'
                        }`}>
                        #{comic.badge} Place
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>

                <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <p className="text-[10px] font-bold uppercase text-primary-red mb-1">{comic.style} Style</p>
                    <h3 className="font-black uppercase text-lg leading-tight">{comic.title}</h3>
                </div>
            </div>
            <div className="flex items-center justify-between px-1">
                <p className="text-xs text-gray-500 font-bold uppercase">By {comic.authorName}</p>
                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                    <span className="material-symbols-outlined text-[10px]">visibility</span>
                    <span>1.2k</span>
                </div>
            </div>
        </div>
    );
};

export default Comics;
