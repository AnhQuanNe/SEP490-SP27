import { useState, useEffect, useRef } from 'react';
import { 
    Swords, 
    Crown, 
    Trophy, 
    Clock, 
    RotateCcw, 
    Loader2, 
    Users,
    Award
} from 'lucide-react';
import { io } from 'socket.io-client';
import { gamificationService } from '../services/gamification.service';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const HeritageArena = () => {
    const { user, isAuthenticated } = useAuth();
    const currentUserId = user?._id || user?.id;

    // Match status state
    const [gameState, setGameState] = useState('IDLE'); // 'IDLE' | 'SEARCHING' | 'MATCHED' | 'PLAYING' | 'FINISHED'
    const [matchData, setMatchData] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasAnsweredRound, setHasAnsweredRound] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [searchTime, setSearchTime] = useState(0); // Thời gian đã chờ ghép (giây)
    const [history, setHistory] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);

    // Socket & Timer references
    const socketRef = useRef(null);
    const timerRef = useRef(null);
    const searchTimerRef = useRef(null);
    const roundStartRef = useRef(Date.now());
    const matchDataRef = useRef(null);
    const hasAnsweredRoundRef = useRef(false);

    // Đồng bộ refs với state để tránh lỗi closure trong setInterval
    useEffect(() => {
        matchDataRef.current = matchData;
    }, [matchData]);

    useEffect(() => {
        hasAnsweredRoundRef.current = hasAnsweredRound;
    }, [hasAnsweredRound]);

    // Khởi tạo Socket.io client
    useEffect(() => {
        if (!isAuthenticated) return;

        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
        const socket = io(`${serverUrl}/duel`, {
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Duel Socket] Đã kết nối phòng thi đấu Thi Đình');
        });

        socket.on('duel:waiting', () => {
            setGameState('SEARCHING');
        });

        socket.on('duel:matched', (data) => {
            if (searchTimerRef.current) clearInterval(searchTimerRef.current);
            setSearchTime(0);
            setMatchData(data.match);
            setGameState('PLAYING');
            resetRoundState(data.match);
        });

        socket.on('duel:in_match', (data) => {
            if (searchTimerRef.current) clearInterval(searchTimerRef.current);
            setSearchTime(0);
            setMatchData(data.match);
            setGameState('PLAYING');
            resetRoundState(data.match);
        });

        socket.on('duel:updated', (data) => {
            setMatchData(data.match);
            resetRoundState(data.match);
        });

        socket.on('duel:finished', (data) => {
            setMatchData(data.match);
            setGameState('FINISHED');
            if (timerRef.current) clearInterval(timerRef.current);
            if (searchTimerRef.current) clearInterval(searchTimerRef.current);
        });

        socket.on('duel:error', (err) => {
            setErrorMessage(err.message || 'Lỗi phòng thi đấu');
        });

        return () => {
            socket.disconnect();
            if (timerRef.current) clearInterval(timerRef.current);
            if (searchTimerRef.current) clearInterval(searchTimerRef.current);
        };
    }, [isAuthenticated]);

    // Reset bộ đếm thời gian cho mỗi hiệp
    const resetRoundState = (match) => {
        setSelectedAnswer(null);
        setHasAnsweredRound(false);
        setTimeLeft(10);
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

    // Bắt đầu ghép cặp (Tìm trận)
    const handleStartMatchmaking = async () => {
        const activeUserId = user?._id || user?.id;
        if (!isAuthenticated || !activeUserId) {
            alert('Vui lòng đăng nhập để bước vào Đấu trường Thi Đình');
            return;
        }

        setErrorMessage(null);
        setGameState('SEARCHING');
        setSearchTime(0);

        // Bắt đầu đếm giây tìm kiếm: Sau 10s tự động ghép trận
        if (searchTimerRef.current) clearInterval(searchTimerRef.current);
        searchTimerRef.current = setInterval(() => {
            setSearchTime((prev) => {
                const next = prev + 1;
                if (next >= 10) {
                    if (searchTimerRef.current) clearInterval(searchTimerRef.current);

                    const uid = user?._id || user?.id;
                    if (socketRef.current?.connected) {
                        socketRef.current.emit('duel:request_bot', {
                            userId: uid,
                            name: user?.name,
                            avatar: user?.avatar,
                        });
                    } else {
                        // Fallback REST ghép trận
                        gamificationService.matchmakeBotDuel().then((res) => {
                            if (res.data?.status === 'MATCHED' || res.data?.status === 'IN_MATCH') {
                                setSearchTime(0);
                                setMatchData(res.data.match);
                                setGameState('PLAYING');
                                resetRoundState(res.data.match);
                            }
                        }).catch((err) => {
                            console.error('Lỗi ghép trận:', err);
                        });
                    }
                    return 10;
                }
                return next;
            });
        }, 1000);

        // Bắn event socket join_queue
        if (socketRef.current?.connected) {
            socketRef.current.emit('duel:join_queue', {
                userId: activeUserId,
                name: user?.name,
                avatar: user?.avatar,
            });
        } else {
            // Fallback REST
            try {
                const res = await gamificationService.matchmakeDuel();
                if (res.data.status === 'MATCHED') {
                    if (searchTimerRef.current) clearInterval(searchTimerRef.current);
                    setSearchTime(0);
                    setMatchData(res.data.match);
                    setGameState('PLAYING');
                    resetRoundState(res.data.match);
                }
            } catch (err) {
                setErrorMessage(err.message || 'Lỗi ghép cặp');
                setGameState('IDLE');
                if (searchTimerRef.current) clearInterval(searchTimerRef.current);
            }
        }
    };

    // Hủy tìm trận
    const handleCancelSearch = async () => {
        setGameState('IDLE');
        setSearchTime(0);
        if (searchTimerRef.current) clearInterval(searchTimerRef.current);

        const activeUserId = user?._id || user?.id;
        if (socketRef.current?.connected) {
            socketRef.current.emit('duel:leave_queue', { userId: activeUserId });
        } else {
            await gamificationService.leaveDuelQueue().catch(() => {});
        }
    };

    // Chọn và nộp câu trả lời cho hiệp đấu
    const handleSelectOption = async (optionIndex) => {
        const activeUserId = user?._id || user?.id;
        if (hasAnsweredRoundRef.current || !matchDataRef.current || !activeUserId) return;

        setSelectedAnswer(optionIndex >= 0 ? optionIndex : null);
        setHasAnsweredRound(true);

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
            // Fallback REST
            try {
                const updated = await gamificationService.answerDuelRound(payload);
                setMatchData(updated.data);
                if (updated.data.status === 'FINISHED') {
                    setGameState('FINISHED');
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
                        Ghép cặp thời gian thực cùng các bậc sĩ tử ba miền: 5 câu đố Di sản, 10 giây mỗi hiệp, tốc độ và độ chuẩn xác quyết định ngôi vị Trạng Nguyên.
                    </p>
                </div>

                {errorMessage && (
                    <div className="p-3 bg-red-50 text-red-800 text-xs rounded-2xl border border-red-200 text-center font-medium">
                        {errorMessage}
                    </div>
                )}

                {/* GIAI ĐOẠN 1: MÀN HÌNH CHỜ (IDLE & SEARCHING) */}
                {(gameState === 'IDLE' || gameState === 'SEARCHING') && (
                    <div className="bg-[#fffdf9] rounded-3xl p-8 sm:p-12 border border-amber-900/15 shadow-sm text-center space-y-6 relative overflow-hidden">
                        <span className="absolute top-2 right-2 text-xs text-amber-600/70 font-bold select-none">❖</span>

                        <div className={`w-20 h-20 rounded-full text-amber-100 mx-auto flex items-center justify-center shadow-lg transition-all ${
                            gameState === 'SEARCHING'
                                ? 'bg-gradient-to-tr from-red-700 to-amber-700 ring-8 ring-amber-200 animate-pulse'
                                : 'bg-gradient-to-tr from-amber-600 to-amber-800 ring-8 ring-amber-100'
                        }`}>
                            <Swords className="w-10 h-10" />
                        </div>

                        <div className="space-y-2 max-w-md mx-auto">
                            <h2 className="text-xl sm:text-2xl font-bold font-heritage text-stone-900">
                                {gameState === 'SEARCHING' ? 'Đang Ghép Cặp Sĩ Tử Đối Thủ...' : 'Sẵn Sàng Bước Vào Trường Thi?'}
                            </h2>
                            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                                {gameState === 'SEARCHING'
                                    ? 'Hệ thống đang quét hàng đợi tìm kiếm sĩ tử tương xứng. Vui lòng giữ kết nối.'
                                    : 'Mỗi trận thi đấu gồm 5 câu hỏi Di sản ngẫu nhiên. Trả lời đúng và nhanh nhất để giành chiến thắng và cộng +30 EXP.'}
                            </p>
                        </div>

                        {/* HIỂN THỊ THỜI GIAN GHÉP CẶP & THANH TIẾN ĐỘ */}
                        {gameState === 'SEARCHING' && (
                            <div className="max-w-sm mx-auto space-y-3 pt-1">
                                <div className="flex justify-between items-center text-xs font-semibold">
                                    <span className="text-stone-600 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-amber-800 animate-spin" />
                                        Thời gian tìm kiếm:
                                    </span>
                                    <span className="font-mono text-xs font-bold text-amber-950 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                                        00:{Math.min(10, searchTime).toString().padStart(2, '0')} / 00:10
                                    </span>
                                </div>

                                {/* Thanh Progress Bar 10s */}
                                <div className="w-full bg-stone-200/90 rounded-full h-3 overflow-hidden p-0.5 border border-amber-300/60 shadow-inner">
                                    <div
                                        className="bg-gradient-to-r from-amber-600 via-amber-700 to-red-700 h-full rounded-full transition-all duration-1000 ease-linear shadow-xs"
                                        style={{ width: `${Math.min(100, Math.max(6, (Math.min(10, searchTime) / 10) * 100))}%` }}
                                    ></div>
                                </div>

                                <p className="text-[11px] text-stone-400 italic">
                                    Đang ghép nối với đối thủ phù hợp trong phòng thi...
                                </p>
                            </div>
                        )}

                        <div className="pt-2 flex items-center justify-center gap-3">
                            {gameState === 'SEARCHING' ? (
                                <button
                                    onClick={handleCancelSearch}
                                    className="px-6 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-2"
                                >
                                    <Loader2 className="w-4 h-4 animate-spin text-amber-800" />
                                    <span>Hủy ghép cặp</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleStartMatchmaking}
                                    className="px-8 py-3 bg-gradient-to-r from-red-800 via-red-900 to-amber-900 hover:from-red-700 hover:to-amber-800 text-amber-100 rounded-2xl text-sm font-bold transition shadow-md shadow-red-950/20 flex items-center gap-2"
                                >
                                    <Swords className="w-4 h-4 text-amber-300" />
                                    <span>Vào Thi Đình Ngay</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* GIAI ĐOẠN 2: ĐANG THI ĐẤU (PLAYING) */}
                {gameState === 'PLAYING' && matchData && (
                    <div className="bg-[#fffdf9] rounded-3xl p-6 sm:p-10 border border-amber-900/15 shadow-md space-y-6 relative animate-in fade-in">
                        <span className="absolute top-2 right-2 text-xs text-amber-600/70 font-bold select-none">❖</span>

                        {/* CỤM ĐỐI ĐẦU 2 NGƯỜI CHƠI (VS HEADER) */}
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
                            </div>

                            {/* Đồng hồ đếm ngược 10 giây ở giữa */}
                            <div className="flex flex-col items-center justify-center">
                                <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-heritage font-extrabold text-xl transition-all ${
                                    timeLeft <= 3
                                        ? 'border-red-600 text-red-600 bg-red-50 animate-pulse scale-105'
                                        : 'border-amber-600 text-amber-900 bg-amber-50'
                                }`}>
                                    {timeLeft}s
                                </div>
                                <span className="text-[10px] text-stone-400 mt-1 font-bold">
                                    Câu {matchData.currentQuestionIndex + 1} / 5
                                </span>
                            </div>

                            {/* Đối thủ */}
                            <div className="flex flex-col items-center space-y-1">
                                <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                                    Đối thủ
                                </span>
                                <h3 className="font-heritage font-bold text-sm sm:text-base text-stone-900 truncate max-w-[130px]">
                                    {opponentPlayer?.name || 'Sĩ tử đối đầu'}
                                </h3>
                                <p className="text-xl sm:text-2xl font-extrabold text-stone-700 font-heritage">
                                    {opponentPlayer?.score || 0} đ
                                </p>
                            </div>
                        </div>

                        {/* NỘI DUNG CÂU HỎI HIỆP ĐẤU */}
                        {matchData.currentQuestion && (
                            <div className="space-y-4 pt-2">
                                <div className="text-center">
                                    <span className="text-xs font-semibold text-amber-800">
                                        Thể loại: {matchData.currentQuestion.categoryName}
                                    </span>
                                    <h2 className="text-base sm:text-xl font-bold font-heritage text-stone-900 mt-1.5 leading-relaxed">
                                        {matchData.currentQuestion.question}
                                    </h2>
                                </div>

                                {/* Bốn phương án đáp án */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    {matchData.currentQuestion.options.map((opt, optIdx) => {
                                        const isSelected = selectedAnswer === optIdx;
                                        return (
                                            <button
                                                key={optIdx}
                                                onClick={() => handleSelectOption(optIdx)}
                                                disabled={hasAnsweredRound || timeLeft <= 0}
                                                className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${
                                                    isSelected
                                                        ? 'bg-amber-900 text-amber-50 border-amber-800 shadow-md scale-[1.01]'
                                                        : 'bg-white hover:bg-amber-50/70 border-stone-200 text-stone-800 hover:border-amber-300'
                                                } disabled:cursor-not-allowed`}
                                            >
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                                                    isSelected ? 'bg-amber-800 text-amber-200' : 'bg-stone-100 text-stone-600'
                                                }`}>
                                                    {String.fromCharCode(65 + optIdx)}
                                                </span>
                                                <span className="leading-relaxed">{opt}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {hasAnsweredRound && (
                                    <p className="text-center text-xs text-amber-800 italic pt-2 animate-pulse">
                                        Đã ghi nhận câu trả lời! Đang đợi đối thủ hoặc hoàn thành hiệp đấu...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* GIAI ĐOẠN 3: KẾT THÚC TRẬN ĐẤU (FINISHED) */}
                {gameState === 'FINISHED' && matchData && (
                    <div className="bg-[#fffdf9] rounded-3xl p-8 sm:p-12 border border-amber-900/15 shadow-xl text-center space-y-6 relative animate-in zoom-in-95">
                        <span className="absolute top-2 right-2 text-xs text-amber-600/70 font-bold select-none">❖</span>

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
                                    Cả hai sĩ tử đều có học vấn ngang ngửa. Bạn nhận được +15 EXP!
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
                                    Xuất sắc vượt qua đối thủ! Bạn nhận được +30 EXP và thăng tiến trên Bảng Vàng.
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
                                    Đối thủ có phản xạ nhỉnh hơn. Bạn vẫn nhận được +10 EXP giao lưu học tập.
                                </p>
                            </div>
                        )}

                        {/* Tỷ số chung cuộc */}
                        <div className="flex items-center justify-center gap-8 py-3">
                            <div className="text-center">
                                <p className="text-xs text-stone-500">Điểm của bạn</p>
                                <p className="text-3xl font-extrabold text-amber-900 font-heritage">{myPlayer?.score}</p>
                            </div>
                            <span className="text-stone-300 text-xl font-bold">-</span>
                            <div className="text-center">
                                <p className="text-xs text-stone-500">Đối thủ</p>
                                <p className="text-3xl font-extrabold text-stone-700 font-heritage">{opponentPlayer?.score || 0}</p>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-center gap-3">
                            <button
                                onClick={handleStartMatchmaking}
                                className="px-6 py-2.5 bg-red-900 hover:bg-red-800 text-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                                <span>Thách đấu ván mới</span>
                            </button>
                            <Link
                                to="/bang-vang"
                                className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                            >
                                <Trophy className="w-3.5 h-3.5 text-amber-700" />
                                <span>Xem Bảng Vàng</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* LỊCH SỬ THI ĐẤU GẦN NHẤT */}
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
        </div>
    );
};

export default HeritageArena;
