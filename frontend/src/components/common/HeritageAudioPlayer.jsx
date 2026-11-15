import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Volume2,
    VolumeX,
    Pause,
    Play,
    Square,
    RotateCcw,
    RotateCw,
    Loader2,
    Sparkles,
    Music,
    Mic2,
    Gauge,
} from 'lucide-react';
import ttsService from '../../services/tts.service';

/**
 * Format số giây thành mm:ss
 */
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Hàm hủy sạch đối tượng Audio để giải phóng bộ nhớ và tránh ghost audio chạy ngầm
 */
function teardownAudio(audio) {
    if (!audio) return;
    try {
        audio.onplay = null;
        audio.onplaying = null;
        audio.ontimeupdate = null;
        audio.onended = null;
        audio.onerror = null;
        audio.oncanplay = null;
        audio.onloadedmetadata = null;
        audio.ondurationchange = null;
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
    } catch (_) {}
}

/**
 * Quản lý tập trung Singleton: Đảm bảo toàn hệ thống tại 1 thời điểm CHỈ CÓ DUY NHẤT 1 audio phát
 */
class HeritageAudioManager {
    constructor() {
        this.activeId = null;
        this.activeAudio = null;
        this.abortController = null;
        this.stopCallback = null;
    }

    stopCurrent(callerId = null) {
        // Nếu cùng 1 player đang thao tác (ví dụ: resume), không tự hủy audio của chính nó
        if (callerId !== null && this.activeId === callerId) {
            return;
        }

        // Hủy fetch mạng đang chờ
        if (this.abortController) {
            try {
                this.abortController.abort();
            } catch (_) {}
            this.abortController = null;
        }

        // Dọn dẹp audio đang phát của player trước
        if (this.activeAudio) {
            teardownAudio(this.activeAudio);
            this.activeAudio = null;
        }

        // Báo cho instance cũ cập nhật state UI về ngừng phát
        if (this.stopCallback) {
            try {
                this.stopCallback();
            } catch (_) {}
        }

        this.stopCallback = null;
        this.activeId = null;
    }

    register(id, audio, onStop, abortController = null) {
        this.activeId = id;
        this.activeAudio = audio;
        this.stopCallback = onStop;
        this.abortController = abortController;
    }

    clear(id) {
        if (this.activeId === id) {
            this.stopCurrent(null);
        }
    }
}

export const heritageAudioManager = new HeritageAudioManager();

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5];

/**
 * HeritageAudioPlayer - Trình ngâm thơ & đọc diễn cảm Ca dao Tục ngữ
 * Ứng dụng giọng đọc truyền cảm và phát bản thu âm nghệ sĩ chất lượng cao.
 * Hỗ trợ: Tua tới/lùi, thanh trượt thời gian, Tạm dừng / Tiếp tục, Dừng hẳn, Tốc độ phát, Tắt tiếng.
 */
