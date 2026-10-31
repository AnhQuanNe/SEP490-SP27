import { Volume2, VolumeX, Play, Pause, Square, Radio, Sparkles, Gauge } from 'lucide-react';

/**
 * ExhibitionAudioGuideBar - Thanh điều khiển thuyết minh di sản & âm hưởng không gian
 * Thiết kế chuẩn phong cách bảo tàng hoàng gia: nền đá huyền, viền đồng cổ, ánh vàng kim.
 */
const ExhibitionAudioGuideBar = ({
    audio,
    selectedArtifact,
    activeHotspot,
    onOpenAiChat
}) => {
    const {
        isAmbientPlaying,
        ambientVolume,
        toggleAmbient,
        setAmbientVolume,
        playChimeTone,
        isSpeaking,
        isPaused,
        speechSpeed,
        audioTitle,
        currentSentence,
        sentenceIndex,
        totalSentences,
        narrateArtifact,
        narrateHotspot,
        pauseSpeech,
        resumeSpeech,
        stopSpeech,
        changeSpeed
    } = audio;

    const progressPct = totalSentences > 0 ? Math.round(((sentenceIndex + 1) / totalSentences) * 100) : 0;

    return (
        <div className="bg-gradient-to-r from-[#120d08] via-[#1c130b] to-[#120d08] rounded-3xl border border-amber-500/35 p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] text-amber-100 space-y-3.5 relative overflow-hidden backdrop-blur-2xl ring-1 ring-amber-500/15">
            {/* Họa tiết tia sáng huyền ảo nền */}
            <div className="absolute top-0 right-0 w-80 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-28 bg-red-900/15 rounded-full blur-2xl pointer-events-none" />

            {/* DÒNG 1: TRẠNG THÁI & CÁC NÚT ĐIỀU KHIỂN CHÍNH */}
            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
                {/* Khu vực thông tin đang phát */}
                <div className="flex items-center space-x-3.5 min-w-[200px]">
                    {/* Nút Play / Pause tròn to màu vàng hoàng gia */}
                    <button
                        type="button"
                        onClick={() => {
                            if (isSpeaking) {
                                if (isPaused) resumeSpeech();
                                else pauseSpeech();
                            } else {
                                narrateArtifact(selectedArtifact);
                            }
                        }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)] ${
                            isSpeaking && !isPaused
                                ? 'bg-gradient-to-tr from-amber-400 to-amber-200 text-stone-950 ring-4 ring-amber-400/40 scale-105 shadow-[0_0_25px_rgba(251,191,36,0.6)]'
                                : 'bg-gradient-to-tr from-red-950 via-red-800 to-amber-600 hover:from-red-800 hover:to-amber-500 text-amber-100 hover:scale-105 border border-amber-400/50'
                        }`}
                        title={isSpeaking ? (isPaused ? 'Tiếp tục nghe' : 'Tạm dừng') : 'Bắt đầu nghe thuyết minh'}
                    >
                        {isSpeaking && !isPaused ? (
                            <Pause className="w-5 h-5 fill-current" />
                        ) : (
                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                        )}
                    </button>

                    {/* Tiêu đề & Sóng âm thanh */}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-xs">
                                <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                                <span>Audio Guide Di Sản</span>
                            </span>

                            {/* Soundwave equalizer bars khi đang đọc */}
                            {isSpeaking && !isPaused && (
                                <div className="flex items-end gap-1 h-3.5">
                                    <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-3.5 shadow-xs" />
                                    <span className="w-1 bg-amber-300 rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-2.5 shadow-xs" />
                                    <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.5s_ease-in-out_infinite] h-4 shadow-xs" />
                                    <span className="w-1 bg-amber-200 rounded-full animate-[bounce_0.7s_ease-in-out_infinite] h-3 shadow-xs" />
                                </div>
                            )}
                        </div>

                        <p className="text-xs sm:text-sm font-bold text-amber-100 mt-1 truncate max-w-[260px] sm:max-w-[340px] font-heritage">
                            {isSpeaking 
                                ? (audioTitle || `Thuyết minh: ${selectedArtifact.name}`)
                                : `Bấm để nghe thuyết minh "${selectedArtifact.name}"`
                            }
                        </p>
                    </div>
                </div>

                {/* Các nút hành động phụ: Tốc độ đọc, Dừng, và Âm hưởng không gian */}
                <div className="flex items-center flex-wrap gap-2.5">
                    {/* Nút Dừng Thuyết Minh (nếu đang phát) */}
                    {isSpeaking && (
                        <button
                            type="button"
                            onClick={stopSpeech}
                            className="px-2.5 py-1.5 rounded-xl bg-[#1c130b] hover:bg-red-950/60 text-stone-300 hover:text-red-300 border border-amber-900/40 transition-all cursor-pointer text-xs flex items-center gap-1.5 shadow-xs"
                            title="Dừng thuyết minh"
                        >
                            <Square className="w-3.5 h-3.5 fill-current text-red-400" />
                            <span className="hidden sm:inline">Dừng</span>
                        </button>
                    )}

                    {/* Bộ chỉnh tốc độ giọng đọc */}
                    <div className="flex items-center bg-[#150e09] rounded-xl p-1 border border-amber-600/30 text-xs">
                        <span className="px-1.5 text-stone-400 text-[10px] hidden sm:inline">Tốc độ:</span>
                        {[0.8, 1.0, 1.2].map((spd) => (
                            <button
                                key={spd}
                                type="button"
                                onClick={() => changeSpeed(spd)}
                                className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                                    speechSpeed === spd
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-black shadow-xs'
                                        : 'text-stone-400 hover:text-amber-200'
                                }`}
                            >
                                {spd}x
                            </button>
                        ))}
                    </div>

                    <div className="w-[1px] h-6 bg-amber-500/20 hidden sm:block" />

                    {/* NÚT BẬT / TẮT ÂM HƯỞNG KHÔNG GIAN (SPATIAL AMBIENT CHIME & DRONE) */}
                    <div className="flex items-center gap-1.5 bg-[#150e09] px-3 py-1.5 rounded-xl border border-amber-600/30">
                        <button
                            type="button"
                            onClick={toggleAmbient}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                                isAmbientPlaying
                                    ? 'text-amber-300 hover:text-amber-200'
                                    : 'text-stone-400 hover:text-white'
                            }`}
                            title={isAmbientPlaying ? 'Tắt âm hưởng không gian' : 'Bật âm hưởng cổ phong không gian'}
                        >
                            {isAmbientPlaying ? (
                                <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                            ) : (
                                <VolumeX className="w-4 h-4" />
                            )}
                            <span className="text-[11px]">
                                {isAmbientPlaying ? 'Âm Không Gian: BẬT' : 'Âm Không Gian'}
                            </span>
                        </button>

                        {/* Chuông ngâm thủ công */}
                        {isAmbientPlaying && (
                            <button
                                type="button"
                                onClick={playChimeTone}
                                className="px-2 py-0.5 rounded-lg text-[10px] bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 cursor-pointer ml-1 transition-all active:scale-95"
                                title="Gõ chuông đồng ngân vang"
                            >
                                🔔 Gõ chuông
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* DÒNG 2: THANH PHỤ ĐỀ TRỰC TIẾP (LIVE SUBTITLE TICKER) KHI ĐANG THUYẾT MINH */}
            {isSpeaking && currentSentence && (
                <div className="bg-[#0e0906]/90 rounded-2xl p-4 border border-amber-500/35 space-y-2 animate-in fade-in duration-200 shadow-inner">
                    <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>Đang thuyết minh (Câu {sentenceIndex + 1}/{totalSentences}):</span>
                        </span>
                        <span className="font-mono text-amber-400">{progressPct}%</span>
                    </div>

                    {/* Câu văn hiển thị kiểu phụ đề điện ảnh */}
                    <p className="text-xs sm:text-sm text-amber-100 leading-relaxed font-serif italic selection:bg-amber-400 selection:text-stone-950">
                        “{currentSentence}”
                    </p>

                    {/* Thanh tiến trình siêu mỏng ánh vàng */}
                    <div className="w-full h-1 bg-stone-900 rounded-full overflow-hidden mt-1.5 border border-amber-900/30">
                        <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            )}

            {/* PHÍM TẮT NHANH ĐỌC HOTSPOT HIỆN TẠI NẾU ĐANG CHỌN */}
            {activeHotspot && !isSpeaking && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#18110b] border border-amber-500/35 text-xs text-amber-200 shadow-md">
                    <div className="flex items-center gap-2.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="font-bold truncate font-heritage text-amber-100">Đang soi: {activeHotspot.title}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => narrateHotspot(activeHotspot)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-[11px] flex-shrink-0 cursor-pointer shadow-md transition-all hover:scale-102"
                    >
                        🎧 Nghe điểm này
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExhibitionAudioGuideBar;
