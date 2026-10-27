import MuseumGoldDustCanvas from './MuseumGoldDustCanvas';
import { 
    ChevronLeft, 
    ChevronRight, 
    ZoomIn, 
    ZoomOut, 
    RotateCcw, 
    Maximize2, 
    Minimize2, 
    Camera, 
    Move, 
    Headphones, 
    Volume2 
} from 'lucide-react';

/**
 * ExhibitionViewer - Khung soi ảnh bảo vật siêu nét (Deep Zoom & Pan Viewport)
 * Tích hợp hiệu ứng hạt bụi vàng, ánh sáng spotlight, và hệ thống điểm ghim Hotspot.
 */
const ExhibitionViewer = ({
    containerRef,
    activePhoto,
    currentGallery,
    currentPhotoIndex,
    currentHotspots,
    activeHotspot,
    zoomScale,
    panOffset,
    isPanning,
    isFullscreen,
    audio,
    selectedArtifact,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    onToggleFullscreen,
    onPrevPhoto,
    onNextPhoto,
    onSelectPhoto,
    onHotspotClick,
    onCloseHotspot,
    onWheel,
    onMouseDown,
    onMouseMove,
    onTouchStart,
    onTouchMove,
    onTouchEnd
}) => {
    return (
        <div 
            ref={containerRef}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseDown ? onMouseMove : undefined}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#18110b] via-[#0d0906] to-[#140e0a] border-2 border-amber-500/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(217,119,6,0.15)] ring-1 ring-amber-400/20 select-none transition-all ${
                isPanning ? 'cursor-grabbing' : zoomScale > 1 ? 'cursor-grab' : 'cursor-zoom-in'
            }`}
            style={{ minHeight: '560px', height: '560px' }}
        >
            {/* 1. HIỆU ỨNG HẠT BỤI VÀNG LƠ LỬNG TRONG PHÒNG BẢO TÀNG */}
            <MuseumGoldDustCanvas isActive={true} />

            {/* 2. CHÙM SÁNG RỌI SPOTLIGHT BẢO TÀNG ĐIỆN ẢNH */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.18),transparent_65%),radial-gradient(circle_at_bottom,_rgba(0,0,0,0.8)_0%,transparent_100%)]" />

            {/* Huy hiệu hiển thị tên bức ảnh hiện tại góc trên bên trái */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#140e09]/90 text-amber-200 border border-amber-500/40 backdrop-blur-xl flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>{(activePhoto?.title || '').replace(/\s*\(\d+°?\)/g, '').trim()}</span>
                </span>
            </div>

            {/* THANH ĐIỀU KHIỂN ZOOM CHUYÊN NGHIỆP GÓC TRÊN BÊN PHẢI */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#120d09]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-amber-500/35 shadow-[0_8px_30px_rgba(0,0,0,0.7)]">
                {/* Nút nghe thuyết minh nhanh trên thanh công cụ */}
                <button
                    type="button"
                    onClick={() => {
                        if (audio?.isSpeaking) audio.stopSpeech();
                        else audio?.narrateArtifact(selectedArtifact);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        audio?.isSpeaking
                            ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-102'
                            : 'bg-[#1e150e] text-amber-200 hover:text-white hover:bg-amber-950/60 border border-amber-500/25'
                    }`}
                    title="Bật thuyết minh bảo vật"
                >
                    <Headphones className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Audio Guide</span>
                </button>

                <div className="w-[1px] h-4 bg-amber-500/20 mx-0.5" />

                {/* Nút Thu nhỏ (-) */}
                <button
                    type="button"
                    onClick={onZoomOut}
                    disabled={zoomScale <= 1}
                    className={`p-1.5 rounded-xl transition-all ${
                        zoomScale <= 1 
                            ? 'text-stone-600 cursor-not-allowed' 
                            : 'text-amber-200 hover:text-white hover:bg-amber-950/50 cursor-pointer'
                    }`}
                    title="Thu nhỏ (-)"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>

                {/* Tỉ lệ Zoom % */}
                <button
                    type="button"
                    onClick={onResetZoom}
                    className="px-2 py-0.5 text-xs font-extrabold text-amber-300 hover:bg-amber-950/50 rounded-lg transition-all cursor-pointer min-w-[48px] text-center"
                    title="Bấm để đặt lại 100%"
                >
                    {Math.round(zoomScale * 100)}%
                </button>

                {/* Nút Phóng to (+) */}
                <button
                    type="button"
                    onClick={onZoomIn}
                    disabled={zoomScale >= 3.5}
                    className={`p-1.5 rounded-xl transition-all ${
                        zoomScale >= 3.5 
                            ? 'text-stone-600 cursor-not-allowed' 
                            : 'text-amber-200 hover:text-white hover:bg-amber-950/50 cursor-pointer'
                    }`}
                    title="Phóng to (+)"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-4 bg-amber-500/20 mx-0.5" />

                {/* Nút Reset */}
                <button
                    type="button"
                    onClick={onResetZoom}
                    className="p-1.5 rounded-xl text-amber-200 hover:text-white hover:bg-amber-950/50 transition-all cursor-pointer"
                    title="Đặt lại vị trí ban đầu"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>

                {/* Nút Toàn màn hình */}
                <button
                    type="button"
                    onClick={onToggleFullscreen}
                    className="p-1.5 rounded-xl text-amber-200 hover:text-white hover:bg-amber-950/50 transition-all cursor-pointer"
                    title={isFullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}
                >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
            </div>

            {/* NÚT MŨI TÊN CHUYỂN ẢNH NHANH TRÁI / PHẢI */}
            {currentGallery?.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={onPrevPhoto}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#120d09]/85 hover:bg-[#1f150e]/95 text-amber-300 hover:text-white flex items-center justify-center border border-amber-500/40 backdrop-blur-xl shadow-[0_5px_20px_rgba(0,0,0,0.7)] transition-all cursor-pointer hover:scale-110 active:scale-95"
                        title="Xem góc ảnh trước"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={onNextPhoto}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#120d09]/85 hover:bg-[#1f150e]/95 text-amber-300 hover:text-white flex items-center justify-center border border-amber-500/40 backdrop-blur-xl shadow-[0_5px_20px_rgba(0,0,0,0.7)] transition-all cursor-pointer hover:scale-110 active:scale-95"
                        title="Xem góc ảnh kế tiếp"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </>
            )}

            {/* VÙNG CHỨA ẢNH SIÊU NÉT & ĐIỂM GHIM VỚI TRANSFORM SMOOTH */}
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center" onDoubleClick={onResetZoom}>
                <div 
                    className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
                    style={{
                        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                        transformOrigin: 'center center'
                    }}
                >
                    {/* Bức ảnh bảo vật Cloudinary chất lượng cao */}
                    {activePhoto?.image && (
                        <img 
                            src={activePhoto.image} 
                            alt={activePhoto.title}
                            className="w-full h-full object-cover pointer-events-none select-none"
                        />
                    )}

                    {/* CÁC ĐIỂM GHIM TƯƠNG TÁC (HOTSPOTS) HOÀNG GIA - HOA VĂN MẶT TRỜI ĐỒNG SƠN */}
                    {currentHotspots?.map((spot) => {
                        const isCurrent = activeHotspot?.id === spot.id;
                        return (
                            <div
                                key={spot.id}
                                style={{
                                    left: `${spot.x}%`,
                                    top: `${spot.y}%`,
                                    zIndex: isCurrent ? 35 : 20,
                                }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                            >
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onHotspotClick(spot);
                                    }}
                                    className="relative group/pin cursor-pointer focus:outline-none"
                                    title={isCurrent ? `${spot.title} (Bấm lại để thu về toàn cảnh)` : spot.title}
                                >
                                    {/* Vầng hào quang bảo vật tỏa sáng dịu mắt */}
                                    <span className={`absolute -inset-2.5 rounded-full ${
                                        isCurrent 
                                            ? 'bg-amber-400/50 animate-ping' 
                                            : 'bg-amber-500/25 group-hover/pin:bg-amber-400/40 animate-pulse'
                                    }`} />
                                    
                                    {/* Tâm điểm ghim Hoàng gia bằng đồng mạ vàng tinh xảo */}
                                    <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 hover:scale-125 border-2 ${
                                        isCurrent 
                                            ? 'bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-100 text-stone-950 border-white ring-4 ring-amber-400/70 scale-125 shadow-[0_0_25px_rgba(251,191,36,0.9)]' 
                                            : 'bg-gradient-to-tr from-[#68230b] via-[#92400e] to-[#d97706] text-amber-100 border-amber-300/80 shadow-[0_0_15px_rgba(217,119,6,0.5)] group-hover/pin:scale-115 group-hover/pin:ring-2 group-hover/pin:ring-amber-300'
                                    }`}>
                                        {isCurrent ? '✕' : '❖'}
                                    </div>

                                    {/* Tooltip khi rê chuột vào điểm ghim */}
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 hidden group-hover/pin:flex flex-col items-center pointer-events-none whitespace-nowrap z-30 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="bg-[#140e09]/95 text-amber-100 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-amber-500/50 shadow-[0_8px_25px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            <span>{spot.title}</span>
                                            {isCurrent && <span className="text-amber-400/70 font-normal">• Bấm lại để về 100%</span>}
                                        </div>
                                        <div className="w-2 h-2 bg-[#140e09]/95 rotate-45 -mt-1 border-r border-b border-amber-500/50" />
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* BẢNG CHÚ GIẢI CHI TIẾT KHI CLICK VÀO ĐIỂM GHIM (CÓ NÚT NGHE THUYẾT MINH TẠI CHỖ) */}
                {activeHotspot && (
                    <div className="absolute bottom-16 left-4 right-4 z-30 bg-[#150f0a]/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-amber-500/50 text-left shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40">
                                    {activeHotspot.tag}
                                </span>
                                <h4 className="text-sm sm:text-base font-bold text-amber-100 font-heritage">
                                    {activeHotspot.title}
                                </h4>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Nút nghe thuyết minh điểm này */}
                                <button
                                    type="button"
                                    onClick={() => audio?.narrateHotspot(activeHotspot)}
                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-900 to-amber-600 hover:from-red-800 hover:to-amber-500 text-amber-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md border border-amber-400/40 transition-all hover:scale-102"
                                >
                                    <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Nghe điểm này</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={onCloseHotspot}
                                    className="text-stone-400 hover:text-white text-xs cursor-pointer px-2.5 py-1.5 rounded-xl hover:bg-[#22170f] border border-stone-700/60 flex items-center gap-1 transition-all"
                                    title="Đóng & trở về toàn cảnh 100%"
                                >
                                    <span>✕ Về toàn cảnh</span>
                                </button>
                            </div>
                        </div>
                        <p className="text-xs sm:text-[13px] text-amber-100/80 mt-2.5 leading-relaxed font-serif">
                            {activeHotspot.detail}
                        </p>
                    </div>
                )}
            </div>

            {/* DẢI NÚT CHUYỂN ẢNH TINH TẾ CĂN GIỮA DƯỚI ĐÁY */}
            {currentGallery?.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-[#120d09]/90 backdrop-blur-xl p-1.5 rounded-full border border-amber-500/35 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
                    {currentGallery.map((photo, pIdx) => {
                        const isSelected = pIdx === currentPhotoIndex;
                        const displayTitle = (photo.shortTitle || photo.title || '').replace(/\s*\(\d+°?\)/g, '').trim();
                        return (
                            <button
                                key={photo.id || pIdx}
                                type="button"
                                onClick={() => onSelectPhoto(pIdx)}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    isSelected
                                        ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                                        : 'bg-[#1a120b] text-stone-300 hover:text-amber-200 hover:bg-[#251b11]'
                                }`}
                            >
                                <img 
                                    src={photo.image} 
                                    alt={displayTitle}
                                    className="w-4 h-4 rounded-full object-cover border border-amber-500/40"
                                />
                                <span>{displayTitle}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* HƯỚNG DẪN LĂN CHUỘT / KÉO LIA ẢNH TINH TẾ GÓC PHẢI */}
            <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden lg:flex items-center gap-1.5 text-[11px] text-amber-300/80 bg-[#120d09]/85 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-amber-500/30 shadow-lg">
                <Move className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Lăn chuột phóng to • Kéo lia</span>
            </div>
        </div>
    );
};

export default ExhibitionViewer;
