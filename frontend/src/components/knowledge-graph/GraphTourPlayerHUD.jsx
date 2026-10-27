import { 
    Sparkles, 
    Volume2, 
    VolumeX, 
    CheckCircle2, 
    Pause, 
    Play, 
    BookOpen, 
    Award, 
    RotateCcw, 
    SkipBack, 
    SkipForward, 
    X 
} from 'lucide-react';

/**
 * GraphTourPlayerHUD - Giao diện trình phát chuyến du hành văn hóa tự động (Cinematic Story Card & Controls)
 */
const GraphTourPlayerHUD = ({
    activeTour,
    tourStepIndex,
    tourNarrationStatus,
    tourTimerProgress,
    isTourPlaying,
    isVoiceNarrationEnabled,
    setIsVoiceNarrationEnabled,
    onPrevTourStep,
    onNextTourStep,
    onToggleTourPlay,
    onExitTour,
    onRestartTour,
    onOpenTourModal
}) => {
    if (!activeTour || !activeTour.stops?.[tourStepIndex]) return null;

    const currentStop = activeTour.stops[tourStepIndex];

    return (
        <>
            {/* 1. Hộp Thuyết Minh Văn Hóa (Story Card - Compact & Ghim Góc Phải) */}
            <div className="kg-tour-story-card">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-stone-950"
                        style={{ backgroundColor: activeTour.themeColor || '#f59e0b' }}
                    >
                        {activeTour.badge || activeTour.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                        {currentStop.phase && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                                {currentStop.phase}
                            </span>
                        )}
                        <span className="text-[11px] text-stone-300 font-bold bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                            {tourStepIndex + 1}/{activeTour.stops.length}
                        </span>
                    </div>
                </div>

                <div className="text-[10px] text-stone-400 uppercase tracking-wider mb-1 font-medium">
                    {currentStop.role}
                </div>

                <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                    {currentStop.title}
                </h3>

                {/* Hộp Chuyển Tiếp Bối Cảnh (Contextual Transition Bridge) */}
                {currentStop.transition && (
                    <div className="kg-tour-transition-box mb-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse flex-shrink-0" />
                            <span>Mạch Nguồn Chuyển Tiếp</span>
                        </div>
                        <p className="text-[11px] text-amber-100/90 italic font-serif leading-relaxed">
                            &ldquo;{currentStop.transition}&rdquo;
                        </p>
                    </div>
                )}

                <p className="text-xs text-stone-200 leading-relaxed font-light mb-2.5">
                    {currentStop.story}
                </p>

                {/* Quote Ca dao/Thơ */}
                {currentStop.quote && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs italic font-serif leading-relaxed mb-2.5 shadow-sm">
                        &ldquo;{currentStop.quote}&rdquo;
                    </div>
                )}

                {/* Đúc kết triết lý */}
                {currentStop.insight && (
                    <div className="text-[11px] text-stone-400 flex items-start gap-1 leading-snug mb-2">
                        <span className="text-amber-400 font-bold flex-shrink-0">💡 Triết lý:</span>
                        <span className="line-clamp-2 text-stone-300">{currentStop.insight}</span>
                    </div>
                )}

                {/* Trạng thái Thuyết Minh Thời Gian Thực */}
                <div className="flex items-center justify-between text-[11px] mt-2 mb-1.5 pt-2 border-t border-white/10">
                    {tourNarrationStatus === 'narrating' ? (
                        <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                            <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                            <span>AI đang đọc thuyết minh...</span>
                        </span>
                    ) : tourNarrationStatus === 'contemplating' ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold animate-pulse">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Đã đọc xong • Chuẩn bị chuyển chặng...</span>
                        </span>
                    ) : tourNarrationStatus === 'paused' ? (
                        <span className="flex items-center gap-1.5 text-stone-400">
                            <Pause className="w-3.5 h-3.5 text-amber-400" />
                            <span>Tạm dừng du hành</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-stone-300">
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            <span>Đang đọc chiêm nghiệm...</span>
                        </span>
                    )}
                    <span className="text-stone-400 font-mono text-[10px]">
                        {Math.round(tourTimerProgress)}%
                    </span>
                </div>

                {/* Thanh đếm ngược thời gian tự động chuyển chặng */}
                <div className="kg-tour-timer-track">
                    <div
                        className="kg-tour-timer-fill"
                        style={{ width: `${tourTimerProgress}%` }}
                    />
                </div>

                {/* Thông báo khi hoàn tất cả các chặng */}
                {tourStepIndex === activeTour.stops.length - 1 && tourTimerProgress >= 100 && (
                    <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between gap-2 animation-fade-in">
                        <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span>Đã hoàn thành chuyến du hành!</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={onRestartTour}
                                className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 transition-all cursor-pointer"
                                title="Nghe lại tour từ chặng đầu"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Nghe lại
                            </button>
                            <button
                                onClick={onOpenTourModal}
                                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold border border-white/20 flex items-center gap-1 transition-all cursor-pointer"
                                title="Chọn một chuyến du hành khác"
                            >
                                Tour khác
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Thanh Điều Khiển Du Hành (Floating HUD Controls) */}
            <div className="kg-tour-hud-bar">
                {/* Nút lùi chặng */}
                <button
                    onClick={onPrevTourStep}
                    disabled={tourStepIndex === 0}
                    className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    title="Chặng trước"
                >
                    <SkipBack className="w-4 h-4" />
                </button>

                {/* Nút Play / Pause */}
                <button
                    onClick={onToggleTourPlay}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer"
                    title={isTourPlaying ? 'Tạm dừng du hành' : 'Tiếp tục du hành'}
                >
                    {isTourPlaying ? (
                        <Pause className="w-4 h-4 fill-stone-950" />
                    ) : (
                        <Play className="w-4 h-4 fill-stone-950 ml-0.5" />
                    )}
                </button>

                {/* Nút tiến chặng */}
                <button
                    onClick={onNextTourStep}
                    disabled={tourStepIndex === activeTour.stops.length - 1}
                    className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    title="Chặng tiếp theo"
                >
                    <SkipForward className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-white/20 mx-1" />

                {/* Nút bật/tắt thuyết minh giọng đọc AI */}
                <button
                    onClick={() => setIsVoiceNarrationEnabled(!isVoiceNarrationEnabled)}
                    className={`p-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isVoiceNarrationEnabled
                            ? 'text-amber-300 bg-amber-500/15'
                            : 'text-stone-400 hover:text-white'
                    }`}
                    title={isVoiceNarrationEnabled ? 'Tắt giọng đọc AI' : 'Bật giọng đọc AI'}
                >
                    {isVoiceNarrationEnabled ? (
                        <Volume2 className="w-4 h-4 text-amber-400" />
                    ) : (
                        <VolumeX className="w-4 h-4 text-stone-400" />
                    )}
                    <span className="hidden sm:inline text-[11px]">
                        {isVoiceNarrationEnabled ? 'Giọng Đọc Bật' : 'Tắt Tiếng'}
                    </span>
                </button>

                <div className="h-4 w-px bg-white/20 mx-1" />

                {/* Nút thoát chuyến du hành */}
                <button
                    onClick={onExitTour}
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-red-500/20 text-stone-300 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Kết thúc chuyến du hành"
                >
                    <X className="w-3.5 h-3.5" />
                    <span>Thoát Tour</span>
                </button>
            </div>
        </>
    );
};

export default GraphTourPlayerHUD;
