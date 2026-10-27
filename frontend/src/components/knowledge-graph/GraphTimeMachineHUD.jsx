import { 
    Clock, 
    ChevronUp, 
    Sparkles, 
    ArrowRight, 
    Volume2, 
    VolumeX, 
    SkipBack, 
    SkipForward, 
    Play, 
    Pause, 
    X 
} from 'lucide-react';

/**
 * GraphTimeMachineHUD - Cỗ máy thời gian di sản (Cultural Time-Lapse Evolution)
 * Gồm hộp thuyết minh diễn tiến văn hóa và thanh Dock Bar chuyển dịch giữa 5 kỷ nguyên.
 */
const GraphTimeMachineHUD = ({
    isActive,
    selectedEraId,
    setSelectedEraId,
    currentEraData,
    activeErasList,
    eraStats,
    newlyEmergedNodes,
    isStoryCardCollapsed,
    setIsStoryCardCollapsed,
    isTimeLapsePlaying,
    setIsTimeLapsePlaying,
    timeLapseProgress,
    isEraVoiceEnabled,
    setIsEraVoiceEnabled,
    isSoundEnabled,
    playTraditionalChime,
    onSelectSearchNode,
    onCloseTimeMachine
}) => {
    if (!isActive) return null;

    return (
        <>
            {/* 1. Hộp Thuyết Minh Kỷ Nguyên (Floating Narrative Card) */}
            {isStoryCardCollapsed ? (
                <div
                    onClick={() => setIsStoryCardCollapsed(false)}
                    className="kg-timemachine-story-card collapsed flex items-center justify-between gap-2.5 cursor-pointer hover:border-amber-400 group"
                    title="Bấm để mở rộng thuyết minh kỷ nguyên"
                >
                    <div className="flex items-center gap-2">
                        <span
                            className="w-2 h-2 rounded-full animate-ping flex-shrink-0"
                            style={{ backgroundColor: currentEraData?.color || '#f59e0b' }}
                        />
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                            {selectedEraId === 0 ? 'Toàn Cảnh Vũ Trụ' : `Kỷ ${selectedEraId}: ${currentEraData?.shortName}`}
                        </span>
                        <span className="text-[10px] text-amber-300 font-mono flex-shrink-0">
                            +{eraStats?.newCount || 0} mới
                        </span>
                    </div>
                    <span className="text-[10px] text-stone-400 group-hover:text-amber-300 flex items-center gap-0.5 flex-shrink-0">
                        Mở ▾
                    </span>
                </div>
            ) : (
                <div className="kg-timemachine-story-card">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-stone-950"
                            style={{ backgroundColor: currentEraData?.color || '#f59e0b' }}
                        >
                            {selectedEraId === 0 ? 'Toàn Cảnh' : `Kỷ Nguyên ${selectedEraId}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                                {currentEraData?.timeSpan}
                            </span>
                            <button
                                onClick={() => setIsStoryCardCollapsed(true)}
                                className="p-1 rounded text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Thu gọn bảng thuyết minh"
                            >
                                <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                        {currentEraData?.name}
                    </h3>

                    {/* Quote Ca Dao / Thơ Văn / Tuyên ngôn */}
                    {currentEraData?.quote && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs italic font-serif leading-relaxed mb-2 shadow-sm">
                            &ldquo;{currentEraData.quote}&rdquo;
                        </div>
                    )}

                    {/* Tinh hoa mới khởi sinh trong Kỷ nguyên */}
                    {newlyEmergedNodes?.length > 0 && (
                        <div className="mb-2.5 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                            <div className="flex items-center justify-between text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                                <span className="flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                                    <span>Mới khởi sinh ({newlyEmergedNodes.length}):</span>
                                </span>
                                <span className="text-stone-400 text-[9px] font-normal lowercase">chạm để bay tới</span>
                            </div>
                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto kg-custom-scroll pr-0.5">
                                {newlyEmergedNodes.slice(0, 8).map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => onSelectSearchNode(n)}
                                        className="px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/35 border border-amber-400/30 hover:border-amber-400 text-[10px] text-amber-200 hover:text-white transition-all flex items-center gap-1 cursor-pointer group shadow-sm"
                                        title={`Khám phá nốt: ${n.name}`}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: n.color || '#10b981' }}
                                        />
                                        <span className="truncate max-w-[100px]">{n.name}</span>
                                        <ArrowRight className="w-2.5 h-2.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tóm tắt bối cảnh lịch sử */}
                    <p className="text-xs text-stone-200 leading-relaxed font-light mb-2">
                        {currentEraData?.story}
                    </p>

                    {/* Chiều sâu tư tưởng cốt lõi */}
                    {currentEraData?.insight && (
                        <div className="text-[11px] text-stone-300 bg-white/[0.03] p-2 rounded-lg border border-white/5 mb-2 leading-relaxed">
                            <span className="text-amber-400 font-bold block mb-0.5">💡 Chiều sâu tư tưởng:</span>
                            {currentEraData.insight}
                        </div>
                    )}

                    {/* Thống kê thực thể tích lũy */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[10px]">
                        <div className="bg-white/5 p-2 rounded-lg">
                            <div className="text-stone-400">Thực thể tích tụ:</div>
                            <div className="text-amber-300 font-bold text-xs mt-0.5">
                                {eraStats?.total || 0} nốt tri thức
                            </div>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg">
                            <div className="text-stone-400">
                                {selectedEraId === 0 ? 'Toàn vũ trụ:' : `Khởi sinh trong Kỷ ${selectedEraId}:`}
                            </div>
                            <div className="text-emerald-400 font-bold text-xs mt-0.5">
                                +{eraStats?.newCount || 0} nốt mới
                            </div>
                        </div>
                    </div>

                    {/* Trạng thái Thuyết minh Tiến hóa */}
                    {isTimeLapsePlaying && (
                        <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-white/10 text-amber-300 font-medium">
                            <span className="flex items-center gap-1.5">
                                <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                                <span>{isEraVoiceEnabled ? 'AI đang đọc thuyết minh...' : 'Đang diễn tiến thời gian...'}</span>
                            </span>
                            <span className="text-stone-400 font-mono text-[10px]">
                                {Math.round(timeLapseProgress)}%
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* 2. Thanh Điều Khiển Cỗ Máy Thời Gian (Dock Bar ở đáy màn hình) */}
            <div className="kg-timemachine-panel">
                {/* Thanh tiến trình chuyển động */}
                {isTimeLapsePlaying && (
                    <div className="w-full h-1 bg-white/10 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 transition-all duration-100 ease-linear"
                            style={{ width: `${timeLapseProgress}%` }}
                        />
                    </div>
                )}

                <div className="p-3 sm:p-4 flex flex-col gap-3">
                    {/* Dòng điều khiển trên */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                                <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm font-bold text-white">
                                        {currentEraData?.shortName || currentEraData?.name}
                                    </span>
                                    <span className="text-[10px] text-amber-300/90 bg-amber-500/15 px-2 py-0.2 rounded border border-amber-500/30">
                                        {currentEraData?.timeSpan}
                                    </span>
                                </div>
                                <div className="text-[10px] text-stone-400 mt-0.5">
                                    {selectedEraId === 0
                                        ? 'Toàn bộ 4 tầng tri thức tích lũy qua ngàn năm'
                                        : `Kỷ nguyên ${selectedEraId}/5 • ${eraStats?.total || 0} thực thể tích tụ (+${eraStats?.newCount || 0} khởi sinh)`}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* Nút lùi kỷ nguyên */}
                            <button
                                onClick={() => {
                                    const prev = selectedEraId <= 1 ? 5 : selectedEraId - 1;
                                    setSelectedEraId(prev);
                                    if (isSoundEnabled) playTraditionalChime(0.75 + prev * 0.15);
                                }}
                                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Kỷ nguyên trước"
                            >
                                <SkipBack className="w-4 h-4" />
                            </button>

                            {/* Nút Phát / Tạm dừng Time-Lapse */}
                            <button
                                onClick={() => {
                                    if (!isTimeLapsePlaying && selectedEraId === 0) {
                                        setSelectedEraId(1);
                                    }
                                    setIsTimeLapsePlaying(!isTimeLapsePlaying);
                                }}
                                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer"
                            >
                                {isTimeLapsePlaying ? (
                                    <>
                                        <Pause className="w-3.5 h-3.5 fill-stone-950" />
                                        <span>Tạm Dừng</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-3.5 h-3.5 fill-stone-950 ml-0.5" />
                                        <span>Phát Tiến Hóa</span>
                                    </>
                                )}
                            </button>

                            {/* Nút tiến kỷ nguyên */}
                            <button
                                onClick={() => {
                                    const next = selectedEraId >= 5 ? 1 : selectedEraId + 1;
                                    setSelectedEraId(next);
                                    if (isSoundEnabled) playTraditionalChime(0.75 + next * 0.15);
                                }}
                                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Kỷ nguyên tiếp theo"
                            >
                                <SkipForward className="w-4 h-4" />
                            </button>

                            <div className="h-4 w-px bg-white/15 mx-1" />

                            {/* Nút bật/tắt giọng đọc AI */}
                            <button
                                onClick={() => {
                                    if (isEraVoiceEnabled && window.speechSynthesis) {
                                        window.speechSynthesis.cancel();
                                    }
                                    setIsEraVoiceEnabled(!isEraVoiceEnabled);
                                }}
                                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                                    isEraVoiceEnabled ? 'text-amber-300 bg-amber-500/15' : 'text-stone-400 hover:text-white'
                                }`}
                                title={isEraVoiceEnabled ? 'Tắt giọng đọc kỷ nguyên' : 'Bật giọng đọc kỷ nguyên'}
                            >
                                {isEraVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            </button>

                            {/* Nút Đóng Cỗ Máy Thời Gian */}
                            <button
                                onClick={onCloseTimeMachine}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Đóng Cỗ Máy Thời Gian"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Stepper buttons (Kỷ 0 + Kỷ 1..5) */}
                    <div className="grid grid-cols-6 gap-1.5 pt-1 border-t border-white/10">
                        <button
                            onClick={() => {
                                setSelectedEraId(0);
                                if (isSoundEnabled) playTraditionalChime(1);
                            }}
                            className={`kg-era-step-btn cursor-pointer ${selectedEraId === 0 ? 'active border-amber-400' : ''}`}
                        >
                            <span className="text-[10px] font-bold text-amber-300">Vũ Trụ</span>
                            <span className="text-[9px] text-stone-400 hidden sm:inline">Vĩnh Cửu</span>
                        </button>
                        {activeErasList?.map((era) => {
                            const isSelected = selectedEraId === era.id;
                            return (
                                <button
                                    key={era.id}
                                    onClick={() => {
                                        setSelectedEraId(era.id);
                                        if (isSoundEnabled) playTraditionalChime(0.75 + era.id * 0.15);
                                    }}
                                    className={`kg-era-step-btn cursor-pointer ${isSelected ? 'active' : ''}`}
                                    style={{
                                        borderColor: isSelected ? era.color : undefined,
                                    }}
                                >
                                    <span
                                        className="text-[10px] font-bold truncate max-w-full"
                                        style={{ color: isSelected ? era.color : '#e2e8f0' }}
                                    >
                                        Kỷ {era.id}
                                    </span>
                                    <span className="text-[9px] text-stone-400 truncate max-w-full hidden sm:inline">
                                        {era.shortName}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GraphTimeMachineHUD;
