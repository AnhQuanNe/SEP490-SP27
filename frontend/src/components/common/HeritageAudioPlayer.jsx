import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, Loader2, Sparkles, Music, Mic2 } from 'lucide-react';
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
        // Hủy fetch mạng đang chờ
        if (this.abortController) {
            try {
                this.abortController.abort();
            } catch (_) {}
            this.abortController = null;
        }

        // Dọn dẹp audio đang phát
        if (this.activeAudio) {
            teardownAudio(this.activeAudio);
            this.activeAudio = null;
        }

        // Báo cho instance cũ cập nhật state UI về ngừng phát
        if (this.stopCallback && this.activeId !== callerId) {
            try {
                this.stopCallback();
            } catch (_) {}
        }

        if (callerId === null || this.activeId !== callerId) {
            this.stopCallback = null;
            this.activeId = null;
        }
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

/**
 * HeritageAudioPlayer - Trình ngâm thơ & đọc diễn cảm Ca dao Tục ngữ
 * Ứng dụng Microsoft Edge Neural TTS giọng Việt tự nhiên, truyền cảm.
 */
const HeritageAudioPlayer = ({
    text,
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

    const instanceIdRef = useRef(`player_${Math.random().toString(36).substring(2, 9)}`);
    const audioRef = useRef(null);
    const sessionRef = useRef(null);
    const isLoadingRef = useRef(false);
    const abortControllerRef = useRef(null);

    // Callback khi một player khác cướp quyền phát -> dừng player này lại
    const handleExternalStop = useCallback(() => {
        setIsPlaying(false);
        setIsLoading(false);
        isLoadingRef.current = false;
        setProgress(0);
        setCurrentTime(0);
        if (audioRef.current) {
            teardownAudio(audioRef.current);
            audioRef.current = null;
        }
    }, []);

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

    // Dọn dẹp âm thanh khi component unmount
    useEffect(() => {
        const id = instanceIdRef.current;
        return () => {
            teardownCurrentAudio();
            heritageAudioManager.clear(id);
        };
    }, [teardownCurrentAudio]);

    // Dừng phát và dọn dẹp nếu text prop bị thay đổi
    useEffect(() => {
        teardownCurrentAudio();
        setIsPlaying(false);
        setIsLoading(false);
        isLoadingRef.current = false;
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
    }, [text, teardownCurrentAudio]);

    const handleTogglePlay = async (e) => {
        e?.stopPropagation?.();
        if (!text || !text.trim()) return;

        // 1. Chống click dồn dập khi đang loading
        if (isLoadingRef.current) return;

        // 2. Nếu đang phát -> Tạm dừng
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }

        // 3. Nếu đã có audio sẵn của câu này và chỉ đang pause -> Resume tiếp
        if (audioRef.current && !audioRef.current.ended && audioRef.current.src) {
            try {
                isLoadingRef.current = true;
                setIsLoading(true);

                // Dừng bất kỳ player nào khác trước khi resume
                heritageAudioManager.stopCurrent(instanceIdRef.current);
                heritageAudioManager.register(instanceIdRef.current, audioRef.current, handleExternalStop);

                await audioRef.current.play();
                setIsPlaying(true);
                return;
            } catch (err) {
                console.warn('[AudioPlayer] Resume failed, reloading...', err);
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
            // Lấy URL âm thanh (dùng Blob POST an toàn, hỗ trợ AbortSignal & client cache)
            let audioSrc = '';
            try {
                audioSrc = await ttsService.getAudioBlobUrl(text, voice, mode, abortController.signal);
            } catch (fetchErr) {
                if (abortController.signal.aborted || sessionRef.current !== currentSessionId) {
                    return; // Đã bị hủy bởi người dùng hoặc phiên mới
                }
                console.warn('[AudioPlayer] Blob POST failed, trying Direct GET fallback...', fetchErr);
                audioSrc = ttsService.getDirectAudioUrl(text, voice, mode);
            }

            // Kiểm tra session còn hợp lệ không
            if (abortController.signal.aborted || sessionRef.current !== currentSessionId) {
                return;
            }

            const audio = new Audio(audioSrc);
            audioRef.current = audio;
            heritageAudioManager.register(instanceIdRef.current, audio, handleExternalStop);

            audio.ontimeupdate = () => {
                if (audio.duration && !isNaN(audio.duration)) {
                    setCurrentTime(audio.currentTime);
                    setDuration(audio.duration);
                    setProgress((audio.currentTime / audio.duration) * 100);
                }
            };

            audio.onended = () => {
                setIsPlaying(false);
                setProgress(0);
                setCurrentTime(0);
            };

            audio.onerror = (err) => {
                console.error('[AudioPlayer] Media playback error:', err);
                if (sessionRef.current === currentSessionId) {
                    setIsPlaying(false);
                    setIsLoading(false);
                    isLoadingRef.current = false;
                }
            };

            await audio.play();

            if (sessionRef.current === currentSessionId) {
                setIsPlaying(true);
            } else {
                teardownAudio(audio);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('[AudioPlayer] Play error:', err);
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
    // Biến thể 1: BAR (Thanh điều khiển Thính âm Di sản - Chuẩn Premium)
    // ==========================================
    if (variant === 'bar') {
        return (
            <div
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/95 via-orange-50/80 to-amber-100/70 dark:from-zinc-900/90 dark:via-zinc-900/95 dark:to-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 shadow-sm p-4 sm:p-5 transition-all ${className}`}
            >
                {/* Thanh tiến trình chạy theo audio */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-200/50 dark:bg-zinc-800">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-150"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Hàng 1: Nút Phát + Thông tin + Equalizer */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                        {/* Nút Play/Pause lớn */}
                        <button
                            type="button"
                            onClick={handleTogglePlay}
                            disabled={isLoading}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md flex-shrink-0 ${
                                isLoading
                                    ? 'bg-amber-100 text-amber-700 dark:bg-zinc-800 dark:text-amber-300 border border-amber-300 cursor-wait'
                                    : isPlaying
                                    ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-900/30 ring-4 ring-amber-400/30 scale-105'
                                    : 'bg-white hover:bg-amber-600 hover:text-white text-amber-900 dark:bg-zinc-800 dark:text-amber-200 dark:hover:bg-amber-600 dark:hover:text-white border border-amber-300/80 dark:border-amber-800'
                            }`}
                            title={isLoading ? 'Đang tạo giọng ngâm AI truyền cảm...' : isPlaying ? 'Tạm dừng ngâm' : 'Bấm để nghe giọng ngâm AI truyền cảm'}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="w-5 h-5" />
                            ) : (
                                <Play className="w-5 h-5 ml-0.5 fill-current" />
                            )}
                        </button>

                        {/* Tiêu đề & Trạng thái */}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-amber-950 dark:text-amber-100 tracking-tight font-heritage">
                                    {title || 'Diễn Ngâm Di Sản'}
                                </span>
                                {isLoading ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800 animate-pulse">
                                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                        Đang tạo giọng...
                                    </span>
                                ) : isPlaying ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500 text-white shadow-xs animate-pulse">
                                        Đang ngâm
                                    </span>
                                ) : null}
                            </div>

                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span className="font-medium text-amber-800 dark:text-amber-300">
                                    {voice === 'hoaimy' ? 'Hoài My (Nữ - Bắc Bộ)' : 'Nam Minh (Nam - Bắc Bộ)'}
                                </span>
                                <span>•</span>
                                <span>
                                    {mode === 'recite' ? 'Diễn ngâm truyền cảm' : mode === 'slow' ? 'Đọc chậm học tập' : 'Đọc diễn cảm'}
                                </span>
                                {isLoading ? (
                                    <>
                                        <span>•</span>
                                        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium animate-pulse">
                                            Đang nạp âm thanh...
                                        </span>
                                    </>
                                ) : duration > 0 ? (
                                    <>
                                        <span>•</span>
                                        <span className="font-mono text-[11px] text-zinc-500">
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </span>
                                    </>
                                ) : null}
                            </p>
                        </div>
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

                {/* Hàng 2: Bộ chọn Nút bấm tiện lợi */}
                <div className="mt-3.5 pt-3 border-t border-amber-200/70 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
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
                                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                                    voice === 'hoaimy'
                                        ? 'bg-amber-600 text-white shadow-xs font-semibold'
                                        : 'text-zinc-600 dark:text-zinc-300 hover:text-amber-900 dark:hover:text-white'
                                }`}
                            >
                                👩 Hoài My (Nữ)
                            </button>
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleVoiceChange('namminh')}
                                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                                    voice === 'namminh'
                                        ? 'bg-amber-600 text-white shadow-xs font-semibold'
                                        : 'text-zinc-600 dark:text-zinc-300 hover:text-amber-900 dark:hover:text-white'
                                }`}
                            >
                                👨 Nam Minh (Nam)
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
                                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                                    mode === 'recite'
                                        ? 'bg-amber-600 text-white shadow-xs font-semibold'
                                        : 'text-zinc-600 dark:text-zinc-300 hover:text-amber-900 dark:hover:text-white'
                                }`}
                            >
                                🎵 Diễn ngâm
                            </button>
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleModeChange('standard')}
                                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                                    mode === 'standard'
                                        ? 'bg-amber-600 text-white shadow-xs font-semibold'
                                        : 'text-zinc-600 dark:text-zinc-300 hover:text-amber-900 dark:hover:text-white'
                                }`}
                            >
                                📖 Đọc chuẩn
                            </button>
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleModeChange('slow')}
                                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                                    mode === 'slow'
                                        ? 'bg-amber-600 text-white shadow-xs font-semibold'
                                        : 'text-zinc-600 dark:text-zinc-300 hover:text-amber-900 dark:hover:text-white'
                                }`}
                            >
                                🐢 Đọc chậm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // Biến thể 2: INLINE (Nút bấm nhỏ gọn, nằm trong hàng banner)
    // ==========================================
    if (variant === 'inline') {
        return (
            <div className={`inline-flex items-center ${className}`}>
                <button
                    type="button"
                    onClick={handleTogglePlay}
                    disabled={isLoading}
                    title={isLoading ? 'Đang tạo giọng đọc...' : isPlaying ? 'Tạm dừng ngâm thơ' : 'Bấm để nghe ngâm câu thơ bằng giọng AI truyền cảm'}
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
                            <span>Đang tạo giọng...</span>
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
                title={isLoading ? 'Đang tạo giọng đọc AI...' : isPlaying ? 'Dừng đọc giọng AI' : 'Bấm để nghe giọng ngâm AI truyền cảm'}
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