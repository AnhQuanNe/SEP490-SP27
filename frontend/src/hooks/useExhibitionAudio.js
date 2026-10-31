import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useExhibitionAudio - Hook quản lý âm thanh không gian (Web Audio API)
 * và thuyết minh giọng đọc di sản (Web Speech Synthesis API).
 */
export const useExhibitionAudio = () => {
    // -------------------------------------------------------------
    // 1. QUẢN LÝ ÂM HƯỞNG KHÔNG GIAN (SPATIAL AMBIENT SOUND)
    // -------------------------------------------------------------
    const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
    const [ambientVolume, setAmbientVolumeState] = useState(0.28);
    
    const audioCtxRef = useRef(null);
    const masterGainRef = useRef(null);
    const oscillatorsRef = useRef([]);
    const chimeTimerRef = useRef(null);

    // Khởi tạo AudioContext khi người dùng tương tác lần đầu
    const initAudioContext = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtxRef.current = new AudioContextClass();
                const masterGain = audioCtxRef.current.createGain();
                masterGain.gain.setValueAtTime(ambientVolume, audioCtxRef.current.currentTime);
                masterGain.connect(audioCtxRef.current.destination);
                masterGainRef.current = masterGain;
            }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    }, [ambientVolume]);

    // Tạo âm vang chuông đồng / chuông khánh cổ ngâm (Bronze Chime Strike)
    const playChimeTone = useCallback(() => {
        if (!audioCtxRef.current || !isAmbientPlaying || !masterGainRef.current) return;
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;

        // Chuỗi tần số ngũ cung cổ Việt Nam (Hò Xự Xang Xê Cống / F, G, Bb, C, D)
        const chimeFreqs = [523.25, 659.25, 783.99, 1046.5, 1174.66];
        const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5); // Tiếng ngân chuông dài 4.5 giây

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGainRef.current);

        osc.start(now);
        osc.stop(now + 4.6);
    }, [isAmbientPlaying]);

    // Bắt đầu phát âm thanh không gian trầm mặc
    const startAmbient = useCallback(() => {
        initAudioContext();
        if (!audioCtxRef.current) return;

        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;

        // Xóa oscillators cũ nếu có
        oscillatorsRef.current.forEach(({ osc, gain }) => {
            try {
                gain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
                osc.stop(now + 0.35);
            } catch (_) {}
        });
        oscillatorsRef.current = [];

        // Hợp âm cộng hưởng thiền tịnh (Drone Chord: 110Hz - 165Hz - 220Hz - 330Hz)
        const frequencies = [110, 164.81, 220, 329.63];
        const droneGroup = [];

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(380, now);
        lowpass.connect(masterGainRef.current);

        frequencies.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();

            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            // Hiệu ứng thở nhẹ (Slow LFO Tremolo)
            const baseVol = 0.08 / (idx + 1);
            oscGain.gain.setValueAtTime(0.0001, now);
            oscGain.gain.linearRampToValueAtTime(baseVol, now + 2.5); // Fade in mượt mà 2.5 giây

            osc.connect(oscGain);
            oscGain.connect(lowpass);
            osc.start(now);

            droneGroup.push({ osc, gain: oscGain });
        });

        oscillatorsRef.current = droneGroup;
        setIsAmbientPlaying(true);

        // Chuông ngân ngẫu nhiên sau mỗi 10-14 giây
        if (chimeTimerRef.current) clearInterval(chimeTimerRef.current);
        chimeTimerRef.current = setInterval(() => {
            playChimeTone();
        }, 11000);

        // Đánh một tiếng chuông chào mừng mở màn
        setTimeout(() => playChimeTone(), 1200);
    }, [initAudioContext, playChimeTone]);

    // Dừng âm thanh không gian
    const stopAmbient = useCallback(() => {
        if (chimeTimerRef.current) {
            clearInterval(chimeTimerRef.current);
            chimeTimerRef.current = null;
        }

        if (audioCtxRef.current && oscillatorsRef.current.length > 0) {
            const now = audioCtxRef.current.currentTime;
            oscillatorsRef.current.forEach(({ osc, gain }) => {
                try {
                    gain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
                    osc.stop(now + 1.25);
                } catch (_) {}
            });
            oscillatorsRef.current = [];
        }
        setIsAmbientPlaying(false);
    }, []);

    const toggleAmbient = useCallback(() => {
        if (isAmbientPlaying) {
            stopAmbient();
        } else {
            startAmbient();
        }
    }, [isAmbientPlaying, startAmbient, stopAmbient]);

    const setAmbientVolume = useCallback((val) => {
        const clamped = Math.min(Math.max(0, val), 1);
        setAmbientVolumeState(clamped);
        if (masterGainRef.current && audioCtxRef.current) {
            masterGainRef.current.gain.linearRampToValueAtTime(
                clamped, 
                audioCtxRef.current.currentTime + 0.2
            );
        }
    }, []);

    // -------------------------------------------------------------
    // 2. QUẢN LÝ THUYẾT MINH GIỌNG ĐỌC DI SẢN (WEB SPEECH SYNTHESIS)
    // -------------------------------------------------------------
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [speechSpeed, setSpeechSpeed] = useState(1.0);
    const [currentSentence, setCurrentSentence] = useState('');
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const [totalSentences, setTotalSentences] = useState(0);
    const [audioTitle, setAudioTitle] = useState('');

    const sentencesQueueRef = useRef([]);
    const currentIdxRef = useRef(0);
    const currentSpeedRef = useRef(1.0);
    const isStoppingRef = useRef(false);

    // Cập nhật speed ref
    useEffect(() => {
        currentSpeedRef.current = speechSpeed;
    }, [speechSpeed]);

    // Tìm giọng đọc tiếng Việt tốt nhất của hệ thống
    const getBestVietnameseVoice = useCallback(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
        const voices = window.speechSynthesis.getVoices();
        // Ưu tiên giọng vi-VN chất lượng cao (Google, Microsoft, Apple)
        const viVoices = voices.filter(v => v.lang.startsWith('vi') || v.lang.includes('VIE'));
        if (viVoices.length > 0) {
            const naturalVoice = viVoices.find(v => 
                v.name.includes('Google') || 
                v.name.includes('Natural') || 
                v.name.includes('HoaiMy') || 
                v.name.includes('NamMinh') ||
                v.name.includes('Linh')
            );
            return naturalVoice || viVoices[0];
        }
        return voices[0] || null;
    }, []);

    // Đọc từng câu trong danh sách câu đã chuẩn hóa
    const speakSentenceAt = useCallback((index) => {
        if (!('speechSynthesis' in window)) return;
        const queue = sentencesQueueRef.current;
        if (index >= queue.length || isStoppingRef.current) {
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentSentence('');
            return;
        }

        const text = queue[index];
        currentIdxRef.current = index;
        setSentenceIndex(index);
        setCurrentSentence(text);
        setIsSpeaking(true);
        setIsPaused(false);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = currentSpeedRef.current;
        utterance.pitch = 1.0;

        const voice = getBestVietnameseVoice();
        if (voice) utterance.voice = voice;

        utterance.onend = () => {
            if (!isStoppingRef.current) {
                // Tự động chuyển câu tiếp theo
                speakSentenceAt(index + 1);
            }
        };

        utterance.onerror = (e) => {
            if (e.error !== 'canceled' && e.error !== 'interrupted') {
                console.warn('SpeechSynthesis lỗi nhẹ:', e);
            }
            if (!isStoppingRef.current && index + 1 < queue.length) {
                speakSentenceAt(index + 1);
            } else {
                setIsSpeaking(false);
            }
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }, [getBestVietnameseVoice]);

    // Bắt đầu đọc một kịch bản thuyết minh
    const startNarration = useCallback((title, fullScript) => {
        if (!('speechSynthesis' in window)) {
            alert('Trình duyệt của bạn chưa hỗ trợ Web Speech Synthesis API.');
            return;
        }

        isStoppingRef.current = false;
        window.speechSynthesis.cancel();

        // Tách văn bản thành các câu ngắn để theo dõi phụ đề và đọc tự nhiên
        const clean = fullScript.replace(/[\n\r]+/g, ' ').trim();
        const sentences = clean
            .split(/(?<=[.?!…])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 3);

        if (sentences.length === 0) return;

        sentencesQueueRef.current = sentences;
        setTotalSentences(sentences.length);
        setAudioTitle(title);
        speakSentenceAt(0);
    }, [speakSentenceAt]);

    // Thuyết minh toàn diện cho một bảo vật
    const narrateArtifact = useCallback((artifact) => {
        if (!artifact) return;
        const title = `Thuyết minh: ${artifact.name}`;

        // 1. ƯU TIÊN SỐ 1: Kịch bản thuyết minh độc quyền do Admin / Chuyên gia văn hóa biên soạn trong Database
        let script = (artifact.audioNarrationScript || artifact.audioScript || '').trim();

        // 2. ƯU TIÊN SỐ 2 (FALLBACK): Tự động lắp ghép động nếu Admin chưa soạn kịch bản riêng
        if (!script) {
            script = `Chào mừng bạn đến với không gian khảo cứu bảo vật "${artifact.name}". ${artifact.subtitle}. ` +
                `Niên đại thuộc ${artifact.era}, hiện diện tại ${artifact.location}. ` +
                `Trong chương trình ${artifact.textbookUnit}, tư liệu ghi nhận: ${artifact.textbookExcerpt}. ` +
                `Về mặt biểu tượng: ${artifact.fourLayers?.symbolic || ''}. ` +
                `Triết lý truyền đời nhắc nhở chúng ta: ${artifact.fourLayers?.philosophical || ''}.`;
        }
        
        startNarration(title, script);
    }, [startNarration]);

    // Thuyết minh nhanh một điểm khảo cứu (Hotspot)
    const narrateHotspot = useCallback((spot) => {
        if (!spot) return;
        const title = `Điểm khảo cứu: ${spot.title}`;

        // Ưu tiên kịch bản tùy chỉnh riêng của điểm ghim từ Database nếu có
        const script = (spot.audioScript || '').trim() || `Chi tiết ${spot.title}. Phân loại ${spot.tag || 'di sản'}. ${spot.detail}`;

        startNarration(title, script);
    }, [startNarration]);

    const pauseSpeech = useCallback(() => {
        if ('speechSynthesis' in window && isSpeaking) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, [isSpeaking]);

    const resumeSpeech = useCallback(() => {
        if ('speechSynthesis' in window && isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, [isPaused]);

    const stopSpeech = useCallback(() => {
        isStoppingRef.current = true;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentSentence('');
        setSentenceIndex(0);
    }, []);

    const changeSpeed = useCallback((newSpeed) => {
        setSpeechSpeed(newSpeed);
        // Nếu đang nói, cập nhật lại câu hiện tại với tốc độ mới
        if (isSpeaking && !isPaused && sentencesQueueRef.current.length > 0) {
            speakSentenceAt(currentIdxRef.current);
        }
    }, [isSpeaking, isPaused, speakSentenceAt]);

    // Dọn dẹp tài nguyên khi unmount
    useEffect(() => {
        return () => {
            stopAmbient();
            stopSpeech();
            if (audioCtxRef.current) {
                try {
                    audioCtxRef.current.close();
                } catch (_) {}
            }
        };
    }, [stopAmbient, stopSpeech]);

    return {
        // Ambient Sound API
        isAmbientPlaying,
        ambientVolume,
        toggleAmbient,
        setAmbientVolume,
        playChimeTone,

        // Audio Guide API
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
    };
};

export default useExhibitionAudio;
