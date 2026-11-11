import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import gamificationService from '../services/gamification.service';
import { SERVER_URL } from '../config/env';
import {
    Swords,
    Trophy,
    RotateCcw,
    Clock,
    Sparkles,
    Loader2,
    Crown,
    X,
    LogIn,
    UserPlus,
    Lock,
    Users,
    Copy,
    Check,
    CheckCircle2,
    XCircle,
    BookOpen,
    ArrowRight,
    Bot,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const BOT_DIFFICULTY_OPTIONS = [
    {
        id: 'easy',
        label: 'Dễ (Nhập Môn)',
        badge: '🌱',
        accuracyText: 'Độ chuẩn ~55%',
        speedText: 'Phản xạ 4.5–7.5s',
        questionText: 'Bộ câu hỏi cơ bản',
    },
    {
        id: 'medium',
        label: 'Trung Bình (Cử Nhân)',
        badge: '🏮',
        accuracyText: 'Độ chuẩn ~78%',
        speedText: 'Phản xạ 3.0–5.5s',
        questionText: 'Bộ câu hỏi tổng hợp',
    },
    {
        id: 'hard',
        label: 'Khó (Trạng Nguyên)',
        badge: '👑',
        accuracyText: 'Độ chuẩn ~92%',
        speedText: 'Phản xạ 1.8–3.5s',
        questionText: 'Bộ câu hỏi chuyên sâu',
    },
];

const QUESTION_COUNT_OPTIONS = [
    { count: 5, label: '5 Câu', desc: 'Tốc chiến' },
    { count: 10, label: '10 Câu', desc: 'Tiêu chuẩn' },
    { count: 15, label: '15 Câu', desc: 'Trường thi' },
];

const HeritageArena = () => {
    const { user, isAuthenticated, getAvatarUrl } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const currentUserId = user?._id || user?.id;

    // Match status state
    // 'IDLE' | 'SEARCHING' | 'WAITING_ROOM' | 'COUNTDOWN' | 'PLAYING' | 'ROUND_RESULT' | 'FINISHED'
    const [gameState, setGameState] = useState('IDLE');
    const [lobbyTab, setLobbyTab] = useState('QUICK'); // 'QUICK' | 'CUSTOM'
    const [botDifficulty, setBotDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
    const [questionCount, setQuestionCount] = useState(5); // 5 | 10 | 15
    const [matchData, setMatchData] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasAnsweredRound, setHasAnsweredRound] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [countdown, setCountdown] = useState(3);
    const [reviewCountdown, setReviewCountdown] = useState(3);
    const [searchTime, setSearchTime] = useState(0);
    const [history, setHistory] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [forfeitNotice, setForfeitNotice] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Private Room states
    const [roomCode, setRoomCode] = useState('');
    const [inputRoomCode, setInputRoomCode] = useState('');
    const [copiedCode, setCopiedCode] = useState(false);
    const [showDetailedReview, setShowDetailedReview] = useState(true);

    // Socket & Timer references
    const socketRef = useRef(null);
    const timerRef = useRef(null);
    const searchTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const reviewIntervalRef = useRef(null);
    const roundStartRef = useRef(Date.now());
    const matchDataRef = useRef(null);
    const hasAnsweredRoundRef = useRef(false);
    const currentQuestionIndexRef = useRef(-1);

    // Đồng bộ refs với state
    useEffect(() => {
        matchDataRef.current = matchData;
    }, [matchData]);

    useEffect(() => {
        hasAnsweredRoundRef.current = hasAnsweredRound;
    }, [hasAnsweredRound]);

    // Khởi tạo Socket.io client
    useEffect(() => {
        if (!isAuthenticated) return;

        const socketUrl = SERVER_URL ? `${SERVER_URL}/duel` : '/duel';
        const socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Duel Socket] Đã kết nối phòng thi đấu Thi Đình');
        });

        socket.on('duel:waiting', () => {
            setErrorMessage(null);
            setGameState('SEARCHING');
        });

        socket.on('duel:room_created', (data) => {
            setErrorMessage(null);
            setForfeitNotice(null);
            setRoomCode(data.roomCode);
            setMatchData(data.match);
            setGameState('WAITING_ROOM');
        });

        socket.on('duel:matched', (data) => {
            clearAllTimers();
            setErrorMessage(null);
            setForfeitNotice(null);
            setSelectedAnswer(null);
            setHasAnsweredRound(false);
            hasAnsweredRoundRef.current = false;
            currentQuestionIndexRef.current = data.match?.currentQuestionIndex ?? 0;
            setMatchData(data.match);
            setGameState('COUNTDOWN');
            startPreMatchCountdown(data.countdownSeconds || 3);
        });

        socket.on('duel:countdown', (data) => {
            startPreMatchCountdown(data.countdownSeconds || 3);
        });

        socket.on('duel:round_start', (data) => {
            clearAllTimers();
            setErrorMessage(null);
            setMatchData(data.match);
            setGameState('PLAYING');
            currentQuestionIndexRef.current = data.match?.currentQuestionIndex ?? 0;
            resetRoundState(data.match);
        });

        socket.on('duel:in_match', (data) => {
            clearAllTimers();
            setErrorMessage(null);
            const nextMatch = data.match;
            setMatchData(nextMatch);
            currentQuestionIndexRef.current = nextMatch?.currentQuestionIndex ?? 0;
            syncMyAnswerState(nextMatch);

            const status = nextMatch.status;
            if (status === 'COUNTDOWN') {
                setGameState('COUNTDOWN');
                startPreMatchCountdown(3);
            } else if (status === 'ROUND_COMPLETED') {
                setGameState('ROUND_RESULT');
                startReviewCountdown(3);
            } else if (status === 'FINISHED') {
                setGameState('FINISHED');
            } else {
                setGameState('PLAYING');
                resetRoundState(nextMatch);
            }
        });

        socket.on('duel:updated', (data) => {
            const nextMatch = data.match;
            if (!nextMatch) return;
            setMatchData(nextMatch);
            if (nextMatch.status === 'ROUND_COMPLETED') {
                if (timerRef.current) clearInterval(timerRef.current);
                setGameState('ROUND_RESULT');
                startReviewCountdown(3);
            }
        });

        socket.on('duel:round_completed', (data) => {
            if (timerRef.current) clearInterval(timerRef.current);
            setMatchData(data.match);
            syncMyAnswerState(data.match);
            setGameState('ROUND_RESULT');
            startReviewCountdown(data.reviewSeconds || 3);
        });

        socket.on('duel:next_round', (data) => {
            clearAllTimers();
            setErrorMessage(null);
            setMatchData(data.match);
            setGameState('PLAYING');
            currentQuestionIndexRef.current = data.match?.currentQuestionIndex ?? 0;
            resetRoundState(data.match);
        });

        socket.on('duel:finished', (data) => {
            clearAllTimers();
            setMatchData(data.match);
            setGameState('FINISHED');
            if (data.forfeit) {
                setForfeitNotice(data.message || 'Đối thủ đã rời trường thi. Bạn giành chiến thắng!');
            }
        });

        socket.on('duel:opponent_disconnected', (data) => {
            setErrorMessage(data?.message || 'Đối thủ đã mất kết nối tạm thời.');
        });

        socket.on('duel:error', (err) => {
            setErrorMessage(err.message || 'Lỗi phòng thi đấu');
        });

        return () => {
            socket.disconnect();
            clearAllTimers();
        };
    }, [isAuthenticated]);

    // Đồng bộ lựa chọn của bản thân từ dữ liệu trận đấu (tránh mất state khi reconnect hoặc hết giờ)
    const syncMyAnswerState = (match) => {
        if (!match) return;
        const myIdStr = (user?._id || user?.id || '').toString();
        const isP1 = match.player1?.userId?.toString() === myIdStr;
        const myP = isP1 ? match.player1 : match.player2;
        const currIdx = match.currentQuestionIndex ?? 0;
        const myAns = myP?.answers?.find((a) => a.questionIndex === currIdx);

        if (myAns) {
            setHasAnsweredRound(true);
            hasAnsweredRoundRef.current = true;
            setSelectedAnswer(
                typeof myAns.selectedIndex === 'number' && myAns.selectedIndex >= 0 ? myAns.selectedIndex : null
            );
        } else {
            setHasAnsweredRound(false);
            hasAnsweredRoundRef.current = false;
            setSelectedAnswer(null);
        }
    };

    // Xóa toàn bộ timers
    const clearAllTimers = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (searchTimerRef.current) clearInterval(searchTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        if (reviewIntervalRef.current) clearInterval(reviewIntervalRef.current);
    };

    // Đếm ngược 3 giây khởi động trước câu 1
    const startPreMatchCountdown = (seconds = 3) => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setCountdown(seconds);
        countdownIntervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Đếm ngược 3 giây công bố kết quả hiệp đấu
    const startReviewCountdown = (seconds = 3) => {
        if (reviewIntervalRef.current) clearInterval(reviewIntervalRef.current);
        setReviewCountdown(seconds);
        reviewIntervalRef.current = setInterval(() => {
            setReviewCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(reviewIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Bắt đầu hiệp đấu mới: 10 giây
    const resetRoundState = (match) => {
        syncMyAnswerState(match);

        let initialTime = 10;
        if (match?.roundStartTime) {
            const elapsed = Math.floor((Date.now() - new Date(match.roundStartTime).getTime()) / 1000);
            if (elapsed > 0 && elapsed < 10) {
                initialTime = 10 - elapsed;
            }
        }
        setTimeLeft(initialTime);
        roundStartRef.current = Date.now();

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    // Hết giờ mà người chơi chưa chọn đáp án -> tự động nộp -1 (timeout)
                    if (!hasAnsweredRoundRef.current && matchDataRef.current) {
                        handleSelectOption(-1);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // 1. Bắt đầu ghép cặp ngẫu nhiên (Tìm trận)
    const handleStartMatchmaking = async () => {
        const activeUserId = user?._id || user?.id;
        if (!isAuthenticated || !activeUserId) {
            setShowAuthModal(true);
            return;
        }

        setErrorMessage(null);
        setForfeitNotice(null);
        setGameState('SEARCHING');
        setSearchTime(0);
        setSelectedAnswer(null);
        setHasAnsweredRound(false);
        hasAnsweredRoundRef.current = false;
        currentQuestionIndexRef.current = -1;
        clearAllTimers();

        // Đếm giây tìm kiếm hiển thị cho người dùng (Server chủ động ghép Bot ở giây thứ 10, Client chỉ dự phòng ở giây 12)
        searchTimerRef.current = setInterval(() => {
            setSearchTime((prev) => {
                const next = prev + 1;
                if (next >= 12) {
                    if (searchTimerRef.current) clearInterval(searchTimerRef.current);
                    handleRequestBotMatch();
                    return 12;
                }
                return next;
            });
        }, 1000);

        if (socketRef.current?.connected) {
            socketRef.current.emit('duel:join_queue', {
                userId: activeUserId,
                name: user?.name,
                avatar: user?.avatar,
                botDifficulty,
                questionCount,
            });
        } else {
            try {
                const res = await gamificationService.matchmakeDuel();
                if (res.data.status === 'MATCHED') {
                    clearAllTimers();
                    setMatchData(res.data.match);
                    setGameState('COUNTDOWN');
                    startPreMatchCountdown(3);
                }
            } catch (err) {
                setErrorMessage(err.message || 'Lỗi ghép cặp');
                setGameState('IDLE');
                clearAllTimers();
            }
        }
    };

    // 2. Thách đấu trực tiếp với Danh Nho AI (kèm độ khó & số câu đã chọn)
    const handleRequestBotMatch = async (overrideOpts = {}) => {
        const activeUserId = user?._id || user?.id;
        if (!isAuthenticated || !activeUserId) {
            setShowAuthModal(true);
            return;
        }

        const chosenDifficulty = typeof overrideOpts?.botDifficulty === 'string'
            ? overrideOpts.botDifficulty
            : botDifficulty;
        const chosenCount = typeof overrideOpts?.questionCount === 'number'
            ? overrideOpts.questionCount
            : questionCount;

        setErrorMessage(null);
        setForfeitNotice(null);
        clearAllTimers();

        if (socketRef.current?.connected) {
            socketRef.current.emit('duel:request_bot', {
                userId: activeUserId,
                name: user?.name,
                avatar: user?.avatar,
                botDifficulty: chosenDifficulty,
                questionCount: chosenCount,
            });
        } else {
            try {
                const res = await gamificationService.matchmakeBotDuel({
                    botDifficulty: chosenDifficulty,
                    questionCount: chosenCount,
                });
                if (res.data?.status === 'MATCHED') {
                    setMatchData(res.data.match);
                    setGameState('COUNTDOWN');
                    startPreMatchCountdown(3);
                }
            } catch (err) {
                setErrorMessage(err.message || 'Lỗi ghép với Danh Nho AI');
                setGameState('IDLE');
            }
        }
    };

    // 3. Tạo phòng thách đấu riêng (mã 6 số)
    const handleCreatePrivateRoom = async () => {
        const activeUserId = user?._id || user?.id;
        if (!isAuthenticated || !activeUserId) {
            setShowAuthModal(true);
            return;
        }

        setErrorMessage(null);
        setForfeitNotice(null);

        if (socketRef.current?.connected) {
            socketRef.current.emit('duel:create_private_room', {
                userId: activeUserId,
                name: user?.name,
                avatar: user?.avatar,
                questionCount,
            });
        } else {
            try {
                const res = await gamificationService.createPrivateRoom({ questionCount });
                if (res.success && res.data) {
                    setRoomCode(res.data.roomCode);
                    setMatchData(res.data.match);
                    setGameState('WAITING_ROOM');
                }
            } catch (err) {
                setErrorMessage(err.message || 'Lỗi tạo phòng riêng');
            }
        }
    };

    // 4. Tham gia phòng riêng bằng mã 6 số
    const handleJoinPrivateRoom = async (codeToJoin) => {
        const activeUserId = user?._id || user?.id;
        if (!isAuthenticated || !activeUserId) {
            setShowAuthModal(true);
            return;
        }

        const code = (codeToJoin || inputRoomCode).trim();
        if (!code || code.length < 5) {
            setErrorMessage('Vui lòng nhập mã phòng hợp lệ (6 chữ số)');
            return;
        }

        setErrorMessage(null);
        setForfeitNotice(null);

        if (socketRef.current?.connected) {
            socketRef.current.emit('duel:join_private_room', {
                roomCode: code,
                userId: activeUserId,
                name: user?.name,
                avatar: user?.avatar,
            });
        } else {
            try {
                const res = await gamificationService.joinPrivateRoom(code);
                if (res.success && res.data) {
                    setMatchData(res.data.match);
                    setGameState('COUNTDOWN');
                    startPreMatchCountdown(3);
                }
            } catch (err) {
                setErrorMessage(err.message || 'Mã phòng không tồn tại hoặc đã bắt đầu');
            }
        }
    };

    // Hủy tìm trận / Hủy phòng / Về sảnh thi
    const handleCancel = async () => {
        const previousMatchId = matchDataRef.current?.matchId;
        const activeUserId = user?._id || user?.id;

        setGameState('IDLE');
        setSearchTime(0);
        setSelectedAnswer(null);
        setHasAnsweredRound(false);
        hasAnsweredRoundRef.current = false;
        currentQuestionIndexRef.current = -1;
        setMatchData(null);
        setRoomCode('');
        setErrorMessage(null);
        setForfeitNotice(null);
        clearAllTimers();

        if (socketRef.current?.connected) {
            socketRef.current.emit('duel:leave_queue', { userId: activeUserId });
            if (previousMatchId) {
                socketRef.current.emit('duel:cancel_match', {
                    matchId: previousMatchId,
                    userId: activeUserId,
                });
            }
        } else {
            await gamificationService.leaveDuelQueue().catch(() => {});
        }
    };

    // Sao chép mã phòng
    const handleCopyCode = () => {
        if (!roomCode) return;
        navigator.clipboard.writeText(roomCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    // Chọn và nộp câu trả lời cho hiệp đấu
    const handleSelectOption = async (optionIndex) => {
        const activeUserId = user?._id || user?.id;
        if (hasAnsweredRoundRef.current || !matchDataRef.current || !activeUserId) return;

        // Khóa tức thì Ref và State để chống spam click hoặc giật UI
        hasAnsweredRoundRef.current = true;
        setHasAnsweredRound(true);
        setSelectedAnswer(optionIndex >= 0 ? optionIndex : null);

        const responseTimeMs = Date.now() - roundStartRef.current;

        const payload = {
            matchId: matchDataRef.current.matchId,
            userId: activeUserId,
            questionIndex: matchDataRef.current.currentQuestionIndex,
            selectedIndex: optionIndex,
            responseTimeMs: Math.min(10000, responseTimeMs),
        };

        if (socketRef.current?.connected) {
            socketRef.current.emit('duel:submit_answer', payload);
        } else {
            try {
                const updated = await gamificationService.answerDuelRound(payload);
                setMatchData(updated.data);
                if (updated.data.status === 'ROUND_COMPLETED') {
                    setGameState('ROUND_RESULT');
                    startReviewCountdown(3);
                }
            } catch (err) {
                console.warn('Lỗi gửi đáp án:', err.message);
            }
        }
    };

    // Lấy lịch sử thi đấu
    const fetchHistory = async () => {
        if (!isAuthenticated) return;
        try {
            const data = await gamificationService.getDuelHistory();
            setHistory(data);
        } catch (err) {
            console.warn('Lỗi tải lịch sử:', err.message);
        }
    };

    useEffect(() => {
        if (gameState === 'IDLE' || gameState === 'FINISHED') {
            fetchHistory();
        }
    }, [gameState]);

    // Lấy thông tin người chơi hiện tại và đối thủ
    const currentIdStr = currentUserId ? currentUserId.toString() : '';
    const isPlayer1 = matchData && matchData.player1?.userId?.toString() === currentIdStr;
    const myPlayer = isPlayer1 ? matchData?.player1 : matchData?.player2;
    const opponentPlayer = isPlayer1 ? matchData?.player2 : matchData?.player1;

    // Lấy thông tin kết quả câu hỏi hiện tại khi ở giai đoạn ROUND_RESULT
    const currentQIdx = matchData?.currentQuestionIndex ?? 0;
    const totalQuestionsCount = matchData?.questions?.length || matchData?.questionCount || questionCount || 5;
    const roundIndices = Array.from({ length: totalQuestionsCount }, (_, i) => i);
    const activeBotDifficultyMeta =
        BOT_DIFFICULTY_OPTIONS.find((d) => d.id === (matchData?.botDifficulty || botDifficulty)) ||
        BOT_DIFFICULTY_OPTIONS[1];
    const currentQData = matchData?.currentQuestion;
    const myAnswerObj = myPlayer?.answers?.find((a) => a.questionIndex === currentQIdx);
    const oppAnswerObj = opponentPlayer?.answers?.find((a) => a.questionIndex === currentQIdx);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#FAF6ED] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-vietnam">
            <div className="max-w-4xl mx-auto space-y-7">
                
                {/* Header Tiêu Đề */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 text-amber-900 text-xs font-semibold border border-amber-300 shadow-xs">
                        <Swords className="w-4 h-4 text-amber-800" />
                        <span>Đấu Trường Thi Đình 1v1 — Tranh Tài Thời Gian Thực</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-heritage">
                        Thi Đình Đối Kháng
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        Ghép cặp thời gian thực cùng các bậc sĩ tử ba miền, so tài cùng <strong>Danh Nho AI</strong> theo bậc độ khó hoặc thách đấu bạn bè: tùy chọn 5, 10 hoặc 15 câu đố Di sản, 10 giây mỗi hiệp.
                    </p>
                </div>

                {errorMessage && (
                    <div className="p-3 bg-red-50 text-red-800 text-xs rounded-2xl border border-red-200 text-center font-medium flex items-center justify-center gap-2 animate-in fade-in">
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {forfeitNotice && (
                    <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-2xl border border-amber-300 text-center font-medium flex items-center justify-center gap-2 animate-in fade-in">
                        <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>{forfeitNotice}</span>
                    </div>
                )}

                {/* ============================================================ */}
                {/* GIAI ĐOẠN 1: SẢNH CHỜ (IDLE) — 2 CHẾ ĐỘ CHƠI RÕ RÀNG */}
                {/* ============================================================ */}
                {gameState === 'IDLE' && (
                    <div className="bg-[#fffdf9] rounded-3xl p-6 sm:p-10 border border-amber-900/15 shadow-sm space-y-6">
                        {/* Tab chuyển đổi chế độ */}
                        <div className="flex items-center justify-center border-b border-stone-200 pb-4">
                            <div className="flex bg-stone-100 p-1 rounded-2xl gap-1 border border-stone-200/80">
                                <button
                                    type="button"
                                    onClick={() => setLobbyTab('QUICK')}
                                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                                        lobbyTab === 'QUICK'
                                            ? 'bg-amber-900 text-amber-100 shadow-sm'
                                            : 'text-stone-600 hover:text-stone-900'
                                    }`}
                                >
                                    <Swords className="w-4 h-4" />
                                    <span>Ghép Trận & Đấu AI</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLobbyTab('CUSTOM')}
                                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                                        lobbyTab === 'CUSTOM'
                                            ? 'bg-amber-900 text-amber-100 shadow-sm'
                                            : 'text-stone-600 hover:text-stone-900'
                                    }`}
                                >
                                    <Users className="w-4 h-4" />
                                    <span>Đấu Với Bạn Bè</span>
                                </button>
                            </div>
                        </div>

                        {/* TAB 1: GHÉP TRẬN NHANH / ĐẤU VỚI AI */}
                        {lobbyTab === 'QUICK' && (
                            <div className="space-y-6 text-center max-w-2xl mx-auto py-1">
                                <div className="space-y-2">
                                    <h3 className="font-heritage text-xl sm:text-2xl font-bold text-stone-900">
                                        Thiết Lập Trường Thi Đối Kháng
                                    </h3>
                                    <p className="text-xs text-stone-500 leading-relaxed max-w-lg mx-auto">
                                        Chọn số lượng câu hỏi và độ khó của <strong>Danh Nho AI</strong> trước khi bước vào trường thi. Hệ thống sẽ ghép cặp trực tuyến hoặc tự động so tài với AI sau 10 giây.
                                    </p>
                                </div>

                                {/* Bộ chọn Số lượng câu: 5 / 10 / 15 câu */}
                                <div className="space-y-2 text-left">
                                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider text-center">
                                        1. Chọn số câu hỏi trong ván đấu
                                    </label>
                                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                                        {QUESTION_COUNT_OPTIONS.map((opt) => {
                                            const active = questionCount === opt.count;
                                            return (
                                                <button
                                                    key={opt.count}
                                                    type="button"
                                                    onClick={() => setQuestionCount(opt.count)}
                                                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                                        active
                                                            ? 'bg-amber-900 text-amber-100 border-amber-950 shadow-md ring-2 ring-amber-400/50 scale-[1.01]'
                                                            : 'bg-amber-50/50 hover:bg-amber-100/70 text-stone-800 border-amber-200/80'
                                                    }`}
                                                >
                                                    <p className="font-heritage text-base sm:text-lg font-extrabold">
                                                        {opt.label}
                                                    </p>
                                                    <p className={`text-[10px] mt-0.5 ${active ? 'text-amber-200/90' : 'text-stone-500'}`}>
                                                        {opt.desc}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Bộ chọn Độ khó khi đấu với Bot (Dễ / Trung Bình / Khó) */}
                                <div className="space-y-2 text-left">
                                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider text-center">
                                        2. Chọn cấp độ Danh Nho AI (Độ khó Bot & Câu hỏi)
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                                        {BOT_DIFFICULTY_OPTIONS.map((diff) => {
                                            const active = botDifficulty === diff.id;
                                            return (
                                                <button
                                                    key={diff.id}
                                                    type="button"
                                                    onClick={() => setBotDifficulty(diff.id)}
                                                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                                                        active
                                                            ? 'bg-gradient-to-br from-red-950 via-red-900 to-amber-900 text-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400/50 scale-[1.01]'
                                                            : 'bg-white hover:bg-amber-50/70 text-stone-800 border-stone-200 hover:border-amber-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-heritage text-sm font-bold flex items-center gap-1.5">
                                                            <span>{diff.badge}</span>
                                                            <span>{diff.label.split('(')[0].trim()}</span>
                                                        </span>
                                                        {active && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-bold border border-amber-400/40">
                                                                Đang chọn
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-[11px] font-medium ${active ? 'text-amber-200' : 'text-amber-800'}`}>
                                                        {diff.label.match(/\((.*?)\)/)?.[1] || ''} • {diff.accuracyText}
                                                    </p>
                                                    <p className={`text-[10px] ${active ? 'text-amber-100/80' : 'text-stone-500'}`}>
                                                        {diff.speedText} • {diff.questionText}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 sm:gap-4 py-1 max-w-lg mx-auto">
                                    <div className="p-2.5 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-center">
                                        <p className="text-[10px] text-amber-800 font-bold uppercase">Hiệp đấu</p>
                                        <p className="font-heritage text-base sm:text-lg font-bold text-stone-900 mt-0.5">
                                            {questionCount} Câu
                                        </p>
                                    </div>
                                    <div className="p-2.5 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-center">
                                        <p className="text-[10px] text-amber-800 font-bold uppercase">Mỗi câu</p>
                                        <p className="font-heritage text-base sm:text-lg font-bold text-stone-900 mt-0.5">
                                            10 Giây
                                        </p>
                                    </div>
                                    <div className="p-2.5 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-center">
                                        <p className="text-[10px] text-amber-800 font-bold uppercase">Phần thưởng</p>
                                        <p className="font-heritage text-base sm:text-lg font-bold text-emerald-800 mt-0.5">
                                            +30 EXP
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleStartMatchmaking}
                                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-800 via-red-900 to-amber-900 hover:from-red-700 hover:to-amber-800 text-amber-100 rounded-2xl text-sm font-bold transition shadow-md shadow-red-950/20 flex items-center justify-center gap-2 group cursor-pointer"
                                    >
                                        <Swords className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                                        <span>Tìm Đối Thủ Ngay</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRequestBotMatch()}
                                        className="w-full sm:w-auto px-6 py-3.5 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300 rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Bot className="w-4 h-4 text-amber-800" />
                                        <span>
                                            Đấu Danh Nho AI ({activeBotDifficultyMeta.badge} {activeBotDifficultyMeta.label.split('(')[0].trim()} • {questionCount} câu)
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: PHÒNG THÁCH ĐẤU BẠN BÈ */}
                        {lobbyTab === 'CUSTOM' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                {/* Khối Tạo Phòng */}
                                <div className="p-6 bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-2xl border border-amber-200/80 space-y-4 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-900 text-amber-200 flex items-center justify-center shadow-xs">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-heritage text-lg font-bold text-stone-900">
                                            Tạo Phòng Thách Đấu
                                        </h4>
                                        <p className="text-xs text-stone-600 leading-relaxed">
                                            Sinh mã phòng riêng (6 số) gửi cho bạn bè để so tài kiến thức di sản trong phòng kín.
                                        </p>

                                        {/* Chọn số câu cho phòng thách đấu bạn bè */}
                                        <div className="pt-1">
                                            <span className="text-[11px] font-bold text-amber-900 block mb-1.5">
                                                Số câu hỏi của phòng:
                                            </span>
                                            <div className="flex gap-1.5">
                                                {QUESTION_COUNT_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt.count}
                                                        type="button"
                                                        onClick={() => setQuestionCount(opt.count)}
                                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                                            questionCount === opt.count
                                                                ? 'bg-amber-900 text-amber-100 border-amber-950'
                                                                : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100/60'
                                                        }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCreatePrivateRoom}
                                        className="w-full py-3 bg-red-900 hover:bg-red-800 text-amber-100 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                                    >
                                        <Sparkles className="w-4 h-4 text-amber-300" />
                                        <span>Tạo Mã Phòng ({questionCount} câu)</span>
                                    </button>
                                </div>

                                {/* Khối Vào Phòng Bằng Mã */}
                                <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-4 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <div className="w-10 h-10 rounded-xl bg-stone-800 text-stone-100 flex items-center justify-center shadow-xs">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-heritage text-lg font-bold text-stone-900">
                                            Vào Phòng Bằng Mã
                                        </h4>
                                        <p className="text-xs text-stone-600 leading-relaxed">
                                            Nhập mã phòng 6 chữ số do bạn bè gửi để bước ngay vào phòng thi đấu.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                placeholder="VD: 829104"
                                                value={inputRoomCode}
                                                onChange={(e) => setInputRoomCode(e.target.value.replace(/\D/g, ''))}
                                                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-amber-800 focus:bg-white"
                                            />
                                            <button
                                                onClick={() => handleJoinPrivateRoom(inputRoomCode)}
                                                disabled={!inputRoomCode || inputRoomCode.length < 5}
                                                className="px-5 py-2.5 bg-amber-900 hover:bg-amber-800 disabled:bg-stone-300 text-amber-100 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                                            >
                                                <span>Vào</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ============================================================ */}
                {/* GIAI ĐOẠN: ĐANG TÌM ĐỐI THỦ (SEARCHING) */}
                {/* ============================================================ */}
                {gameState === 'SEARCHING' && (
                    <div className="bg-[#fffdf9] rounded-3xl p-8 sm:p-12 border border-amber-900/15 shadow-md text-center space-y-6 animate-in fade-in">
                        <div className="relative mx-auto w-20 h-20">
                            <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-ping opacity-30" />
                            <div className="relative w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-amber-900">
                                <Swords className="w-9 h-9 animate-bounce text-amber-900" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="font-heritage text-xl sm:text-2xl font-bold text-stone-900">
                                Đang Tìm Sĩ Tử Đối Đầu... ({searchTime}s)
                            </h3>
                            <p className="text-xs text-stone-500 max-w-md mx-auto">
                                Tự động ghép với <strong>Danh Nho AI</strong> sau 10 giây nếu chưa tìm thấy đối thủ trực tuyến.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={handleCancel}
                                className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                            >
                                <X className="w-4 h-4 text-stone-600" />
                                <span>Hủy tìm kiếm</span>
                            </button>

                            <button
                                onClick={handleRequestBotMatch}
                                className="px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                            >
                                <Bot className="w-4 h-4 text-amber-300" />
                                <span>Đấu với AI ngay</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ============================================================ */}
                {/* GIAI ĐOẠN: ĐANG ĐỢI BẠN BÈ VÀO PHÒNG (WAITING_ROOM) */}
                {/* ============================================================ */}
                {gameState === 'WAITING_ROOM' && (
                    <div className="bg-[#fffdf9] rounded-3xl p-8 sm:p-12 border border-amber-900/15 shadow-md text-center space-y-6 animate-in fade-in max-w-lg mx-auto">
                        <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 mx-auto flex items-center justify-center text-amber-900 shadow-sm">
                            <Users className="w-8 h-8 text-amber-800" />
                        </div>

                        <div className="space-y-1">
                            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                                Phòng Thách Đấu Riêng
                            </span>
                            <h3 className="font-heritage text-2xl font-bold text-stone-900 pt-2">
                                Mã Phòng Của Bạn
                            </h3>
                            <p className="text-xs text-stone-500">
                                Gửi mã này cho bạn bè để cùng vào phòng thi đấu 1v1.
                            </p>
                        </div>

                        {/* Hộp mã phòng to */}
                        <div className="p-4 bg-amber-50/70 rounded-2xl border-2 border-dashed border-amber-300 flex items-center justify-center gap-4 max-w-xs mx-auto">
                            <span className="font-mono text-3xl font-extrabold tracking-widest text-amber-950">
                                {roomCode}
                            </span>
                            <button
                                onClick={handleCopyCode}
                                className="p-2.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 transition shadow-xs cursor-pointer"
                                title="Sao chép mã"
                            >
                                {copiedCode ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        {copiedCode && (
                            <p className="text-[11px] text-emerald-700 font-bold -mt-3">
                                ✓ Đã sao chép mã phòng vào khay nhớ tạm!
                            </p>
                        )}

                        <div className="flex items-center justify-center gap-2 text-xs text-stone-500 pt-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-800" />
                            <span>Đang chờ bạn bè nhập mã bước vào trường thi...</span>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                Hủy Phòng
                            </button>
                        </div>
                    </div>
                )}

                {/* ============================================================ */}
                {/* GIAI ĐOẠN: ĐẾM NGƯỢC 3.. 2.. 1.. KHỞI THÍ (COUNTDOWN) */}
                {/* ============================================================ */}
                {gameState === 'COUNTDOWN' && matchData && (
                    <div className="bg-[#fffdf9] rounded-3xl p-8 sm:p-12 border border-amber-900/15 shadow-xl text-center space-y-7 animate-in zoom-in-95">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold border border-red-300 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5 text-red-700" />
                            <span>Khởi Thí Thi Đình — Sĩ Tử Điểm Danh</span>
                        </div>

                        {/* MÀN ĐỐI ĐẦU VS HOÀNH TRÁNG */}
                        <div className="grid grid-cols-3 items-center max-w-lg mx-auto py-2">
                            {/* Bạn */}
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-500 overflow-hidden shadow-md bg-stone-100">
                                    <img
                                        src={getAvatarUrl(myPlayer?.avatar) || `https://api.dicebear.com/7.x/adventurer/svg?seed=${myPlayer?.name || 'ban'}`}
                                        alt={myPlayer?.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    Bạn
                                </span>
                                <h4 className="font-heritage font-bold text-sm sm:text-base text-stone-900 truncate max-w-[110px]">
                                    {myPlayer?.name}
                                </h4>
                            </div>

                            {/* Biểu tượng VS và Đồng hồ đếm ngược */}
                            <div className="flex flex-col items-center space-y-1">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-red-800 via-red-900 to-amber-900 text-amber-200 flex items-center justify-center shadow-lg ring-4 ring-amber-200">
                                    <span className="font-heritage text-3xl sm:text-4xl font-extrabold animate-bounce">
                                        {countdown > 0 ? countdown : 'VÀO!'}
                                    </span>
                                </div>
                                <span className="font-heritage font-bold text-xs text-amber-900 tracking-wider">
                                    ĐỐI KHÁNG
                                </span>
                            </div>

                            {/* Đối thủ */}
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-stone-400 overflow-hidden shadow-md bg-stone-100">
                                    <img
                                        src={getAvatarUrl(opponentPlayer?.avatar) || `https://api.dicebear.com/7.x/adventurer/svg?seed=${opponentPlayer?.name || 'doithu'}`}
                                        alt={opponentPlayer?.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                                    {matchData.isBotMatch ? `Danh Nho AI • ${activeBotDifficultyMeta.label.split('(')[0].trim()}` : 'Đối Thủ'}
                                </span>
                                <h4 className="font-heritage font-bold text-sm sm:text-base text-stone-900 truncate max-w-[120px]">
                                    {opponentPlayer?.name}
                                </h4>
                            </div>
                        </div>

                        <p className="text-xs text-stone-500 italic">
                            Trận đấu gồm <strong>{totalQuestionsCount} câu hỏi</strong> sẽ bắt đầu tự động sau {countdown} giây. Chuẩn bị tinh thần!
                        </p>
                    </div>
                )}

                {/* ============================================================ */}
                {/* GIAI ĐOẠN 2: THI ĐẤU (PLAYING) & CÔNG BỐ HIỆP (ROUND_RESULT) */}
                {/* ============================================================ */}
                {(gameState === 'PLAYING' || gameState === 'ROUND_RESULT') && matchData && (
                    <div className="bg-[#fffdf9] rounded-3xl p-6 sm:p-10 border border-amber-900/15 shadow-md space-y-6 relative animate-in fade-in">
                        <div className="flex items-center justify-between -mt-2 mb-1">
                            <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1.5">
                                {matchData.isBotMatch ? (
                                    <>
                                        <span>🤖 Danh Nho AI</span>
                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] border border-amber-200">
                                            {activeBotDifficultyMeta.badge} {activeBotDifficultyMeta.label} • {totalQuestionsCount} câu
                                        </span>
                                    </>
                                ) : (
                                    <span>⚔️ Thi Đình Đối Kháng • {totalQuestionsCount} câu</span>
                                )}
                            </span>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="text-[11px] font-bold text-stone-400 hover:text-rose-700 flex items-center gap-1 transition cursor-pointer"
                                title="Thoát khỏi trận đấu này"
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>Thoát trận</span>
                            </button>
                        </div>

                        {/* 1. THANH TIẾN ĐỘ CÁC HIỆP ĐẤU (5 / 10 / 15 ROUND TRACKER DOTS) */}
                        <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/50 space-y-2 text-xs">
                            {totalQuestionsCount > 5 && (
                                <div className="text-center font-heritage font-bold text-amber-900 text-xs uppercase tracking-wider">
                                    Hiệp {currentQIdx + 1} / {totalQuestionsCount}
                                </div>
                            )}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 flex-wrap justify-center md:justify-start">
                                    <span className="font-bold text-stone-700 text-[11px]">Bạn:</span>
                                    <div className="flex items-center gap-1 flex-wrap justify-center">
                                        {roundIndices.map((idx) => {
                                            const ans = myPlayer?.answers?.find((a) => a.questionIndex === idx);
                                            const isCurrent = currentQIdx === idx;
                                            const isCorrect = ans?.isCorrect === true;
                                            const isWrong = ans?.isCorrect === false;
                                            const isSubmittedPending =
                                                (ans && ans.isCorrect === undefined) ||
                                                (isCurrent && gameState === 'PLAYING' && hasAnsweredRound && !ans);
                                            const dotSize = totalQuestionsCount >= 15
                                                ? 'w-[19px] h-[19px] text-[9px]'
                                                : 'w-6 h-6 text-[10px]';

                                            return (
                                                <div
                                                    key={idx}
                                                    title={
                                                        isCorrect
                                                            ? `Câu ${idx + 1}: Chính xác`
                                                            : isWrong
                                                                ? `Câu ${idx + 1}: Chưa chính xác`
                                                                : isSubmittedPending
                                                                    ? `Câu ${idx + 1}: Đã nộp bài, đang chờ công bố`
                                                                    : `Câu ${idx + 1}`
                                                    }
                                                    className={`${dotSize} rounded-full flex items-center justify-center font-bold transition-all ${
                                                        isCorrect
                                                            ? 'bg-emerald-600 text-white shadow-xs'
                                                            : isWrong
                                                                ? 'bg-rose-600 text-white shadow-xs'
                                                                : isSubmittedPending
                                                                    ? 'bg-sky-600 text-white ring-2 ring-sky-300 shadow-xs'
                                                                    : isCurrent
                                                                        ? 'bg-amber-600 text-white ring-2 ring-amber-300 animate-pulse'
                                                                        : 'bg-stone-200 text-stone-500'
                                                    }`}
                                                >
                                                    {isCorrect ? '✓' : isWrong ? '✗' : isSubmittedPending ? '•' : idx + 1}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {totalQuestionsCount <= 5 && (
                                    <span className="font-heritage font-bold text-amber-900 text-xs uppercase tracking-wider hidden sm:inline whitespace-nowrap">
                                        Hiệp {currentQIdx + 1} / {totalQuestionsCount}
                                    </span>
                                )}

                                <div className="flex items-center gap-1.5 flex-wrap justify-center md:justify-end">
                                    <span className="font-bold text-stone-700 text-[11px]">Đối thủ:</span>
                                    <div className="flex items-center gap-1 flex-wrap justify-center">
                                        {roundIndices.map((idx) => {
                                            const ans = opponentPlayer?.answers?.find((a) => a.questionIndex === idx);
                                            const isCurrent = currentQIdx === idx;
                                            const isCorrect = ans?.isCorrect === true;
                                            const isWrong = ans?.isCorrect === false;
                                            const isSubmittedPending =
                                                (ans && ans.isCorrect === undefined) ||
                                                (isCurrent &&
                                                    gameState === 'PLAYING' &&
                                                    opponentPlayer?.hasAnsweredCurrent &&
                                                    !ans);
                                            const dotSize = totalQuestionsCount >= 15
                                                ? 'w-[19px] h-[19px] text-[9px]'
                                                : 'w-6 h-6 text-[10px]';

                                            return (
                                                <div
                                                    key={idx}
                                                    title={
                                                        isCorrect
                                                            ? `Câu ${idx + 1}: Đối thủ trả lời đúng`
                                                            : isWrong
                                                                ? `Câu ${idx + 1}: Đối thủ trả lời sai`
                                                                : isSubmittedPending
                                                                    ? `Câu ${idx + 1}: Đối thủ đã nộp đáp án`
                                                                    : `Câu ${idx + 1}`
                                                    }
                                                    className={`${dotSize} rounded-full flex items-center justify-center font-bold transition-all ${
                                                        isCorrect
                                                            ? 'bg-emerald-600 text-white shadow-xs'
                                                            : isWrong
                                                                ? 'bg-rose-600 text-white shadow-xs'
                                                                : isSubmittedPending
                                                                    ? 'bg-sky-600 text-white ring-2 ring-sky-300 shadow-xs'
                                                                    : isCurrent
                                                                        ? 'bg-stone-400 text-white ring-2 ring-stone-300 animate-pulse'
                                                                        : 'bg-stone-200 text-stone-500'
                                                    }`}
                                                >
                                                    {isCorrect ? '✓' : isWrong ? '✗' : isSubmittedPending ? '•' : idx + 1}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. CỤM ĐỐI ĐẦU 2 NGƯỜI CHƠI (VS HEADER) */}
                        <div className="grid grid-cols-3 items-center pb-4 border-b border-amber-200/60 text-center">
                            {/* Người chơi tôi */}
                            <div className="flex flex-col items-center space-y-1">
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    Bạn
                                </span>
                                <h3 className="font-heritage font-bold text-sm sm:text-base text-stone-900 truncate max-w-[120px]">
                                    {myPlayer?.name}
                                </h3>
                                <p className="text-xl sm:text-2xl font-extrabold text-amber-900 font-heritage">
                                    {myPlayer?.score} đ
                                </p>
                                {gameState === 'PLAYING' && hasAnsweredRound && (
                                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 animate-fade-in">
                                        ✓ Đã nộp bài
                                    </span>
                                )}
                            </div>

                            {/* Đồng hồ đếm ngược 10 giây ở giữa */}
                            <div className="flex flex-col items-center justify-center">
                                {gameState === 'ROUND_RESULT' ? (
                                    <div
                                        className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-heritage font-extrabold text-xl shadow-xs animate-in zoom-in-90 ${
                                            myAnswerObj?.isCorrect
                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                                                : 'border-rose-500 bg-rose-50 text-rose-700'
                                        }`}
                                    >
                                        {myAnswerObj?.isCorrect ? '✓' : '✗'}
                                    </div>
                                ) : (
                                    <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-heritage font-extrabold text-xl transition-all ${
                                        timeLeft <= 3
                                            ? 'border-red-600 text-red-600 bg-red-50 animate-pulse scale-105'
                                            : 'border-amber-600 text-amber-900 bg-amber-50'
                                    }`}>
                                        {timeLeft}s
                                    </div>
                                )}
                                <span className="text-[10px] text-stone-400 mt-1 font-bold">
                                    {gameState === 'ROUND_RESULT'
                                        ? `Chuyển câu: ${reviewCountdown}s`
                                        : `Câu ${currentQIdx + 1} / ${totalQuestionsCount}`}
                                </span>
                            </div>

                            {/* Đối thủ */}
                            <div className="flex flex-col items-center space-y-1">
                                <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                                    {matchData.isBotMatch ? 'Danh Nho AI' : 'Đối Thủ'}
                                </span>
                                <h3 className="font-heritage font-bold text-sm sm:text-base text-stone-900 truncate max-w-[130px]">
                                    {opponentPlayer?.name || 'Sĩ tử đối đầu'}
                                </h3>
                                <p className="text-xl sm:text-2xl font-extrabold text-stone-700 font-heritage">
                                    {opponentPlayer?.score || 0} đ
                                </p>
                                {gameState === 'PLAYING' && (
                                    opponentPlayer?.hasAnsweredCurrent ? (
                                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                                            ✓ Đã nộp bài
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-stone-400 font-medium italic">
                                            Đang suy nghĩ...
                                        </span>
                                    )
                                )}
                            </div>
                        </div>

                        {/* 3. NỘI DUNG CÂU HỎI & 4 PHƯƠNG ÁN */}
                        {currentQData && (
                            <div className="space-y-4 pt-1">
                                <div className="text-center space-y-1">
                                    <span className="text-xs font-semibold text-amber-800 bg-amber-100/60 px-3 py-0.5 rounded-full border border-amber-200">
                                        Thể loại: {currentQData.categoryName}
                                    </span>
                                    <h2 className="text-base sm:text-xl font-bold font-heritage text-stone-900 pt-1 leading-relaxed">
                                        {currentQData.question}
                                    </h2>
                                </div>

                                {/* 4 Phương án lựa chọn */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    {currentQData.options.map((opt, optIdx) => {
                                        const isSelected = selectedAnswer === optIdx;
                                        const isCorrectOpt = currentQData.correctIndex !== undefined && currentQData.correctIndex === optIdx;
                                        const isMyWrongOpt = gameState === 'ROUND_RESULT' && isSelected && !isCorrectOpt;

                                        // Kiểu dáng nút tương ứng theo từng giai đoạn
                                        let btnStyle = 'bg-white hover:bg-amber-50/70 border-stone-200 text-stone-800 hover:border-amber-300';
                                        let badgeStyle = 'bg-stone-100 text-stone-600';

                                        if (gameState === 'ROUND_RESULT') {
                                            if (isCorrectOpt) {
                                                btnStyle = 'bg-emerald-700 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500 scale-[1.01]';
                                                badgeStyle = 'bg-emerald-800 text-emerald-100';
                                            } else if (isMyWrongOpt) {
                                                btnStyle = 'bg-rose-700 text-white border-rose-600 shadow-md ring-2 ring-rose-500';
                                                badgeStyle = 'bg-rose-800 text-rose-100';
                                            } else {
                                                btnStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-50';
                                                badgeStyle = 'bg-stone-100 text-stone-400';
                                            }
                                        } else if (gameState === 'PLAYING') {
                                            if (isSelected) {
                                                btnStyle = 'bg-amber-900 text-amber-50 border-amber-800 shadow-md ring-2 ring-amber-700 scale-[1.01]';
                                                badgeStyle = 'bg-amber-800 text-amber-200';
                                            } else if (hasAnsweredRound) {
                                                btnStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
                                                badgeStyle = 'bg-stone-100 text-stone-400';
                                            }
                                        }

                                        return (
                                            <button
                                                key={optIdx}
                                                onClick={() => handleSelectOption(optIdx)}
                                                disabled={hasAnsweredRound || gameState !== 'PLAYING' || timeLeft <= 0}
                                                className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${btnStyle} disabled:cursor-not-allowed`}
                                            >
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${badgeStyle}`}>
                                                    {String.fromCharCode(65 + optIdx)}
                                                </span>
                                                <div className="flex-1 flex items-center justify-between">
                                                    <span className="leading-relaxed">{opt}</span>
                                                    {gameState === 'ROUND_RESULT' && isCorrectOpt && (
                                                        <span className="text-[10px] font-bold bg-emerald-800/80 px-2.5 py-0.5 rounded-full text-emerald-100 ml-2 whitespace-nowrap flex-shrink-0">
                                                            ✓ Đáp án đúng
                                                        </span>
                                                    )}
                                                    {gameState === 'ROUND_RESULT' && isMyWrongOpt && (
                                                        <span className="text-[10px] font-bold bg-rose-800/80 px-2.5 py-0.5 rounded-full text-rose-100 ml-2 whitespace-nowrap flex-shrink-0">
                                                            ✗ Bạn đã chọn
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Thông báo chờ đối thủ khi đang trong PLAYING */}
                                {gameState === 'PLAYING' && hasAnsweredRound && (
                                    <p className="text-center text-xs text-amber-800 italic pt-2 animate-pulse">
                                        Đã ghi nhận câu trả lời! Đang đợi đối thủ hoặc hết 10 giây hiệp đấu...
                                    </p>
                                )}

                                {/* 4. KHUNG CÔNG BỐ KẾT QUẢ HIỆP ĐẤU (ROUND_RESULT / REVIEW) */}
                                {gameState === 'ROUND_RESULT' && (
                                    <div className="mt-4 p-4 sm:p-5 bg-amber-50/80 rounded-2xl border border-amber-300/80 space-y-3 animate-in fade-in zoom-in-95">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200/80 pb-2.5 gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    myAnswerObj?.isCorrect
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                                                }`}>
                                                    {myAnswerObj?.isCorrect
                                                        ? '✓ Bạn trả lời đúng!'
                                                        : myAnswerObj?.selectedIndex === -1
                                                            ? '⏱️ Hết giờ! Chưa kịp chọn'
                                                            : '✗ Bạn chưa chính xác'}
                                                </span>
                                                <span className="text-xs font-bold text-amber-950 font-heritage">
                                                    {myAnswerObj?.isCorrect ? `+${myAnswerObj.points} điểm` : '+0 điểm'}
                                                </span>
                                            </div>

                                            <div className="text-xs text-stone-600">
                                                <span>Đối thủ: </span>
                                                <strong className={oppAnswerObj?.isCorrect ? 'text-emerald-700' : 'text-stone-500'}>
                                                    {oppAnswerObj?.isCorrect
                                                        ? `Đúng (+${oppAnswerObj.points} đ)`
                                                        : oppAnswerObj?.selectedIndex === -1
                                                            ? 'Hết giờ (+0 đ)'
                                                            : 'Sai (+0 đ)'}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* Giải thích kiến thức di sản */}
                                        {currentQData.explanation && (
                                            <div className="text-xs text-stone-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-200/50">
                                                <p className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                                                    <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                                                    <span>Điển tích Di sản:</span>
                                                </p>
                                                <p>{currentQData.explanation}</p>
                                            </div>
                                        )}

                                        <p className="text-[11px] text-stone-500 text-center italic">
                                            Tự động sang câu hỏi tiếp theo sau {reviewCountdown} giây...
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ============================================================ */}
                {/* GIAI ĐOẠN 3: KẾT THÚC TRẬN ĐẤU (FINISHED) */}
                {/* ============================================================ */}
                {gameState === 'FINISHED' && matchData && (
                    <div className="bg-[#fffdf9] rounded-3xl p-8 sm:p-12 border border-amber-900/15 shadow-xl text-center space-y-6 relative animate-in zoom-in-95">
                        
                        {/* Banner kết quả Thắng / Thua / Hòa */}
                        {matchData.isTie ? (
                            <div className="space-y-3">
                                <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center font-heritage font-bold text-2xl shadow-lg ring-8 ring-amber-50">
                                    🤝
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold font-heritage text-stone-900">
                                    Trận Đấu Hòa Kịch Tính!
                                </h2>
                                <p className="text-xs sm:text-sm text-stone-600">
                                    Cả hai sĩ tử đều có học vấn ngang tài ngang sức. Bạn nhận được <strong className="text-amber-800">+15 EXP</strong>!
                                </p>
                            </div>
                        ) : matchData.winnerId?.toString() === currentIdStr ? (
                            <div className="space-y-3">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 text-red-950 mx-auto flex items-center justify-center shadow-xl ring-8 ring-amber-100">
                                    <Crown className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold font-heritage text-stone-900">
                                    Chiến Thắng Rạng Rỡ! 🎉
                                </h2>
                                <p className="text-xs sm:text-sm text-emerald-800 font-bold">
                                    Xuất sắc vượt qua đối thủ! Bạn nhận được <span className="underline">+30 EXP</span> và thăng tiến trên Bảng Vàng.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="w-20 h-20 rounded-full bg-stone-200 text-stone-700 mx-auto flex items-center justify-center font-heritage font-bold text-2xl shadow ring-8 ring-stone-100">
                                    📜
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold font-heritage text-stone-900">
                                    Học Hỏi Thêm Một Lần!
                                </h2>
                                <p className="text-xs sm:text-sm text-stone-600">
                                    Đối thủ có phản xạ nhỉnh hơn. Bạn vẫn nhận được <strong className="text-amber-800">+10 EXP</strong> giao lưu học tập.
                                </p>
                            </div>
                        )}

                        {/* Tỷ số chung cuộc */}
                        <div className="flex items-center justify-center gap-8 py-3 bg-amber-50/50 rounded-2xl border border-amber-200/60 max-w-sm mx-auto">
                            <div className="text-center">
                                <p className="text-xs text-stone-500">Điểm của bạn</p>
                                <p className="text-3xl font-extrabold text-amber-900 font-heritage">{myPlayer?.score}</p>
                            </div>
                            <span className="text-stone-300 text-2xl font-bold">-</span>
                            <div className="text-center">
                                <p className="text-xs text-stone-500">Đối thủ</p>
                                <p className="text-3xl font-extrabold text-stone-700 font-heritage">{opponentPlayer?.score || 0}</p>
                            </div>
                        </div>

                        {/* Thông tin cấu hình trận vừa đấu (nếu đấu AI) */}
                        {matchData.isBotMatch && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/70 text-[11px] font-semibold text-amber-900">
                                <span>{activeBotDifficultyMeta.badge}</span>
                                <span>Cấp độ: {activeBotDifficultyMeta.label}</span>
                                <span>•</span>
                                <span>{totalQuestionsCount} Câu hỏi</span>
                            </div>
                        )}

                        {/* BẢNG TỔNG KẾT CHI TIẾT CÁC CÂU HỎI */}
                        {matchData.questions && matchData.questions.length > 0 && (
                            <div className="text-left border border-stone-200 rounded-2xl p-4 bg-stone-50/60 space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDetailedReview(!showDetailedReview)}
                                    className="w-full flex items-center justify-between text-xs font-bold text-stone-800 cursor-pointer"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4 text-amber-800" />
                                        <span>Xem Lại Chi Tiết {matchData.questions.length} Câu Đố & Điển Tích Di Sản</span>
                                    </span>
                                    {showDetailedReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {showDetailedReview && (
                                    <div className="space-y-3 pt-2">
                                        {matchData.questions.map((q, qIdx) => {
                                            const myAns = myPlayer?.answers?.find((a) => a.questionIndex === qIdx);
                                            const oppAns = opponentPlayer?.answers?.find((a) => a.questionIndex === qIdx);
                                            return (
                                                <div key={qIdx} className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1.5">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className="font-bold text-stone-900 leading-relaxed">
                                                            {qIdx + 1}. {q.question}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                                                            myAns?.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                        }`}>
                                                            {myAns?.isCorrect
                                                                ? `Bạn Đúng (+${myAns.points}đ)`
                                                                : myAns?.selectedIndex === -1
                                                                    ? 'Hết giờ'
                                                                    : 'Bạn Sai'}
                                                        </span>
                                                    </div>

                                                    {myAns && !myAns.isCorrect && (
                                                        <p className="text-stone-500 text-[11px]">
                                                            Lựa chọn của bạn:{' '}
                                                            <span className="text-rose-700 font-medium">
                                                                {myAns.selectedIndex >= 0 ? q.options[myAns.selectedIndex] : 'Chưa kịp trả lời (Hết giờ)'}
                                                            </span>
                                                        </p>
                                                    )}

                                                    <p className="text-stone-600 text-[11px]">
                                                        Đáp án đúng: <strong className="text-emerald-800">{q.options[q.correctIndex]}</strong>
                                                        {oppAns && (
                                                            <span className="ml-2 text-stone-400">
                                                                • Đối thủ: {oppAns.isCorrect ? `Đúng (+${oppAns.points}đ)` : 'Sai (+0đ)'}
                                                            </span>
                                                        )}
                                                    </p>

                                                    {q.explanation && (
                                                        <p className="text-[11px] text-stone-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-200/40">
                                                            Điển tích: {q.explanation}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                            {matchData.isBotMatch ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRequestBotMatch({
                                            botDifficulty: matchData.botDifficulty || botDifficulty,
                                            questionCount: matchData.questionCount || totalQuestionsCount,
                                        })
                                    }
                                    className="px-6 py-2.5 bg-red-900 hover:bg-red-800 text-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                                >
                                    <Bot className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Đấu ván mới với Danh Nho AI</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleStartMatchmaking}
                                    className="px-6 py-2.5 bg-red-900 hover:bg-red-800 text-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Thách đấu ván mới</span>
                                </button>
                            )}
                            <button
                                onClick={handleCancel}
                                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                Về sảnh thi
                            </button>
                            <Link
                                to="/bang-vang"
                                className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                            >
                                <Trophy className="w-3.5 h-3.5 text-amber-700" />
                                <span>Xem Bảng Vàng</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* ============================================================ */}
                {/* LỊCH SỬ THI ĐẤU GẦN NHẤT (KHI Ở SẢNH CHỜ) */}
                {/* ============================================================ */}
                {history.length > 0 && gameState === 'IDLE' && (
                    <div className="bg-[#fffdf9] rounded-3xl p-6 border border-amber-900/15 shadow-sm space-y-4">
                        <h3 className="font-heritage font-bold text-stone-900 text-base flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-800" />
                            <span>Lịch Sử Thi Đấu Gần Đây:</span>
                        </h3>

                        <div className="space-y-2.5">
                            {history.map((h, hIdx) => (
                                <div
                                    key={hIdx}
                                    className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between text-xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                            h.outcome === 'WIN' ? 'bg-emerald-100 text-emerald-800' :
                                            h.outcome === 'LOSS' ? 'bg-rose-100 text-rose-800' :
                                            'bg-amber-100 text-amber-800'
                                        }`}>
                                            {h.outcome === 'WIN' ? 'Thắng' : h.outcome === 'LOSS' ? 'Bại' : 'Hòa'}
                                        </span>
                                        <span className="font-semibold text-stone-800">
                                            vs {h.opponentName}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="font-bold font-heritage text-stone-900">
                                            {h.myScore} - {h.opponentScore}
                                        </span>
                                        <span className="text-[11px] text-stone-400">
                                            {new Date(h.endedAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* ============================================================ */}
            {/* MODAL YÊU CẦU ĐĂNG NHẬP (CHIẾU CHỈ THI ĐÌNH) */}
            {/* ============================================================ */}
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md rounded-2xl bg-white border border-stone-200 p-6 sm:p-8 shadow-xl text-center text-stone-800">
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                            aria-label="Đóng"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-red-800 to-amber-800 text-amber-200 border-2 border-amber-400/60 flex items-center justify-center mb-4 shadow-lg shadow-red-950/30">
                            <Swords className="w-8 h-8 text-amber-200" />
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-300 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                            <span>Chiếu Chỉ Khởi Thí</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold font-heritage text-stone-900 mb-2">
                            Ghi Danh Bước Vào Trường Thi
                        </h3>

                        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
                            Đấu trường <strong>Thi Đình Đối Kháng 1v1</strong> yêu cầu danh tính sĩ tử để kết nối phòng thi thời gian thực, tích lũy điểm kinh nghiệm (<span className="text-amber-800 font-bold">+30 EXP</span>) và vinh danh trên Bảng Vàng Trạng Nguyên.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/login', { state: { from: location } })}
                                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-800 via-red-900 to-amber-900 hover:from-red-700 hover:to-amber-800 text-amber-100 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-red-950/30 transition-all duration-200 active:scale-95 cursor-pointer"
                            >
                                <LogIn className="w-4 h-4 text-amber-300" />
                                <span>Đăng nhập để vào thi ngay</span>
                            </button>

                            <button
                                onClick={() => navigate('/register', { state: { from: location } })}
                                className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300/80 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                            >
                                <UserPlus className="w-4 h-4 text-amber-800" />
                                <span>Ghi danh sĩ tử mới (Đăng ký)</span>
                            </button>

                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="text-stone-400 hover:text-stone-600 text-xs transition-colors pt-2 block mx-auto cursor-pointer"
                            >
                                Để sau, tôi muốn xem lại quy chế thi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeritageArena;
