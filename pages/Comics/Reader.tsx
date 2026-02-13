import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageService, ComicEntry } from '../../services/storage';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import PDFReader from '../../components/PDFReader';

const ComicReader: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [comic, setComic] = useState<ComicEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    useEffect(() => {
        const fetchComic = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'comics', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setComic({ id: docSnap.id, ...docSnap.data() } as ComicEntry);
                } else {
                    alert('Comic not found');
                    navigate('/comics');
                }
            } catch (error) {
                console.error("Error fetching comic:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchComic();
    }, [id, navigate]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Comic...</div>;
    if (!comic) return null;

    const totalPages = comic.pages?.length || 0;

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* HEADER */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={() => navigate('/comics')} className="text-white hover:text-primary-red transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="font-bold uppercase tracking-widest text-xs">Back to Gallery</span>
                </button>
                <div className="text-center">
                    <h1 className="font-black uppercase italic text-xl">{comic.title}</h1>
                    <p className="text-[10px] text-gray-400">By {comic.authorName}</p>
                </div>
                <div className="w-24"></div> {/* Spacer for center alignment */}
            </div>

            {/* CONTENT */}
            <div className="pt-20 pb-10 min-h-screen flex items-center justify-center">

                {/* PDF MODE */}
                {comic.type === 'uploaded' && comic.pdfUrl && (
                    <PDFReader url={comic.pdfUrl} />
                )}

                {/* GENERATED MODE (FLIPBOOK) */}
                {comic.type === 'generated' && comic.pages && (
                    <div className="max-w-4xl w-full mx-auto px-4">
                        <div className="relative aspect-[2/3] bg-white text-black shadow-2xl rounded-sm overflow-hidden border-r-8 border-gray-300">
                            {/* Simulated Spine */}
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-gray-900 to-transparent z-20 opacity-50"></div>

                            {/* Page Content */}
                            <div className="absolute inset-0 p-4 bg-white overflow-hidden">
                                <div className="h-full w-full flex flex-col">
                                    {/* Page Number */}
                                    <div className="text-right text-[10px] font-bold text-gray-400 mb-2">Page {currentPageIndex + 1}</div>

                                    {/* Dynamic Grid Layout */}
                                    <div className={`grid gap-2 flex-1 ${comic.pages[currentPageIndex].layout === '1x1' ? 'grid-cols-1' :
                                            comic.pages[currentPageIndex].layout === '2x2' ? 'grid-cols-2' :
                                                'grid-cols-3'
                                        }`}>
                                        {comic.pages[currentPageIndex].panels.map((panel, i) => (
                                            <div key={i} className="relative border-4 border-black overflow-hidden group">
                                                <img src={panel.imageUrl} className="w-full h-full object-cover" />
                                                {panel.dialogue && (
                                                    <div className="absolute bottom-4 left-4 right-4 bg-white text-black p-2 rounded-xl text-xs font-comic text-center border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                                        {panel.dialogue}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Overlay Areas */}
                            <div className="absolute inset-0 flex z-10">
                                <div
                                    className="w-1/2 h-full cursor-w-resize"
                                    onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))}
                                    title="Previous Page"
                                />
                                <div
                                    className="w-1/2 h-full cursor-e-resize"
                                    onClick={() => setCurrentPageIndex(p => Math.min(totalPages - 1, p + 1))}
                                    title="Next Page"
                                />
                            </div>
                        </div>

                        {/* Page Indicators */}
                        <div className="flex justify-center gap-2 mt-8">
                            {comic.pages.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all ${i === currentPageIndex ? 'bg-primary-red scale-125' : 'bg-white/20'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ComicReader;
