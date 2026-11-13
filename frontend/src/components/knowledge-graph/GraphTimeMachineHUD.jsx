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
 * GraphTimeMachineHUD - Cß╗ù m├íy thß╗¥i gian di sß║ún (Cultural Time-Lapse Evolution)
 * Gß╗ôm hß╗Öp thuyß║┐t minh diß╗àn tiß║┐n v─ân h├│a v├á thanh Dock Bar chuyß╗ân dß╗ïch giß╗»a 5 kß╗╖ nguy├¬n.
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
            {/* 1. Hß╗Öp Thuyß║┐t Minh Kß╗╖ Nguy├¬n (Floating Narrative Card) */}
            {isStoryCardCollapsed ? (
                <div
                    onClick={() => setIsStoryCardCollapsed(false)}
                    className="kg-timemachine-story-card collapsed flex items-center justify-between gap-2.5 cursor-pointer hover:border-amber-400 group"
                    title="Bß║Ñm ─æß╗â mß╗ƒ rß╗Öng thuyß║┐t minh kß╗╖ nguy├¬n"
                >
                    <div className="flex items-center gap-2">
                        <span
                            className="w-2 h-2 rounded-full animate-ping flex-shrink-0"
                            style={{ backgroundColor: currentEraData?.color || '#f59e0b' }}
                        />
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                            {selectedEraId === 0 ? 'To├án Cß║únh V┼⌐ Trß╗Ñ' : `Kß╗╖ ${selectedEraId}: ${currentEraData?.shortName}`}
                        </span>
                        <span className="text-[10px] text-amber-300 font-mono flex-shrink-0">
                            +{eraStats?.newCount || 0} mß╗¢i
                        </span>
                    </div>
                    <span className="text-[10px] text-stone-400 group-hover:text-amber-300 flex items-center gap-0.5 flex-shrink-0">
                        Mß╗ƒ Γû╛
                    </span>
                </div>
            ) : (
                <div className="kg-timemachine-story-card">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-stone-950"
                            style={{ backgroundColor: currentEraData?.color || '#f59e0b' }}
                        >
                            {selectedEraId === 0 ? 'To├án Cß║únh' : `Kß╗╖ Nguy├¬n ${selectedEraId}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                                {currentEraData?.timeSpan}
                            </span>
                            <button
                                onClick={() => setIsStoryCardCollapsed(true)}
                                className="p-1 rounded text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Thu gß╗ìn bß║úng thuyß║┐t minh"
                            >
                                <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                        {currentEraData?.name}
                    </h3>

                    {/* Quote Ca Dao / Th╞í V─ân / Tuy├¬n ng├┤n */}
                    {currentEraData?.quote && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs italic font-serif leading-relaxed mb-2 shadow-sm">
                            &ldquo;{currentEraData.quote}&rdquo;
                        </div>
                    )}

                    {/* Tinh hoa mß╗¢i khß╗ƒi sinh trong Kß╗╖ nguy├¬n */}
                    {newlyEmergedNodes?.length > 0 && (
                        <div className="mb-2.5 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                            <div className="flex items-center justify-between text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                                <span className="flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                                    <span>Mß╗¢i khß╗ƒi sinh ({newlyEmergedNodes.length}):</span>
                                </span>
                                <span className="text-stone-400 text-[9px] font-normal lowercase">chß║ím ─æß╗â bay tß╗¢i</span>
                            </div>
                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto kg-custom-scroll pr-0.5">
                                {newlyEmergedNodes.slice(0, 8).map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => onSelectSearchNode(n)}
                                        className="px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/35 border border-amber-400/30 hover:border-amber-400 text-[10px] text-amber-200 hover:text-white transition-all flex items-center gap-1 cursor-pointer group shadow-sm"
                                        title={`Kh├ím ph├í nß╗æt: ${n.name}`}
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

                    {/* T├│m tß║»t bß╗æi cß║únh lß╗ïch sß╗¡ */}
                    <p className="text-xs text-stone-200 leading-relaxed font-light mb-2">
                        {currentEraData?.story}
                    </p>

                    {/* Chiß╗üu s├óu t╞░ t╞░ß╗ƒng cß╗æt l├╡i */}
                    {currentEraData?.insight && (
                        <div className="text-[11px] text-stone-300 bg-white/[0.03] p-2 rounded-lg border border-white/5 mb-2 leading-relaxed">
                            <span className="text-amber-400 font-bold block mb-0.5">≡ƒÆí Chiß╗üu s├óu t╞░ t╞░ß╗ƒng:</span>
                            {currentEraData.insight}
                        </div>
                    )}

                    {/* Thß╗æng k├¬ thß╗▒c thß╗â t├¡ch l┼⌐y */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[10px]">
                        <div className="bg-white/5 p-2 rounded-lg">
                            <div className="text-stone-400">Thß╗▒c thß╗â t├¡ch tß╗Ñ:</div>
                            <div className="text-amber-300 font-bold text-xs mt-0.5">
                                {eraStats?.total || 0} nß╗æt tri thß╗⌐c
                            </div>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg">
                            <div className="text-stone-400">
                                {selectedEraId === 0 ? 'To├án v┼⌐ trß╗Ñ:' : `Khß╗ƒi sinh trong Kß╗╖ ${selectedEraId}:`}
                            </div>
                            <div className="text-emerald-400 font-bold text-xs mt-0.5">
                                +{eraStats?.newCount || 0} nß╗æt mß╗¢i
                            </div>
                        </div>
                    </div>

                    {/* Trß║íng th├íi Thuyß║┐t minh Tiß║┐n h├│a */}
                    {isTimeLapsePlaying && (
                        <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-white/10 text-amber-300 font-medium">
                            <span className="flex items-center gap-1.5">
                                <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                                <span>{isEraVoiceEnabled ? 'AI ─æang ─æß╗ìc thuyß║┐t minh...' : '─Éang diß╗àn tiß║┐n thß╗¥i gian...'}</span>
                            </span>
                            <span className="text-stone-400 font-mono text-[10px]">
                                {Math.round(timeLapseProgress)}%
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* 2. Thanh ─Éiß╗üu Khiß╗ân Cß╗ù M├íy Thß╗¥i Gian (Dock Bar ß╗ƒ ─æ├íy m├án h├¼nh) */}
            <div className="kg-timemachine-panel">
                {/* Thanh tiß║┐n tr├¼nh chuyß╗ân ─æß╗Öng */}
                {isTimeLapsePlaying && (
                    <div className="w-full h-1 bg-white/10 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 transition-all duration-100 ease-linear"
                            style={{ width: `${timeLapseProgress}%` }}
                        />
                    </div>
                )}

                <div className="p-3 sm:p-4 flex flex-col gap-3">
                    {/* D├▓ng ─æiß╗üu khiß╗ân tr├¬n */}
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
                                        ? 'To├án bß╗Ö 4 tß║ºng tri thß╗⌐c t├¡ch l┼⌐y qua ng├án n─âm'
                                        : `Kß╗╖ nguy├¬n ${selectedEraId}/5 ΓÇó ${eraStats?.total || 0} thß╗▒c thß╗â t├¡ch tß╗Ñ (+${eraStats?.newCount || 0} khß╗ƒi sinh)`}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* N├║t l├╣i kß╗╖ nguy├¬n */}
                            <button
                                onClick={() => {
                                    const prev = selectedEraId <= 1 ? 5 : selectedEraId - 1;
                                    setSelectedEraId(prev);
                                    if (isSoundEnabled) playTraditionalChime(0.75 + prev * 0.15);
                                }}
                                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Kß╗╖ nguy├¬n tr╞░ß╗¢c"
                            >
                                <SkipBack className="w-4 h-4" />
                            </button>

                            {/* N├║t Ph├ít / Tß║ím dß╗½ng Time-Lapse */}
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
                                        <span>Tß║ím Dß╗½ng</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-3.5 h-3.5 fill-stone-950 ml-0.5" />
                                        <span>Ph├ít Tiß║┐n H├│a</span>
                                    </>
                                )}
                            </button>

                            {/* N├║t tiß║┐n kß╗╖ nguy├¬n */}
                            <button
                                onClick={() => {
                                    const next = selectedEraId >= 5 ? 1 : selectedEraId + 1;
                                    setSelectedEraId(next);
                                    if (isSoundEnabled) playTraditionalChime(0.75 + next * 0.15);
                                }}
                                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Kß╗╖ nguy├¬n tiß║┐p theo"
                            >
                                <SkipForward className="w-4 h-4" />
                            </button>

                            <div className="h-4 w-px bg-white/15 mx-1" />

                            {/* N├║t bß║¡t/tß║»t giß╗ìng ─æß╗ìc AI */}
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
                                title={isEraVoiceEnabled ? 'Tß║»t giß╗ìng ─æß╗ìc kß╗╖ nguy├¬n' : 'Bß║¡t giß╗ìng ─æß╗ìc kß╗╖ nguy├¬n'}
                            >
                                {isEraVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            </button>

                            {/* N├║t ─É├│ng Cß╗ù M├íy Thß╗¥i Gian */}
                            <button
                                onClick={onCloseTimeMachine}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="─É├│ng Cß╗ù M├íy Thß╗¥i Gian"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Stepper buttons (Kß╗╖ 0 + Kß╗╖ 1..5) */}
                    <div className="grid grid-cols-6 gap-1.5 pt-1 border-t border-white/10">
                        <button
                            onClick={() => {
                                setSelectedEraId(0);
                                if (isSoundEnabled) playTraditionalChime(1);
                            }}
                            className={`kg-era-step-btn cursor-pointer ${selectedEraId === 0 ? 'active border-amber-400' : ''}`}
                        >
                            <span className="text-[10px] font-bold text-amber-300">V┼⌐ Trß╗Ñ</span>
                            <span className="text-[9px] text-stone-400 hidden sm:inline">V─⌐nh Cß╗¡u</span>
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
                                        Kß╗╖ {era.id}
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
