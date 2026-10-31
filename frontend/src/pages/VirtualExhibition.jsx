import { useState, useRef, useEffect } from 'react';
import { useAiChat } from '../context/AiChatContext';
import { artifactService } from '../services/artifact.service';
import useExhibitionAudio from '../hooks/useExhibitionAudio';
import { FALLBACK_ARTIFACTS } from '../data/exhibitionFallback';
import ExhibitionViewer from '../components/exhibition/ExhibitionViewer';
import ExhibitionAudioGuideBar from '../components/exhibition/ExhibitionAudioGuideBar';
import ExhibitionArtifactSelector from '../components/exhibition/ExhibitionArtifactSelector';
import ExhibitionDetailPanel from '../components/exhibition/ExhibitionDetailPanel';
import { Layers, Sparkles, Volume2, VolumeX } from 'lucide-react';

/**
 * VirtualExhibition - Trang Triển lãm & Khảo cứu Bảo vật Di sản
 * Đóng vai trò Page Controller / Orchestrator điều phối dữ liệu từ Backend MongoDB,
 * âm thanh không gian (Web Audio API), thuyết minh Audio Guide và tương tác Deep Zoom.
 */
const VirtualExhibition = () => {
    const { openAiChat } = useAiChat();
    const audio = useExhibitionAudio();

    // Dữ liệu bảo vật: Ưu tiên nạp từ MongoDB Backend qua REST API, dự phòng FALLBACK_ARTIFACTS
    const [artifacts, setArtifacts] = useState(FALLBACK_ARTIFACTS);
    const [selectedArtifact, setSelectedArtifact] = useState(FALLBACK_ARTIFACTS[0]);
    const [, setIsLoading] = useState(false);

    // Trạng thái góc chụp & tương tác ảnh (Deep Zoom & Pan)
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [zoomScale, setZoomScale] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeHotspot, setActiveHotspot] = useState(null);
    const [activeTab, setActiveTab] = useState('textbook');

    const containerRef = useRef(null);

    // Chuẩn hóa danh sách góc ảnh khảo cứu của hiện vật
    const currentGallery = selectedArtifact.gallery && selectedArtifact.gallery.length > 0 
        ? selectedArtifact.gallery 
        : (selectedArtifact.angles || []).map((ang, idx) => ({
            id: `angle-${idx}`,
            title: ang.label || `Ảnh ${idx + 1}`,
            badge: ang.label || `Góc ${idx + 1}`,
            image: ang.image,
            hotspots: ang.hotspots || []
        }));

    const activePhoto = currentGallery[currentPhotoIndex] || currentGallery[0] || {
        image: '',
        title: '',
        hotspots: []
    };

    const currentHotspots = activePhoto.hotspots || [];

    // Nạp danh sách bảo vật từ MongoDB Backend qua REST API
    useEffect(() => {
        let isMounted = true;
        const fetchArtifacts = async () => {
            try {
                setIsLoading(true);
                const data = await artifactService.getAllArtifacts();
                if (isMounted && Array.isArray(data) && data.length > 0) {
                    const normalized = data.map((item) => {
                        const localItem = FALLBACK_ARTIFACTS.find(
                            (fb) => (fb.slug === item.slug || fb.id === item.slug)
                        );
                        return {
                            ...item,
                            gallery: localItem?.gallery || (item.angles || []).map((ang, idx) => ({
                                id: `angle-${idx}`,
                                title: ang.label || `Ảnh ${idx + 1}`,
                                badge: ang.label || `Góc ${idx + 1}`,
                                image: ang.image,
                                hotspots: ang.hotspots || []
                            }))
                        };
                    });
                    setArtifacts(normalized);
                    setSelectedArtifact(normalized[0]);
                }
            } catch (err) {
                console.warn('Backend MongoDB chưa sẵn sàng, kích hoạt dữ liệu Cloudinary CDN dự phòng:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchArtifacts();
        return () => { isMounted = false; };
    }, []);

    // Xử lý đổi bảo vật
    const handleSelectArtifact = (artifact) => {
        if (audio.isSpeaking) audio.stopSpeech();
        setSelectedArtifact(artifact);
        setCurrentPhotoIndex(0);
        setZoomScale(1);
        setPanOffset({ x: 0, y: 0 });
        setActiveHotspot(null);
    };

    // Xử lý chuyển đổi góc ảnh khảo cứu
    const handleSelectPhoto = (idx) => {
        setCurrentPhotoIndex(idx);
        setZoomScale(1);
        setPanOffset({ x: 0, y: 0 });
        setActiveHotspot(null);
    };

    const handlePrevPhoto = () => {
        if (currentGallery.length <= 1) return;
        const prevIdx = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : currentGallery.length - 1;
        handleSelectPhoto(prevIdx);
    };

    const handleNextPhoto = () => {
        if (currentGallery.length <= 1) return;
        const nextIdx = currentPhotoIndex < currentGallery.length - 1 ? currentPhotoIndex + 1 : 0;
        handleSelectPhoto(nextIdx);
    };

    // Xử lý Zoom & Pan
    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        setZoomScale((prev) => {
            const next = Math.min(Math.max(1, +(prev + delta).toFixed(2)), 3.5);
            if (next === 1) setPanOffset({ x: 0, y: 0 });
            return next;
        });
    };

    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    };

    const handleMouseMove = (e) => {
        if (!isPanning) return;
        const maxPanX = (zoomScale - 1) * 350;
        const maxPanY = (zoomScale - 1) * 250;
        setPanOffset({
            x: Math.min(Math.max(-maxPanX, e.clientX - panStart.x), maxPanX),
            y: Math.min(Math.max(-maxPanY, e.clientY - panStart.y), maxPanY)
        });
    };

    const handleMouseUp = () => setIsPanning(false);

    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            setIsPanning(true);
            setPanStart({ x: e.touches[0].clientX - panOffset.x, y: e.touches[0].clientY - panOffset.y });
        }
    };

    const handleTouchMove = (e) => {
        if (!isPanning || e.touches.length !== 1) return;
        const maxPanX = (zoomScale - 1) * 350;
        const maxPanY = (zoomScale - 1) * 250;
        setPanOffset({
            x: Math.min(Math.max(-maxPanX, e.touches[0].clientX - panStart.x), maxPanX),
            y: Math.min(Math.max(-maxPanY, e.touches[0].clientY - panStart.y), maxPanY)
        });
    };

    const handleTouchEnd = () => setIsPanning(false);

    const zoomIn = () => setZoomScale((prev) => Math.min(+(prev + 0.35).toFixed(2), 3.5));
    const zoomOut = () => setZoomScale((prev) => {
        const next = Math.max(1, +(prev - 0.35).toFixed(2));
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
    });
    const resetZoom = () => {
        setZoomScale(1);
        setPanOffset({ x: 0, y: 0 });
        setActiveHotspot(null);
    };

    const handleHotspotClick = (spot) => {
        // Nếu nhấp lại đúng điểm đang soi -> Tự động toggle thu về toàn cảnh ban đầu (100%)
        if (activeHotspot?.id === spot.id) {
            resetZoom();
            return;
        }

        // Nếu nhấp điểm mới -> Phóng to và di chuyển camera đến tâm điểm khảo cứu
        setActiveHotspot(spot);
        setZoomScale(1.9);
        setPanOffset({
            x: (50 - spot.x) * 4.2,
            y: (50 - spot.y) * 3.5
        });
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    };

    return (
        <div 
            className="bg-[#0b0805] text-amber-50 min-h-screen flex flex-col font-vietnam selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden"
            onMouseUp={handleMouseUp}
        >
            {/* HIỆU ỨNG ÁNH SÁNG MÔ PHÒNG KHÔNG GIAN ĐẠI ĐIỆN BẢO TÀNG */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-amber-600/10 via-amber-800/5 to-transparent blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-red-950/15 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-amber-900/10 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-black/60" />
            </div>

            {/* THANH ĐIỀU HƯỚNG TIÊU ĐỀ TRIỂN LÃM SANG TRỌNG PHONG CÁCH BẢO TÀNG NOCTURNE */}
            <header className="border-b border-amber-600/25 bg-[#120d08]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative">
                <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-950 via-red-900 to-amber-600 flex items-center justify-center text-amber-200 shadow-[0_0_15px_rgba(217,119,6,0.3)] border border-amber-400/50">
                        <Layers className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2.5">
                            <h1 className="text-base sm:text-lg font-bold tracking-tight text-amber-100 font-heritage flex items-center gap-1.5">
                                Triển Lãm & Khảo Cứu Bảo Vật Di Sản
                            </h1>
                            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-xs">
                                🔍 Soi Cận Cảnh & Audio Guide
                            </span>
                        </div>
                        <p className="text-xs text-amber-200/60 hidden sm:block">
                            Không gian nghe nhìn di sản, gắn liền với chương trình Ngữ văn & Lịch sử
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2.5">
                    <button
                        type="button"
                        onClick={audio.toggleAmbient}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            audio.isAmbientPlaying
                                ? 'bg-amber-500/20 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                                : 'bg-[#18110b] hover:bg-[#221810] border-amber-900/40 text-stone-300'
                        }`}
                        title="Bật/tắt âm hưởng chuông đồng không gian"
                    >
                        {audio.isAmbientPlaying ? (
                            <>
                                <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                                <span>Âm Không Gian (Bật)</span>
                            </>
                        ) : (
                            <>
                                <VolumeX className="w-4 h-4 text-stone-500" />
                                <span className="hidden sm:inline">Âm Không Gian</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={openAiChat}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-950 via-red-900 to-amber-700 hover:from-red-900 hover:to-amber-600 text-amber-100 text-xs font-bold shadow-[0_0_20px_rgba(185,28,28,0.3)] cursor-pointer transition-all border border-amber-400/40 hover:scale-[1.02]"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                        <span>Hỏi Gia sư AI</span>
                    </button>
                </div>
            </header>

            {/* VÙNG CHÍNH: BỐ CỤC 2 PHẦN HÀI HÒA TRONG KHÔNG GIAN ĐẠI ĐIỆN */}
            <main className="flex-1 max-w-[1550px] w-full mx-auto p-3 sm:p-5 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
                
                {/* KHU VỰC TRÁI (7 CỘT): KHÔNG GIAN BẢO TÀNG, AUDIO GUIDE & DANH SÁCH BẢO VẬT */}
                <div className="lg:col-span-7 flex flex-col space-y-5">
                    <ExhibitionViewer 
                        containerRef={containerRef}
                        activePhoto={activePhoto}
                        currentGallery={currentGallery}
                        currentPhotoIndex={currentPhotoIndex}
                        currentHotspots={currentHotspots}
                        activeHotspot={activeHotspot}
                        zoomScale={zoomScale}
                        panOffset={panOffset}
                        isPanning={isPanning}
                        isFullscreen={isFullscreen}
                        audio={audio}
                        selectedArtifact={selectedArtifact}
                        onZoomIn={zoomIn}
                        onZoomOut={zoomOut}
                        onResetZoom={resetZoom}
                        onToggleFullscreen={toggleFullscreen}
                        onPrevPhoto={handlePrevPhoto}
                        onNextPhoto={handleNextPhoto}
                        onSelectPhoto={handleSelectPhoto}
                        onHotspotClick={handleHotspotClick}
                        onCloseHotspot={resetZoom}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    />

                    <ExhibitionAudioGuideBar 
                        audio={audio}
                        selectedArtifact={selectedArtifact}
                        activeHotspot={activeHotspot}
                        onOpenAiChat={openAiChat}
                    />

                    <ExhibitionArtifactSelector 
                        artifacts={artifacts}
                        selectedArtifact={selectedArtifact}
                        onSelectArtifact={handleSelectArtifact}
                    />
                </div>

                {/* KHU VỰC PHẢI (5 CỘT): TRANG SÁCH GIÁO KHOA & GIẢNG NGHĨA */}
                <div className="lg:col-span-5 flex flex-col space-y-4">
                    <ExhibitionDetailPanel 
                        selectedArtifact={selectedArtifact}
                        activeTab={activeTab}
                        currentHotspots={currentHotspots}
                        activeHotspot={activeHotspot}
                        audio={audio}
                        onTabChange={setActiveTab}
                        onHotspotClick={handleHotspotClick}
                        onOpenAiChat={openAiChat}
                    />
                </div>

            </main>
        </div>
    );
};

export default VirtualExhibition;