const HeritageAudioPlayer = ({
    text,
    audioUrl = '',
    performer = '',
    title = '',
    variant = 'button',
    className = '',
    defaultVoice = 'hoaimy',
    defaultMode = 'recite',
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [voice, setVoice] = useState(defaultVoice);
    const [mode, setMode] = useState(defaultMode);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);

    const instanceIdRef = useRef(`player_${Math.random().toString(36).substring(2, 9)}`);
    const audioRef = useRef(null);
    const sessionRef = useRef(null);
    const isLoadingRef = useRef(false);
    const abortControllerRef = useRef(null);
    const isSeekingRef = useRef(false);

    // Dọn dẹp an toàn audio hiện tại của component này
    const teardownCurrentAudio = useCallback(() => {
        if (abortControllerRef.current) {
            try {
                abortControllerRef.current.abort();
            } catch (_) {}
            abortControllerRef.current = null;
        }
        if (audioRef.current) {
            teardownAudio(audioRef.current);
            audioRef.current = null;
        }
    }, []);

    // Callback khi một player khác cướp quyền phát -> dừng player này lại
    const handleExternalStop = useCallback(() => {
        setIsPlaying(false);
        setIsLoading(false);
        isLoadingRef.current = false;
        setProgress(0);
        setCurrentTime(0);
        teardownCurrentAudio();
    }, [teardownCurrentAudio]);

    // Dọn dẹp âm thanh khi component unmount
    useEffect(() => {
        const id = instanceIdRef.current;
        return () => {
            teardownCurrentAudio();
            heritageAudioManager.clear(id);
        };
    }, [teardownCurrentAudio]);

    // Nếu audioUrl có sẵn, nạp trước thời lượng (metadata) để thanh tua hiển thị chính xác ngay từ đầu
    useEffect(() => {
        if (!audioUrl) return;
        let probe = new Audio(audioUrl);
        probe.preload = 'metadata';

        const onMetadata = () => {
            if (probe.duration && !isNaN(probe.duration) && isFinite(probe.duration)) {
                setDuration(probe.duration);
            }
        };

        probe.addEventListener('loadedmetadata', onMetadata);
        return () => {
            probe.removeEventListener('loadedmetadata', onMetadata);
            probe.removeAttribute('src');
            probe.load();
            probe = null;
        };
    }, [audioUrl]);

    // Dừng phát và dọn dẹp nếu text hoặc audioUrl prop bị thay đổi
    useEffect(() => {
        teardownCurrentAudio();
        setIsPlaying(false);
        setIsLoading(false);
        isLoadingRef.current = false;
        setProgress(0);
        setCurrentTime(0);
    }, [text, audioUrl, teardownCurrentAudio]);

    // Thiết lập các sự kiện lắng nghe cho thẻ Audio
    const attachAudioListeners = (audio, currentSessionId) => {
        audio.onloadedmetadata = () => {
            if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
        };

        audio.ondurationchange = () => {
            if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
        };

        audio.ontimeupdate = () => {
            if (!isSeekingRef.current && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                setCurrentTime(audio.currentTime);
                setDuration(audio.duration);
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        audio.onended = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
            }
        };

        audio.onerror = (err) => {
            console.error('[AudioPlayer] Lỗi phát âm thanh:', err);
            if (sessionRef.current === currentSessionId) {
                setIsPlaying(false);
                setIsLoading(false);
                isLoadingRef.current = false;
            }
        };
    };

    // Phát / Tạm dừng
    const handleTogglePlay = async (e) => {
        e?.stopPropagation?.();
        if ((!text || !text.trim()) && !audioUrl) return;

        // 1. Chống click dồn dập khi đang loading
        if (isLoadingRef.current) return;

        // 2. Nếu đang phát -> Tạm dừng (giữ nguyên currentTime để người dùng nghe tiếp)
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }

        // 3. Nếu đã có audio sẵn và đang tạm dừng -> Tiếp tục phát (Resume)
        if (audioRef.current && !audioRef.current.ended && audioRef.current.src) {
            try {
                isLoadingRef.current = true;
                setIsLoading(true);

                // Đảm bảo không player nào khác đang phát đồng thời
                heritageAudioManager.stopCurrent(instanceIdRef.current);
                heritageAudioManager.register(instanceIdRef.current, audioRef.current, handleExternalStop);

                audioRef.current.playbackRate = playbackRate;
                audioRef.current.muted = isMuted;

                await audioRef.current.play();
                setIsPlaying(true);
                return;
            } catch (err) {
                console.warn('[AudioPlayer] Tiếp tục phát thất bại, đang nạp lại...', err);
                teardownCurrentAudio();
            } finally {
                isLoadingRef.current = false;
                setIsLoading(false);
            }
        }

        // 4. Bắt đầu phiên tải và phát mới
        const currentSessionId = Symbol('audio-session');
        sessionRef.current = currentSessionId;

        // Dừng âm thanh của bất kỳ player nào khác trên toàn ứng dụng
        heritageAudioManager.stopCurrent(instanceIdRef.current);
        teardownCurrentAudio();

        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        heritageAudioManager.register(instanceIdRef.current, null, handleExternalStop, abortController);

        isLoadingRef.current = true;
        setIsLoading(true);

        try {
            // Lấy URL âm thanh: Ưu tiên file thu âm nghệ sĩ nếu có
            let audioSrc = '';
            if (audioUrl) {
                audioSrc = audioUrl;
            } else {
                try {
                    audioSrc = await ttsService.getAudioBlobUrl(text, voice, mode, abortController.signal);
                } catch (fetchErr) {
                    if (abortController.signal.aborted || sessionRef.current !== currentSessionId) {
                        return;
                    }
                    console.warn('[AudioPlayer] Fetch Blob thất bại, dùng fallback trực tiếp...', fetchErr);
                    audioSrc = ttsService.getDirectAudioUrl(text, voice, mode);
                }
            }

            if (abortController.signal.aborted || sessionRef.current !== currentSessionId) {
                return;
            }

            const audio = new Audio(audioSrc);
            audio.preload = 'auto';
            audio.playbackRate = playbackRate;
            audio.muted = isMuted;
            audioRef.current = audio;
            heritageAudioManager.register(instanceIdRef.current, audio, handleExternalStop);

            attachAudioListeners(audio, currentSessionId);

            // Nếu người dùng đã chọn điểm tua trước khi bấm play
            if (currentTime > 0) {
                audio.currentTime = currentTime;
            }

            await audio.play();

            if (sessionRef.current === currentSessionId) {
                setIsPlaying(true);
            } else {
                teardownAudio(audio);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('[AudioPlayer] Lỗi khởi tạo âm thanh:', err);
            }
            if (sessionRef.current === currentSessionId) {
                setIsPlaying(false);
            }
        } finally {
            if (sessionRef.current === currentSessionId) {
                isLoadingRef.current = false;
                setIsLoading(false);
            }
        }
    };

    // Dừng hẳn âm thanh (Reset về đầu 0:00)
    const handleStop = (e) => {
        e?.stopPropagation?.();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
    };

    // Tua âm thanh khi người dùng đang kéo thanh trượt (hiển thị thời gian tức thì, không giật âm thanh)
    const handleSliderInput = (e) => {
        isSeekingRef.current = true;
        const val = parseFloat(e.target.value);
        setCurrentTime(val);
        if (duration > 0) {
            setProgress((val / duration) * 100);
        }
    };

    // Khi người dùng thả chuột hoặc bấm vào 1 điểm trên thanh trượt -> Cập nhật vị trí audio
    const handleSliderChange = (e) => {
        const val = parseFloat(e.target.value);
        isSeekingRef.current = false;
        setCurrentTime(val);
        if (duration > 0) {
            setProgress((val / duration) * 100);
        }
        if (audioRef.current) {
            audioRef.current.currentTime = val;
        }
    };

    // Tua lùi X giây
    const handleSkipBackward = (seconds = 5) => {
        const target = Math.max(0, currentTime - seconds);
        setCurrentTime(target);
        if (duration > 0) {
            setProgress((target / duration) * 100);
        }
        if (audioRef.current) {
            audioRef.current.currentTime = target;
        }
    };

    // Tua tới X giây
    const handleSkipForward = (seconds = 5) => {
        const maxDur = duration || 0;
        const target = maxDur > 0 ? Math.min(maxDur, currentTime + seconds) : currentTime + seconds;
        setCurrentTime(target);
        if (maxDur > 0) {
            setProgress((target / maxDur) * 100);
        }
        if (audioRef.current) {
            audioRef.current.currentTime = target;
        }
    };

    // Đổi tốc độ phát
    const handleToggleSpeed = (e) => {
        e?.stopPropagation?.();
        const nextIndex = (SPEED_OPTIONS.indexOf(playbackRate) + 1) % SPEED_OPTIONS.length;
        const nextRate = SPEED_OPTIONS[nextIndex];
        setPlaybackRate(nextRate);
        if (audioRef.current) {
            audioRef.current.playbackRate = nextRate;
        }
    };

    // Bật / Tắt tiếng
    const handleToggleMute = (e) => {
        e?.stopPropagation?.();
        const nextMute = !isMuted;
        setIsMuted(nextMute);
        if (audioRef.current) {
            audioRef.current.muted = nextMute;
        }
    };

    // Thay đổi giọng đọc
    const handleVoiceChange = (newVoice) => {
        if (voice === newVoice) return;
        teardownCurrentAudio();
        setIsPlaying(false);
        setIsLoading(false);
        isLoadingRef.current = false;
        setProgress(0);
        setCurrentTime(0);
        setVoice(newVoice);
    };

    // Thay đổi phong cách ngâm
    const handleModeChange = (newMode) => {
        if (mode === newMode) return;
        teardownCurrentAudio();
        setIsPlaying(false);
        setIsLoading(false);
        isLoadingRef.current = false;
        setProgress(0);
        setCurrentTime(0);
        setMode(newMode);
    };

    // ==========================================
    // Biến thể 1: BAR (Thanh điều khiển Thính âm Di sản đầy đủ tính năng)
    // ==========================================
    if (variant === 'bar') {
        return (
            <div
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/95 via-orange-50/80 to-amber-100/70 dark:from-zinc-900/90 dark:via-zinc-900/95 dark:to-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 shadow-sm p-4 sm:p-5 transition-all ${className}`}
            >
                {/* Hàng 1: Tiêu đề + Thông tin nghệ sĩ / giọng ngâm + Sóng âm thanh */}
                <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-amber-950 dark:text-amber-100 tracking-tight font-heritage">
                                {title || 'Diễn Ngâm Di Sản'}
                            </span>
                            {isLoading ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800 animate-pulse">
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                    Đang chuẩn bị âm thanh...
                                </span>
                            ) : isPlaying ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-600 text-white shadow-xs animate-pulse">
                                    Đang ngâm
                                </span>
                            ) : currentTime > 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                    Tạm dừng
                                </span>
                            ) : null}
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            {audioUrl ? (
                                <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    {performer ? `${performer} (Bản thu âm nghệ sĩ)` : 'Bản thu âm nghệ sĩ chất lượng cao'}
                                </span>
                            ) : (
                                <>
                                    <span className="font-medium text-amber-800 dark:text-amber-300">
                                        {voice === 'hoaimy' ? 'Hoài My (Nữ - Bắc Bộ)' : 'Nam Minh (Nam - Bắc Bộ)'}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {mode === 'recite' ? 'Diễn ngâm truyền cảm' : mode === 'slow' ? 'Đọc chậm học tập' : 'Đọc chuẩn'}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>

                    {/* Sóng âm thanh nhảy múa khi đang phát */}
                    {isPlaying && (
                        <div className="hidden sm:flex items-end gap-1 h-6 px-3 py-1.5 bg-amber-100/70 dark:bg-amber-950/60 rounded-full border border-amber-300/60 dark:border-amber-800 flex-shrink-0">
                            <span className="w-1 h-3 bg-amber-600 dark:bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-6 bg-amber-600 dark:bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-4 bg-amber-600 dark:bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="w-1 h-5 bg-amber-600 dark:bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                            <span className="w-1 h-2 bg-amber-600 dark:bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                        </div>
                    )}
                </div>

                {/* Hàng 2: Thanh Tua Tiến Trình (Interactive Timeline Scrubber) */}
                <div className="my-2.5 flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-amber-950 dark:text-amber-200 min-w-[36px] text-right select-none">
                        {formatTime(currentTime)}
                    </span>

                    <div className="relative flex-1 py-2 group cursor-pointer">
                        {/* Rãnh chạy tiến trình */}
                        <div className="w-full h-2 bg-amber-200/80 dark:bg-zinc-700 rounded-full overflow-hidden transition-all group-hover:h-2.5 shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full transition-all duration-75"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Điểm nút điều hướng (Scrubber Knob) */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-amber-600 rounded-full shadow-md transition-transform scale-90 group-hover:scale-125 pointer-events-none"
                            style={{ left: `${Math.min(99, Math.max(1, progress))}%` }}
                        />

                        {/* Input range ẩn phủ toàn bộ để hỗ trợ kéo chuột / chạm màn hình cực nhạy */}
                        <input
                            type="range"
                            min="0"
                            max={duration > 0 ? duration : 100}
                            step="0.1"
                            value={currentTime}
                            disabled={isLoading || (duration === 0 && !audioRef.current)}
                            onInput={handleSliderInput}
                            onChange={handleSliderChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            title="Kéo hoặc nhấn để tua âm thanh đến đoạn mong muốn"
                        />
                    </div>

                    <span className="font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400 min-w-[36px] select-none">
                        {formatTime(duration)}
                    </span>
                </div>

                {/* Hàng 3: Hộp nút điều khiển (Tua lùi - Phát/Dừng - Dừng hẳn - Tua tới - Tốc độ - Âm lượng) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/70 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        {/* Nút Tua Lùi 5 giây */}
                        <button
                            type="button"
                            onClick={() => handleSkipBackward(5)}
                            disabled={isLoading || (currentTime <= 0 && !isPlaying)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/90 hover:bg-amber-100 text-amber-900 dark:bg-zinc-800 dark:text-amber-200 dark:hover:bg-zinc-700 border border-amber-300/80 dark:border-amber-800 shadow-xs transition-all flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
                            title="Lùi lại 5 giây"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="text-[11px]">-5s</span>
                        </button>

                        {/* Nút Play / Pause chính */}
                        <button
                            type="button"
                            onClick={handleTogglePlay}
                            disabled={isLoading}
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md flex-shrink-0 ${
                                isLoading
                                    ? 'bg-amber-100 text-amber-700 dark:bg-zinc-800 dark:text-amber-300 border border-amber-300 cursor-wait'
                                    : isPlaying
                                    ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-900/30 ring-4 ring-amber-400/30 scale-105'
                                    : 'bg-white hover:bg-amber-600 hover:text-white text-amber-900 dark:bg-zinc-800 dark:text-amber-200 dark:hover:bg-amber-600 dark:hover:text-white border border-amber-300/80 dark:border-amber-800'
                            }`}
                            title={isLoading ? 'Đang chuẩn bị âm thanh...' : isPlaying ? 'Tạm dừng diễn ngâm' : 'Bấm để lắng nghe diễn ngâm'}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="w-5 h-5" />
                            ) : (
                                <Play className="w-5 h-5 ml-0.5 fill-current" />
                            )}
                        </button>

                        {/* Nút Dừng Hẳn (Stop) */}
                        <button
                            type="button"
                            onClick={handleStop}
                            disabled={isLoading || (!isPlaying && currentTime === 0)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/90 hover:bg-rose-50 text-slate-700 hover:text-rose-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 border border-amber-300/80 dark:border-amber-800 shadow-xs transition-all flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
                            title="Dừng hẳn (Về 0:00)"
                        >
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span className="hidden sm:inline text-[11px]">Dừng</span>
                        </button>

                        {/* Nút Tua Tới 5 giây */}
                        <button
                            type="button"
                            onClick={() => handleSkipForward(5)}
                            disabled={isLoading || (duration > 0 && currentTime >= duration)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/90 hover:bg-amber-100 text-amber-900 dark:bg-zinc-800 dark:text-amber-200 dark:hover:bg-zinc-700 border border-amber-300/80 dark:border-amber-800 shadow-xs transition-all flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
                            title="Tua tới 5 giây"
                        >
                            <span className="text-[11px]">+5s</span>
                            <RotateCw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Nhóm công cụ phụ: Tốc độ phát & Bật/Tắt tiếng */}
                    <div className="flex items-center gap-1.5">
                        {/* Nút đổi tốc độ phát (0.75x, 1.0x, 1.25x, 1.5x) */}
                        <button
                            type="button"
                            onClick={handleToggleSpeed}
                            className="px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-amber-100 text-amber-900 dark:bg-zinc-800 dark:text-amber-200 border border-amber-200/80 dark:border-zinc-700 shadow-xs text-xs font-semibold transition-all flex items-center gap-1"
                            title={`Tốc độ phát: ${playbackRate}x (Nhấn để chuyển tốc độ)`}
                        >
                            <Gauge className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                            <span>{playbackRate}x</span>
                        </button>

                        {/* Nút Bật / Tắt tiếng */}
                        <button
                            type="button"
                            onClick={handleToggleMute}
                            className={`p-2 rounded-xl border transition-all ${
                                isMuted
                                    ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                                    : 'bg-white/80 hover:bg-amber-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-amber-200/80 dark:border-zinc-700'
                            }`}
                            title={isMuted ? 'Bật lại âm thanh' : 'Tắt tiếng'}
                        >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Hàng 4: Bộ chọn Giọng đọc & Điệu ngâm (chỉ hiển thị khi dùng giọng tổng hợp) */}
                {!audioUrl && (
                    <div className="mt-3 pt-2.5 border-t border-amber-200/50 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        {/* Chọn giọng đọc */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                <Mic2 className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                Giọng:
                            </span>
                            <div className="inline-flex rounded-xl p-0.5 bg-white/80 dark:bg-zinc-800 border border-amber-200/80 dark:border-zinc-700 shadow-xs">
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleVoiceChange('hoaimy')}
                                    className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                                        voice === 'hoaimy'
                                            ? 'bg-amber-600 text-white shadow-xs font-semibold'
                                            : 'text-zinc-600 dark:text-zinc-300 hover:text-amber-900 dark:hover:text-white'
                                    }`}
                                >
                                    Hoài My (Nữ)
                                </button>
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleVoiceChange('namminh')}
                                    className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                                        voice === 'namminh'
                                            ? 'bg-amber-600 text-white shadow-xs font-semibold'
                                            : 'text-zinc-600 dark:text-zinc-300 hover:text-amber-900 dark:hover:text-white'
                                    }`}
                                >
                                    Nam Minh (Nam)
                                </button>
                            </div>
                        </div>

                        {/* Chọn phong cách ngâm */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                <Music className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                Điệu:
                            </span>
                            <div className="inline-flex rounded-xl p-0.5 bg-white/80 dark:bg-zinc-800 border border-amber-200/80 dark:border-zinc-700 shadow-xs">
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleModeChange('recite')}
                                    className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                                        mode === 'recite'
                                            ? 'bg-amber-600 text-white shadow-xs font-semibold'
                                            : 'text-zinc-600 dark:text-zinc-300 hover:text-amber-900 dark:hover:text-white'
                                    }`}
                                >
                                    Diễn ngâm
                                </button>
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleModeChange('standard')}
                                    className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                                        mode === 'standard'
                                            ? 'bg-amber-600 text-white shadow-xs font-semibold'
                                            : 'text-zinc-600 dark:text-zinc-300 hover:text-amber-900 dark:hover:text-white'
                                    }`}
                                >
                                    Đọc chuẩn
                                </button>
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleModeChange('slow')}
                                    className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                                        mode === 'slow'
                                            ? 'bg-amber-600 text-white shadow-xs font-semibold'
                                            : 'text-zinc-600 dark:text-zinc-300 hover:text-amber-900 dark:hover:text-white'
                                    }`}
                                >
                                    Đọc chậm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // Biến thể 2: INLINE (Nút bấm nhỏ gọn trong hàng banner)
    // ==========================================
    if (variant === 'inline') {
        return (
            <div className={`inline-flex items-center ${className}`}>
                <button
                    type="button"
                    onClick={handleTogglePlay}
                    disabled={isLoading}
                    title={isLoading ? 'Đang chuẩn bị âm thanh...' : isPlaying ? 'Tạm dừng diễn ngâm' : 'Bấm để lắng nghe diễn ngâm'}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${
                        isLoading
                            ? 'bg-amber-600/70 text-white cursor-wait'
                            : isPlaying
                            ? 'bg-amber-600 text-white ring-2 ring-amber-400/50 shadow-amber-900/30 animate-pulse'
                            : 'bg-white/15 hover:bg-white/25 text-amber-200 border border-amber-300/30 backdrop-blur-xs'
                    }`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang chuẩn bị...</span>
                        </>
                    ) : isPlaying ? (
                        <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Đang ngâm...</span>
                        </>
                    ) : (
                        <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Nghe ngâm thơ</span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    // ==========================================
    // Biến thể 3: BUTTON (Icon loa tròn nhỏ ở Header & Card)
    // ==========================================
    return (
        <div className={`relative inline-block ${className}`}>
            <button
                type="button"
                onClick={handleTogglePlay}
                disabled={isLoading}
                title={isLoading ? 'Đang chuẩn bị âm thanh...' : isPlaying ? 'Tạm dừng diễn ngâm' : 'Bấm để lắng nghe diễn ngâm'}
                className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                    isLoading
                        ? 'bg-amber-50 border-amber-300 text-amber-600 cursor-wait'
                        : isPlaying
                        ? 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-400/40 animate-pulse'
                        : 'bg-white hover:bg-amber-50 border-slate-200 text-slate-600 hover:text-amber-800 hover:border-amber-300 shadow-2xs'
                }`}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                ) : isPlaying ? (
                    <VolumeX className="w-4 h-4" />
                ) : (
                    <Volume2 className="w-4 h-4" />
                )}
            </button>
        </div>
    );
};

export default HeritageAudioPlayer;
