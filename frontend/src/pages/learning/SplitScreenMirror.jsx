import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import learningService from '../../services/learning.service';
import {
    Video,
    Camera,
    Play,
    Pause,
    RotateCcw,
    CheckCircle2,
    Sparkles,
    Flame,
    ArrowLeft,
    Layers,
    ShieldAlert,
    Award,
    Loader2,
    ChevronRight,
    HandMetal,
    Star,
    X,
    Trophy
} from 'lucide-react';

const SplitScreenMirror = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, refreshProfile, isAuthenticated } = useAuth();

    const lessonIdFromUrl = searchParams.get('lessonId');
    const [currentLesson, setCurrentLesson] = useState(null);
    const [allLessons, setAllLessons] = useState([]);
    const [loadingLesson, setLoadingLesson] = useState(true);

    // Camera and playback state
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [webcamStream, setWebcamStream] = useState(null);
    const [mirrorMode, setMirrorMode] = useState(true);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [videoError, setVideoError] = useState(false);

    // Real AI MediaPipe State
    const [isAiLoaded, setIsAiLoaded] = useState(false);
    const [poseMatchScore, setPoseMatchScore] = useState(0);
    const [isPoseCorrect, setIsPoseCorrect] = useState(false);
    const [poseFeedback, setPoseFeedback] = useState('Bật webcam và đưa bàn tay lên ngang thái dương');
    const [holdProgress, setHoldProgress] = useState(0); // 0 to 100%
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completionResult, setCompletionResult] = useState(null);
    const [showCelebrationModal, setShowCelebrationModal] = useState(false);

    // Refs
    const userWebcamRef = useRef(null);
    const standardVideoRef = useRef(null);
    const canvasRef = useRef(null);
    const handsRef = useRef(null);
    const animFrameRef = useRef(null);
    const holdStartTimeRef = useRef(null);
    const hasCompletedRef = useRef(false);

    // Web Audio API Sound Chime
    const playSuccessChime = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            const now = audioCtx.currentTime;

            // Note 1 (E5)
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(659.25, now);
            gain1.gain.setValueAtTime(0.15, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            osc1.start(now);
            osc1.stop(now + 0.3);

            // Note 2 (A5)
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(880.0, now + 0.15);
            gain2.gain.setValueAtTime(0.2, now + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start(now + 0.15);
            osc2.stop(now + 0.7);
        } catch (e) {
            // Ignore audio policy errors
        }
    };

    // Load lesson details & tree list
    useEffect(() => {
        const loadLesson = async () => {
            try {
                setLoadingLesson(true);
                setShowCelebrationModal(false);
                hasCompletedRef.current = false;
                holdStartTimeRef.current = null;
                setHoldProgress(0);

                const treeRes = await learningService.getSkillTree();
                let flatList = [];
                if (treeRes.success && treeRes.data.stages) {
                    treeRes.data.stages.forEach((stg) => {
                        if (stg.lessons) flatList.push(...stg.lessons);
                    });
                    setAllLessons(flatList);
                }

                let targetId = lessonIdFromUrl;
                if (!targetId && flatList.length > 0) {
                    targetId = flatList[0]._id;
                }

                if (targetId) {
                    const res = await learningService.getLessonById(targetId);
                    if (res.success) {
                        setCurrentLesson(res.data.lesson);
                    }
                }
            } catch (error) {
                console.error('Lỗi tải bài học:', error);
            } finally {
                setLoadingLesson(false);
            }
        };

        loadLesson();
    }, [lessonIdFromUrl]);

    // Find next lesson in the roadmap
    const currentLessonIndex = allLessons.findIndex(
        (l) => l._id?.toString() === currentLesson?._id?.toString()
    );
    const nextLesson =
        currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
            ? allLessons[currentLessonIndex + 1]
            : null;

    // Handle complete lesson when 1.5s reached
    const handleSuccessCompletion = useCallback(async () => {
        if (hasCompletedRef.current || isSubmitting) return;
        hasCompletedRef.current = true;
        setIsSubmitting(true);

        // Play audio feedback
        playSuccessChime();

        try {
            if (currentLesson?._id && isAuthenticated) {
                const res = await learningService.completeLesson(currentLesson._id, {
                    score: Math.max(92, poseMatchScore),
                    holdTimeAchieved: 1.5,
                });
                if (res.success) {
                    setCompletionResult(res.data);
                    setShowCelebrationModal(true);
                    if (refreshProfile) refreshProfile();
                }
            } else {
                setCompletionResult({
                    xpGained: currentLesson?.xpReward || 50,
                    guestMode: true,
                });
                setShowCelebrationModal(true);
            }
        } catch (err) {
            console.error('Lỗi lưu kết quả bài học:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [currentLesson, isAuthenticated, poseMatchScore, isSubmitting, refreshProfile]);

    // RIGOROUS VSL GESTURE EVALUATION
    const evaluateGesture = useCallback(
        (landmarks) => {
            if (!landmarks || landmarks.length < 21) {
                setPoseMatchScore(0);
                setIsPoseCorrect(false);
                setPoseFeedback('Chưa phát hiện bàn tay trước camera');
                holdStartTimeRef.current = null;
                setHoldProgress(0);
                return;
            }

            // Key Landmarks:
            // 0: Wrist, 4: Thumb tip, 8: Index tip, 12: Middle tip, 16: Ring tip, 20: Pinky tip
            // 2: Thumb MCP, 6: Index PIP, 10: Middle PIP, 14: Ring PIP, 18: Pinky PIP
            const wrist = landmarks[0];
            const indexTip = landmarks[8];
            const middleTip = landmarks[12];
            const ringTip = landmarks[16];
            const pinkyTip = landmarks[20];

            const isThumbOpen = landmarks[4].y < landmarks[3].y;
            const isIndexOpen = indexTip.y < landmarks[6].y;
            const isMiddleOpen = middleTip.y < landmarks[10].y;
            const isRingOpen = ringTip.y < landmarks[14].y;
            const isPinkyOpen = pinkyTip.y < landmarks[18].y;

            const openFingersCount = [isThumbOpen, isIndexOpen, isMiddleOpen, isRingOpen, isPinkyOpen].filter(
                Boolean
            ).length;

            const concept = currentLesson?.signConcept?.toLowerCase() || 'xin chào';
            let match = false;
            let score = 0;
            let feedback = '';

            if (concept.includes('yêu') || concept.includes('ily')) {
                // ILY: Thumb + Index + Pinky OPEN; Middle + Ring CLOSED
                if (isIndexOpen && isPinkyOpen && !isMiddleOpen && !isRingOpen) {
                    match = true;
                    score = isThumbOpen ? 98 : 88;
                    feedback = '✨ Tuyệt vời! Thế tay ILY (Tôi yêu bạn) chuẩn xác!';
                } else {
                    score = Math.max(25, openFingersCount * 15);
                    feedback = 'Gập 2 ngón giữa lại, mở ngón trỏ và ngón út!';
                }
            } else if (concept.includes('cảm ơn')) {
                // Cảm ơn (Thank you): Tay chạm/đưa từ cằm ra trước
                const isNearChin = wrist.y < 0.65 && indexTip.y < 0.55;
                if (isNearChin && openFingersCount >= 4) {
                    match = true;
                    score = 94;
                    feedback = '✨ Tư thế chuẩn! Đầu ngón tay chạm cằm đưa nhẹ ra trước!';
                } else if (!isNearChin) {
                    score = 40;
                    feedback = '⚠️ Hãy đặt bàn tay ở vùng cằm rồi đưa nhẹ về phía trước!';
                } else {
                    score = openFingersCount * 18;
                    feedback = 'Mở phẳng bàn tay hướng từ cằm ra phía người đối diện.';
                }
            } else {
                // CỬ CHỈ "XIN CHÀO" CHUẨN VSL:
                // 1. Vị trí không gian: Bàn tay phải ở ngang vùng thái dương / mang tai / mắt (y < 0.5)
                // 2. Thế tay: 4 - 5 ngón mở tự nhiên, hướng lên trên (indexTip.y < wrist.y)
                const isHandAtHeadLevel = wrist.y < 0.58 && indexTip.y < 0.45;
                const isHandUpright = indexTip.y < wrist.y;

                if (!isHandAtHeadLevel) {
                    // Giơ tay nhưng ở vùng ngực, bụng hoặc quá thấp
                    match = false;
                    score = Math.min(45, openFingersCount * 10);
                    feedback = '⚠️ Nâng bàn tay lên ngang thái dương / mắt theo đúng cử chỉ "Xin chào"!';
                } else if (!isHandUpright) {
                    match = false;
                    score = 50;
                    feedback = '⚠️ Hướng các ngón tay lên trên, lòng bàn tay mở tự nhiên.';
                } else if (openFingersCount < 4) {
                    // Đúng vị trí trên đầu nhưng nắm đấm hoặc thiếu ngón
                    match = false;
                    score = openFingersCount * 18;
                    feedback = '⚠️ Hãy xòe mở 4 - 5 ngón tay thẳng cạnh thái dương để chào!';
                } else {
                    // ĐẠT CHUẨN CẢ VỊ TRÍ + THẾ TAY XIN CHÀO VSL!
                    match = true;
                    score = openFingersCount === 5 ? 98 : 92;
                    feedback = '✨ Rất chuẩn! Giữ yên tư thế cạnh thái dương 1.5 giây!';
                }
            }

            setPoseMatchScore(score);
            setIsPoseCorrect(match);
            setPoseFeedback(feedback);

            // REAL 1.5-SECOND HOLD-TIME VALIDATOR
            if (match && !hasCompletedRef.current) {
                if (!holdStartTimeRef.current) {
                    holdStartTimeRef.current = Date.now();
                }
                const elapsed = Date.now() - holdStartTimeRef.current;
                const progress = Math.min(100, Math.floor((elapsed / 1500) * 100));
                setHoldProgress(progress);

                if (elapsed >= 1500) {
                    handleSuccessCompletion();
                }
            } else {
                holdStartTimeRef.current = null;
                if (!hasCompletedRef.current) {
                    setHoldProgress(0);
                }
            }
        },
        [currentLesson, handleSuccessCompletion]
    );

    // INITIALIZE REAL MEDIAPIPE HANDS
    useEffect(() => {
        let isCancelled = false;

        const initMediaPipe = () => {
            if (!window.Hands) {
                setTimeout(initMediaPipe, 300);
                return;
            }

            try {
                const hands = new window.Hands({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
                });

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                hands.onResults((results) => {
                    if (isCancelled) return;
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    ctx.save();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                        const landmarks = results.multiHandLandmarks[0];

                        // Draw real skeletal bones and joints
                        if (window.drawConnectors && window.drawLandmarks) {
                            window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
                                color: '#10b981',
                                lineWidth: 4,
                            });
                            window.drawLandmarks(ctx, landmarks, {
                                color: '#f43f5e',
                                fillColor: '#ffffff',
                                lineWidth: 2,
                                radius: 5,
                            });
                        }

                        // Evaluate gesture geometry
                        evaluateGesture(landmarks);
                    } else {
                        evaluateGesture(null);
                    }
                    ctx.restore();
                });

                handsRef.current = hands;
                setIsAiLoaded(true);
            } catch (err) {
                console.error('Lỗi khởi tạo MediaPipe:', err);
            }
        };

        initMediaPipe();

        return () => {
            isCancelled = true;
            if (handsRef.current) {
                handsRef.current.close?.();
            }
        };
    }, [evaluateGesture]);

    // Send frames to MediaPipe continuously while camera is active
    useEffect(() => {
        let active = true;

        const processFrame = async () => {
            if (!active) return;
            if (
                cameraActive &&
                userWebcamRef.current &&
                userWebcamRef.current.readyState === 4 &&
                handsRef.current
            ) {
                try {
                    await handsRef.current.send({ image: userWebcamRef.current });
                } catch (e) {
                    // Frame skip
                }
            }
            if (active) {
                animFrameRef.current = requestAnimationFrame(processFrame);
            }
        };

        if (cameraActive) {
            animFrameRef.current = requestAnimationFrame(processFrame);
        }

        return () => {
            active = false;
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [cameraActive]);

    // Playback control for standard video
    useEffect(() => {
        if (standardVideoRef.current) {
            standardVideoRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    useEffect(() => {
        if (standardVideoRef.current) {
            if (isPlaying) {
                standardVideoRef.current.play().catch(() => {});
            } else {
                standardVideoRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Connect webcam stream
    useEffect(() => {
        if (userWebcamRef.current && webcamStream) {
            userWebcamRef.current.srcObject = webcamStream;
            userWebcamRef.current
                .play()
                .catch((e) => console.warn('Lỗi tự động phát stream webcam:', e));
        }
    }, [webcamStream, cameraActive]);

    // Toggle camera handler
    const toggleCamera = async () => {
        if (cameraActive) {
            if (webcamStream) {
                webcamStream.getTracks().forEach((track) => track.stop());
                setWebcamStream(null);
            }
            if (userWebcamRef.current) {
                userWebcamRef.current.srcObject = null;
            }
            setCameraActive(false);
            setCameraError(null);
            setPoseMatchScore(0);
            setIsPoseCorrect(false);
            setHoldProgress(0);
            holdStartTimeRef.current = null;
        } else {
            setCameraError(null);
            hasCompletedRef.current = false;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user',
                    },
                    audio: false,
                });
                setWebcamStream(stream);
                setCameraActive(true);
            } catch (err) {
                console.warn('Webcam permission error:', err);
                setCameraActive(false);
                setCameraError(
                    'Trình duyệt chưa được cấp quyền Camera. Hãy bấm vào biểu tượng Camera 🎥 trên thanh địa chỉ, chọn "Luôn cho phép" và bấm Thử lại.'
                );
            }
        }
    };

    // Reset exercise to try again
    const handleResetPractice = () => {
        hasCompletedRef.current = false;
        holdStartTimeRef.current = null;
        setHoldProgress(0);
        setCompletionResult(null);
        setShowCelebrationModal(false);
    };

    // Navigate to next lesson
    const handleGoToNextLesson = () => {
        if (nextLesson) {
            setShowCelebrationModal(false);
            navigate(`/learning/mirror?lessonId=${nextLesson._id}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <Link
                        to="/learning/skill-tree"
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
                        title="Về Cây kỹ năng"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Phòng Tập Gương Ảo AI (Split-Screen Studio)
                            </h1>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                UC06
                            </span>
                            {isAiLoaded && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-emerald-500" />
                                    MediaPipe AI Sẵn Sàng
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Bài học: <strong>{currentLesson?.title || 'Đang tải...'}</strong> • Vùng: {currentLesson?.region || 'Toàn quốc'}
                        </p>
                    </div>
                </div>

                {/* Gamification Status Bar */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                        <Flame className="w-4 h-4 fill-amber-500" />
                        <span>Streak: {user?.streak || 1} Ngày</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                        <Award className="w-4 h-4" />
                        <span>Phần thưởng: +{currentLesson?.xpReward || 50} XP</span>
                    </div>
                </div>
            </div>

            {/* CELEBRATION MODAL (KẾT THÚC QUÁ TRÌNH THÀNH CÔNG) */}
            {showCelebrationModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-6 relative animate-in zoom-in-95 duration-200">
                        
                        {/* Close button */}
                        <button
                            onClick={() => setShowCelebrationModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Animated Trophy Header */}
                        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Trophy className="w-10 h-10" />
                            </div>
                        </div>

                        {/* Star Rating */}
                        <div className="flex items-center justify-center gap-1.5 text-amber-400">
                            {[...Array(3)].map((_, i) => (
                                <Star key={i} className="w-6 h-6 fill-amber-400 drop-shadow" />
                            ))}
                        </div>

                        {/* Title and Praise */}
                        <div className="space-y-2">
                            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                Cử Chỉ Đạt Điểm Xuất Sắc
                            </span>
                            <h2 className="text-2xl font-black text-slate-900">
                                Đã Hoàn Thành Cử Chỉ "{currentLesson?.signConcept}"!
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                                MediaPipe AI đã xác thực bạn giữ đúng thế tay chuẩn liên tục trong 1.5 giây!
                            </p>
                        </div>

                        {/* Rewards Card */}
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase">Kinh nghiệm</p>
                                <p className="text-lg font-black text-indigo-600">
                                    +{completionResult?.xpGained || 50} XP
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase">Chuỗi ngày học</p>
                                <p className="text-lg font-black text-amber-600 flex items-center justify-center gap-1">
                                    <Flame className="w-4 h-4 fill-amber-500" />
                                    <span>{completionResult?.user?.streak || user?.streak || 1} Ngày</span>
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons to Finish the Flow */}
                        <div className="space-y-2.5 pt-2">
                            {nextLesson ? (
                                <button
                                    onClick={handleGoToNextLesson}
                                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-rose-500/25 hover:opacity-95 transition flex items-center justify-center gap-2"
                                >
                                    <span>Luyện Bài Tiếp Theo: "{nextLesson.signConcept}"</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <Link
                                    to="/learning/skill-tree"
                                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2"
                                >
                                    <span>Xem Cây Kỹ Năng</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            )}

                            <div className="flex gap-2">
                                <Link
                                    to="/learning/skill-tree"
                                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                                >
                                    Về Cây Kỹ Năng
                                </Link>
                                <button
                                    onClick={handleResetPractice}
                                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                                >
                                    Luyện lại bài này
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* MAIN SPLIT-SCREEN WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT SCREEN: Ground Truth Standard Video */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                            <h2 className="font-extrabold text-slate-800 text-sm sm:text-base">
                                Video Mẫu Chuẩn (Ground Truth)
                            </h2>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            {currentLesson?.category || 'Chào hỏi'} • {currentLesson?.difficulty || 'Cơ bản'}
                        </span>
                    </div>

                    {/* Standard Video Player Container */}
                    <div className="relative rounded-2xl bg-slate-950 aspect-video flex items-center justify-center overflow-hidden group shadow-inner">
                        {currentLesson?.standardVideoUrl && !videoError ? (
                            <>
                                <video
                                    ref={standardVideoRef}
                                    src={currentLesson.standardVideoUrl}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    onError={() => setVideoError(true)}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-300 border border-white/10 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                                    <span>MẪU CHUẨN GROUND TRUTH</span>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-black/80 via-transparent to-black/30">
                                <div className="w-16 h-16 rounded-2xl bg-rose-500/80 flex items-center justify-center text-white shadow-xl shadow-rose-500/30 mb-3 group-hover:scale-110 transition-transform">
                                    <Play className="w-7 h-7 fill-white ml-1" />
                                </div>
                                <p className="text-white font-extrabold text-base">
                                    Cử chỉ: "{currentLesson?.signConcept || 'Xin chào'}"
                                </p>
                                <p className="text-xs text-slate-300 max-w-sm mt-1">
                                    {currentLesson?.description || 'Đang tải hướng dẫn chi tiết...'}
                                </p>
                            </div>
                        )}

                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-white border border-white/10">
                            Tốc độ: {playbackSpeed}x
                        </div>
                    </div>

                    {/* Left Screen Control Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                            <span className="text-slate-500 px-2 font-medium">Tốc độ:</span>
                            {[0.5, 0.75, 1.0].map((spd) => (
                                <button
                                    key={spd}
                                    onClick={() => setPlaybackSpeed(spd)}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                                        playbackSpeed === spd
                                            ? 'bg-white text-rose-600 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {spd}x
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1.5"
                        >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{isPlaying ? 'Tạm dừng' : 'Phát lại'}</span>
                        </button>
                    </div>
                </div>

                {/* RIGHT SCREEN: REAL MEDIAPIPE AI STUDIO */}
                <div
                    className={`bg-white rounded-3xl p-5 border-2 shadow-sm flex flex-col justify-between space-y-4 transition-all duration-300 ${
                        isPoseCorrect
                            ? 'border-emerald-500 shadow-emerald-500/20 ring-4 ring-emerald-500/10'
                            : cameraActive
                            ? 'border-rose-400 shadow-rose-500/10'
                            : 'border-slate-200'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span
                                className={`w-3 h-3 rounded-full ${
                                    isPoseCorrect ? 'bg-emerald-500 animate-ping' : cameraActive ? 'bg-rose-500' : 'bg-slate-300'
                                }`}
                            ></span>
                            <h2 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                                Gương Ảo AI (MediaPipe Live Tracking)
                            </h2>
                        </div>

                        <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold transition-colors ${
                                isPoseCorrect
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                    : cameraActive
                                    ? 'bg-rose-50 text-rose-700 border border-rose-300'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {cameraActive ? `Khớp cử chỉ: ${poseMatchScore}%` : 'Chờ bật camera'}
                        </span>
                    </div>

                    {/* Camera / Mirror Viewport */}
                    <div className="relative rounded-2xl bg-slate-950 aspect-video flex items-center justify-center overflow-hidden shadow-inner">
                        {/* Live webcam video element */}
                        <video
                            ref={userWebcamRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${
                                cameraActive ? 'block' : 'hidden'
                            } ${mirrorMode ? '-scale-x-100' : ''}`}
                        />

                        {/* Real-time MediaPipe Skeleton Canvas Overlay */}
                        <canvas
                            ref={canvasRef}
                            width={640}
                            height={480}
                            className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-10 ${
                                mirrorMode ? '-scale-x-100' : ''
                            } ${cameraActive ? 'block' : 'hidden'}`}
                        />

                        {/* Real-time AI Feedback Pill on Top */}
                        {cameraActive && (
                            <div className="absolute top-3 inset-x-3 flex justify-between items-center z-20 pointer-events-none">
                                <span
                                    className={`px-3 py-1 rounded-xl text-xs font-bold shadow-md backdrop-blur-md border ${
                                        isPoseCorrect
                                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                                            : 'bg-rose-950/80 text-rose-200 border-rose-500/50'
                                    }`}
                                >
                                    {poseFeedback}
                                </span>

                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-black/60 text-slate-300 border border-white/10">
                                    Hold: {(holdProgress * 0.015).toFixed(1)}s / 1.5s
                                </span>
                            </div>
                        )}

                        {/* When camera is OFF */}
                        {!cameraActive && !cameraError && (
                            <div className="flex flex-col items-center justify-center text-center p-6 text-white space-y-3 z-10">
                                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 shadow-md">
                                    <Camera className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-200">Camera đang tắt</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Bật webcam để AI bắt 21 khớp ngón tay và tự động chấm điểm
                                    </p>
                                </div>
                                <button
                                    onClick={toggleCamera}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition flex items-center gap-2"
                                >
                                    <Camera className="w-4 h-4" />
                                    <span>Bật Webcam Luyện Tập</span>
                                </button>
                            </div>
                        )}

                        {/* When camera permission is blocked */}
                        {cameraError && (
                            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-center p-6 text-white space-y-3 z-20 animate-in fade-in">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-amber-200">Cần cấp quyền Camera</p>
                                    <p className="text-xs text-slate-300 max-w-sm mt-1 leading-relaxed">
                                        {cameraError}
                                    </p>
                                </div>
                                <button
                                    onClick={toggleCamera}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow"
                                >
                                    Thử Lại Mở Camera
                                </button>
                            </div>
                        )}

                        {/* Real-time Hold-time 1.5s Progress Bar */}
                        <div className="absolute bottom-3 inset-x-3 bg-black/75 backdrop-blur-md p-2.5 rounded-xl border border-white/10 space-y-1.5 z-20">
                            <div className="flex items-center justify-between text-[11px] text-white font-bold">
                                <span
                                    className={`flex items-center gap-1.5 ${
                                        isPoseCorrect ? 'text-emerald-400' : 'text-slate-400'
                                    }`}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {isPoseCorrect
                                        ? 'Đúng tư thế thái dương! Giữ yên 1.5 giây...'
                                        : 'Chờ đưa tay lên ngang thái dương...'}
                                </span>
                                <span className={isPoseCorrect ? 'text-emerald-400 font-mono' : 'text-slate-400 font-mono'}>
                                    {holdProgress}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-100 ${
                                        isPoseCorrect ? 'bg-emerald-400' : 'bg-slate-600'
                                    }`}
                                    style={{ width: `${holdProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Screen Control Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleCamera}
                                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                                    cameraActive
                                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                            >
                                <Camera className="w-3.5 h-3.5" />
                                <span>{cameraActive ? 'Tắt Webcam' : 'Bật Webcam'}</span>
                            </button>

                            <button
                                onClick={() => setMirrorMode(!mirrorMode)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                            >
                                Lật gương: {mirrorMode ? 'Bật' : 'Tắt'}
                            </button>
                        </div>

                        {/* Reset practice state button */}
                        <button
                            onClick={handleResetPractice}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1.5"
                            title="Luyện lại từ đầu"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Luyện lại</span>
                        </button>
                    </div>
                </div>

            </div>

            {/* PRACTICE INSTRUCTIONS & CHECKLIST */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <span>Quy Chuẩn Ký Hiệu "Xin Chào" Của Người Khiếm Thính</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <span className="font-bold text-rose-600 flex items-center gap-1.5">
                            <HandMetal className="w-4 h-4" /> 1. Vị Trí Không Gian Bắt Buộc
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                            Bàn tay phải nâng lên <strong>ngang tầm thái dương / mang tai</strong> (không để ở ngực hay bụng). AI sẽ từ chối chấm xanh nếu tay giơ quá thấp.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <span className="font-bold text-rose-600 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> 2. Thế Bàn Tay (Handshape)
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                            Các ngón tay mở tự nhiên, lòng bàn tay hướng ra phía trước hoặc hơi nghiêng vào thái dương một góc nhẹ nhàng.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <span className="font-bold text-rose-600 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" /> 3. Kết Thúc & Chuyển Bài
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                            Giữ yên 1.5 giây ➔ Chuông chúc mừng reo lên ➔ Bảng vinh danh hiện ra 3 Sao ⭐⭐⭐ kèm nút <strong>"Luyện Bài Tiếp Theo ➔"</strong>.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SplitScreenMirror;
