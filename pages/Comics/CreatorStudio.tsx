import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../App';
import { storageService, Character, ComicEntry, ComicPage, ComicPanel } from '../../services/storage';
import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '../../services/firebase';
// import { jsPDF } from 'jspdf'; // Removed unused import to fix build

const STYLES = [
    { id: 'marvel', name: 'Marvel Style', prompt: 'in the style of modern Marvel comic book art, vibrant colors, dynamic action, detailed shading' },
    { id: 'dc', name: 'DC Style', prompt: 'in the style of DC comics, gritty, dark atmosphere, dramatic lighting, realistic proportions' },
    { id: 'manga', name: 'Manga', prompt: 'in the style of Japanese manga, black and white, expresssive lines, speed lines, high contrast' },
    { id: 'noir', name: 'Noir', prompt: 'in the style of noir comics, black and white, high contrast, shadowy, mysterious' },
    { id: 'watercolor', name: 'Watercolor', prompt: 'in the style of watercolor comic art, soft edges, dreamy atmosphere, artistic' },
    { id: 'cyberpunk', name: 'Cyberpunk', prompt: 'in the style of cyberpunk graphic novel, neon lights, futuristic technology, high tech low life' },
];

const LAYOUTS = [
    { id: '1x1', name: 'Full Page', panels: 1 },
    { id: '2x2', name: '2x2 Grid', panels: 4 },
    { id: '3x3', name: '3x3 Grid', panels: 9 },
];

// Helper to generate image URL
const generateImageUrl = (prompt: string, width = 512, height = 512) => {
    if (!prompt) return '';
    const cleanPrompt = prompt.replace(/,+/g, ',').replace(/\s+/g, ' ').trim();
    const fullPrompt = encodeURIComponent(cleanPrompt);
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${fullPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
    console.log("🎨 AI Imagine Request (Simplified):", url);
    return url;
};

const CreatorStudio: React.FC = () => {
    const { currentUser } = useContent();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Comic State
    const [title, setTitle] = useState('');
    const [storyPremise, setStoryPremise] = useState('');
    const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
    const [characters, setCharacters] = useState<Character[]>([]);

    // Step 2: Cover Art State
    const [coverPrompt, setCoverPrompt] = useState('');
    const [coverAction, setCoverAction] = useState('');
    const [coverEnvironment, setCoverEnvironment] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [isGeneratingCover, setIsGeneratingCover] = useState(false);
    const [coverError, setCoverError] = useState(false);
    const [panelErrors, setPanelErrors] = useState<Record<string, boolean>>({});

    const [pages, setPages] = useState<ComicPage[]>([
        { layout: '1x1', panels: [{ imageUrl: '', prompt: '' }] }
    ]);

    // Character Input State
    const [charName, setCharName] = useState('');
    const [charDesc, setCharDesc] = useState('');

    const addCharacter = () => {
        if (!charName || !charDesc) return;
        const designPrompt = `Character Sheet for ${charName}: ${charDesc}, ${selectedStyle.prompt}, full body reference, neutral background`;
        const newChar: Character = {
            id: Date.now().toString(),
            name: charName,
            description: charDesc,
            designPrompt,
            referenceImage: generateImageUrl(designPrompt, 512, 512)
        };
        setCharacters([...characters, newChar]);
        setCharName('');
        setCharDesc('');
    };

    const generateCover = () => {
        setIsGeneratingCover(true);
        setCoverError(false);
        let finalPrompt = `Comic Book Cover for "${title}": ${storyPremise}, ${coverAction}, ${selectedStyle.prompt}, detailed masterpiece, 8k resolution`;

        if (coverEnvironment) finalPrompt += `, setting: ${coverEnvironment}`;

        // Add character context if selected (optional implementation, for now generic)
        if (characters.length > 0) {
            finalPrompt += `, featuring ${characters.map(c => `${c.name} (${c.description})`).join(', ')}`;
        }

        const url = generateImageUrl(finalPrompt, 512, 768);
        console.log("🎬 Cover Prompt Generated:", finalPrompt);
        setCoverImage(url);
    };

    const addPage = () => {
        setPages([...pages, { layout: '2x2', panels: Array(4).fill({ imageUrl: '', prompt: '' }) }]);
    };

    const updatePanel = (pageIndex: number, panelIndex: number, field: keyof ComicPanel, value: string) => {
        const newPages = [...pages];
        newPages[pageIndex].panels[panelIndex] = { ...newPages[pageIndex].panels[panelIndex], [field]: value };
        setPages(newPages);
    };

    const generatePanelImage = async (pageIndex: number, panelIndex: number) => {
        const key = `${pageIndex}-${panelIndex}`;
        setPanelErrors(prev => ({ ...prev, [key]: false }));

        const panel = pages[pageIndex].panels[panelIndex];
        if (!panel.prompt) return;

        let finalPrompt = panel.prompt;

        // Inject Character Consistency
        if (panel.characterId) {
            const char = characters.find(c => c.id === panel.characterId);
            if (char) {
                finalPrompt = `${char.name} (${char.description}), ${selectedStyle.prompt}, ${panel.prompt}`;
            }
        }

        // Inject Environment Context
        if (pages[pageIndex].environment) {
            finalPrompt += `, setting: ${pages[pageIndex].environment}`;
        }

        const imageUrl = generateImageUrl(finalPrompt);
        updatePanel(pageIndex, panelIndex, 'imageUrl', imageUrl);
    };

    const updatePageEnvironment = (pageIndex: number, env: string) => {
        const newPages = [...pages];
        newPages[pageIndex].environment = env;
        setPages(newPages);
    };

    const publishComic = async () => {
        if (!currentUser || !title) return;
        setLoading(true);

        try {
            // 0. Upload Cover Image
            let finalCoverUrl = coverImage;
            if (coverImage) {
                try {
                    const response = await fetch(coverImage);
                    const blob = await response.blob();
                    const storageRef = ref(storage, `comics/${currentUser.id}/cover_${Date.now()}.jpg`);
                    await uploadBytes(storageRef, blob);
                    finalCoverUrl = await getDownloadURL(storageRef);
                } catch (e) {
                    console.error("Failed to upload cover:", e);
                }
            }


            // 1. Upload all panel images to Firebase Storage
            const processedPages = await Promise.all(pages.map(async (page) => {
                const processedPanels = await Promise.all(page.panels.map(async (panel) => {
                    if (!panel.imageUrl) return panel;
                    try {
                        const response = await fetch(panel.imageUrl);
                        const blob = await response.blob();
                        const storageRef = ref(storage, `comics/${currentUser.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
                        await uploadBytes(storageRef, blob);
                        const permanentUrl = await getDownloadURL(storageRef);
                        return { ...panel, imageUrl: permanentUrl };
                    } catch (e) {
                        console.error("Failed to make permanent:", e);
                        return panel; // Fallback to original URL
                    }
                }));
                return { ...page, panels: processedPanels };
            }));


            // 2. Save to Firestore
            const newComic: ComicEntry = {
                id: Date.now().toString(),
                title,
                authorId: currentUser.id,
                authorName: currentUser.name,
                createdAt: new Date().toISOString(),
                status: currentUser.role === 'Admin' ? 'approved' : 'pending',
                isShowcased: false,
                badge: null,
                pages: processedPages,
                characters,
                style: selectedStyle.id,
                storyPremise,
                coverImage: finalCoverUrl || 'https://via.placeholder.com/300',
                type: 'generated'
            };

            await storageService.addComic(newComic);
            alert('Comic Published! Awaiting Admin Approval.');
            navigate('/comics-gen');

        } catch (error) {
            console.error(error);
            alert('Failed to publish comic.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-24 font-display">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-4xl font-black italic uppercase text-primary-red">Comic Creator Studio</h1>

                {/* STEPPER */}
                <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${step === s ? 'bg-primary-red text-white' : 'bg-white/5 text-gray-500'}`}>
                            {s === 1 ? 'Step 1: Setup' : s === 2 ? 'Step 2: Cover Art' : s === 3 ? 'Step 3: Layout' : 'Step 4: Generate'}
                        </div>
                    ))}
                </div>

                {/* STEP 1: SETUP */}
                {step === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <input type="text" placeholder="COMIC TITLE" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-transparent border-b border-white/20 text-3xl font-black uppercase focus:border-primary-red outline-none py-2" />
                        <textarea placeholder="Story Premise (Optional)" value={storyPremise} onChange={e => setStoryPremise(e.target.value)} className="w-full bg-white/5 p-4 rounded-xl border border-white/10" rows={3} />

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {STYLES.map(style => (
                                <button key={style.id} onClick={() => setSelectedStyle(style)} className={`p-4 rounded-xl border text-left transition-all ${selectedStyle.id === style.id ? 'border-primary-red bg-primary-red/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                                    <div className="font-bold uppercase">{style.name}</div>
                                    <div className="text-[10px] text-gray-400 mt-1">{style.prompt}</div>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4 pt-8 border-t border-white/10">
                            <h3 className="font-bold uppercase text-xl">Characters</h3>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Name" value={charName} onChange={e => setCharName(e.target.value)} className="bg-white/5 p-2 rounded border border-white/10" />
                                <input type="text" placeholder="Description (e.g., tall, cape)" value={charDesc} onChange={e => setCharDesc(e.target.value)} className="bg-white/5 p-2 rounded border border-white/10 flex-1" />
                                <button onClick={addCharacter} className="bg-white text-black font-bold px-4 rounded uppercase text-xs">Add</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {characters.map(char => (
                                    <div key={char.id} className="relative group">
                                        <img src={char.referenceImage} alt={char.name} className="w-full h-32 object-cover rounded-lg" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="font-bold">{char.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => setStep(2)} className="bg-primary-red px-8 py-3 rounded-xl font-black uppercase text-sm float-right hover:scale-105 transition-transform">Next: Cover Art</button>
                    </div>
                )}

                {/* STEP 2: COVER ART GENERATOR */}
                {step === 2 && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold uppercase">Design Cover</h3>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">Action / Pose</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Hero standing on a gargoyle looking at city"
                                        value={coverAction}
                                        onChange={e => setCoverAction(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-primary-red outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">Environment / Backdrop</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rainy cyberpunk city night"
                                        value={coverEnvironment}
                                        onChange={e => setCoverEnvironment(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-primary-red outline-none"
                                    />
                                </div>

                                <button
                                    onClick={generateCover}
                                    disabled={!coverAction && !storyPremise}
                                    className="w-full bg-primary-blue/20 text-primary-blue border border-primary-blue/50 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-primary-blue hover:text-black transition-all"
                                >
                                    {isGeneratingCover ? 'Generating Masterpiece...' : 'Generate Cover Art'}
                                </button>

                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-xs text-gray-400">
                                    <span className="text-white font-bold block mb-2">PRO TIP:</span>
                                    Your cover image will be the first thing users see in the gallery. Make it count! Use descriptive action words and distinct lighting settings.
                                </div>
                            </div>

                            <div className="relative aspect-[2/3] bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center">
                                {coverImage && !coverError ? (
                                    <img
                                        src={coverImage}
                                        alt="Cover"
                                        className="w-full h-full object-cover shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                                        onLoad={() => {
                                            console.log("✅ Cover Loaded Success");
                                            setIsGeneratingCover(false);
                                        }}
                                        onError={(e) => {
                                            console.error("❌ Cover Load Failed:", e.currentTarget.src);
                                            setCoverError(true);
                                            setIsGeneratingCover(false);
                                        }}
                                    />
                                ) : coverImage && coverError ? (
                                    <div className="text-center p-8 bg-black/50 w-full h-full flex flex-col items-center justify-center gap-4">
                                        <span className="material-symbols-outlined text-4xl text-primary-red">error</span>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Image generation failed</p>
                                        <button
                                            onClick={generateCover}
                                            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 opacity-50">
                                        <span className="material-symbols-outlined text-6xl mb-4">auto_stories</span>
                                        <p className="font-bold uppercase tracking-widest">Cover Preview</p>
                                    </div>
                                )}
                                {isGeneratingCover && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="size-10 border-2 border-primary-red border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-primary-red">Rendering...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between pt-8 border-t border-white/10">
                            <button onClick={() => setStep(1)} className="text-gray-500 font-bold uppercase text-xs">Back</button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!coverImage}
                                className={`px-8 py-3 rounded-xl font-black uppercase text-sm transition-transform ${coverImage ? 'bg-primary-red hover:scale-105' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                            >
                                Next: Layout
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: LAYOUT */}
                {step === 3 && (
                    <div className="space-y-8 animate-fadeIn">
                        {pages.map((page, pIndex) => (
                            <div key={pIndex} className="space-y-4 border border-white/10 p-6 rounded-2xl bg-white/5">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold uppercase">Page {pIndex + 1}</h3>
                                    <select
                                        value={page.layout}
                                        onChange={(e) => {
                                            const newLayout = e.target.value as any;
                                            const panelCount = LAYOUTS.find(l => l.id === newLayout)?.panels || 1;
                                            const newPages = [...pages];
                                            newPages[pIndex] = {
                                                layout: newLayout,
                                                environment: newPages[pIndex].environment,
                                                panels: Array(panelCount).fill({ imageUrl: '', prompt: '' })
                                            };
                                            setPages(newPages);
                                        }}
                                        className="bg-black border border-white/20 rounded px-4 py-2 text-sm font-bold uppercase"
                                    >
                                        {LAYOUTS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Page Environment (e.g. Gotham Rooftop Night)"
                                    value={page.environment || ''}
                                    onChange={e => updatePageEnvironment(pIndex, e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:text-white mb-4"
                                />

                                <div className={`grid gap-2 aspect-[2/3] bg-white max-w-sm mx-auto p-2 ${page.layout === '1x1' ? 'grid-cols-1' :
                                    page.layout === '2x2' ? 'grid-cols-2' :
                                        'grid-cols-3'
                                    }`}>
                                    {page.panels.map((_, i) => (
                                        <div key={i} className="bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-400 text-xs uppercase">
                                            Panel {i + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button onClick={addPage} className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-gray-500 font-bold uppercase hover:border-white/50 hover:text-white transition-all">+ Add Page</button>

                        <div className="flex justify-between pt-8">
                            <button onClick={() => setStep(2)} className="text-gray-500 font-bold uppercase text-xs">Back</button>
                            <button onClick={() => setStep(4)} className="bg-primary-red px-8 py-3 rounded-xl font-black uppercase text-sm hover:scale-105 transition-transform">Next: Generate Panels</button>
                        </div>
                    </div>
                )}

                {/* STEP 4: GENERATION */}
                {step === 4 && (
                    <div className="space-y-8 animate-fadeIn">
                        {pages.map((page, pIndex) => (
                            <div key={pIndex} className="space-y-4">
                                <h3 className="font-bold uppercase text-xl">Page {pIndex + 1} <span className="text-sm font-normal text-gray-400">({page.environment || 'No Env'})</span></h3>
                                <div className={`grid gap-4 ${page.layout === '1x1' ? 'grid-cols-1' :
                                    page.layout === '2x2' ? 'grid-cols-2' :
                                        'grid-cols-3'
                                    }`}>
                                    {page.panels.map((panel, i) => (
                                        <div key={i} className="space-y-2 bg-white/5 p-4 rounded-xl">
                                            <div className="aspect-square bg-black relative rounded-lg overflow-hidden group">
                                                {panel.imageUrl && !panelErrors[`${pIndex}-${i}`] ? (
                                                    <div className="relative w-full h-full">
                                                        <img
                                                            src={panel.imageUrl}
                                                            className="w-full h-full object-cover"
                                                            onError={() => {
                                                                setPanelErrors(prev => ({ ...prev, [`${pIndex}-${i}`]: true }));
                                                            }}
                                                        />
                                                        {panel.dialogue && (
                                                            <div className="absolute bottom-4 left-4 right-4 bg-white text-black p-2 rounded-xl text-xs font-comic text-center border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                                                {panel.dialogue}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : panel.imageUrl && panelErrors[`${pIndex}-${i}`] ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                                                        <span className="material-symbols-outlined text-red-500">error</span>
                                                        <p className="text-[10px] uppercase font-bold text-gray-500">Failed</p>
                                                        <button
                                                            onClick={() => generatePanelImage(pIndex, i)}
                                                            className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
                                                        >
                                                            Retry
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-4">
                                                        Wait for generation...
                                                    </div>
                                                )}
                                                <button onClick={() => generatePanelImage(pIndex, i)} className="absolute top-2 right-2 bg-primary-red p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                    <span className="material-symbols-outlined text-white text-sm">refresh</span>
                                                </button>
                                            </div>

                                            <textarea
                                                placeholder={`Panel ${i + 1} Prompt`}
                                                value={panel.prompt}
                                                onChange={e => updatePanel(pIndex, i, 'prompt', e.target.value)}
                                                className="w-full bg-black border border-white/10 rounded p-2 text-xs h-20"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Dialogue / Speech Bubble"
                                                value={panel.dialogue || ''}
                                                onChange={e => updatePanel(pIndex, i, 'dialogue', e.target.value)}
                                                className="w-full bg-black border border-white/10 rounded p-2 text-xs"
                                            />

                                            <select
                                                value={panel.characterId || ''}
                                                onChange={e => updatePanel(pIndex, i, 'characterId', e.target.value)}
                                                className="w-full bg-black border border-white/10 rounded p-2 text-xs"
                                            >
                                                <option value="">No Character Ref</option>
                                                {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>

                                            <button onClick={() => generatePanelImage(pIndex, i)} className="w-full bg-white/10 py-2 rounded text-xs font-bold uppercase hover:bg-white/20">Generate</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between pt-8">
                            <button onClick={() => setStep(3)} className="text-gray-500 font-bold uppercase text-xs">Back</button>
                            <button onClick={publishComic} className="bg-primary-red px-8 py-3 rounded-xl font-black uppercase text-sm hover:scale-105 transition-transform">
                                {loading ? 'Publishing...' : 'Publish Comic'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CreatorStudio;
