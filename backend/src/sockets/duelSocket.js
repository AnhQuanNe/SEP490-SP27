const duelService = require('../services/duel.service');
const DuelMatch = require('../models/DuelMatch');

// Các bộ đếm thời gian quản lý trạng thái trận đấu
const queueTimers = new Map();     // userId -> Timeout 10s ghép bot tự động
const countdownTimers = new Map(); // matchId -> Timeout 3s đếm ngược bắt đầu trận
const roundTimers = new Map();     // matchId -> Timeout 11.5s giới hạn mỗi hiệp đấu
const reviewTimers = new Map();    // matchId -> Timeout 3.2s công bố kết quả hiệp trước khi sang câu mới
const forfeitTimers = new Map();   // matchId -> Timeout 6s chờ đối thủ mất kết nối

function clearMatchTimers(matchId) {
    if (!matchId) return;
    if (countdownTimers.has(matchId)) {
        clearTimeout(countdownTimers.get(matchId));
        countdownTimers.delete(matchId);
    }
    if (roundTimers.has(matchId)) {
        clearTimeout(roundTimers.get(matchId));
        roundTimers.delete(matchId);
    }
    if (reviewTimers.has(matchId)) {
        clearTimeout(reviewTimers.get(matchId));
        reviewTimers.delete(matchId);
    }
    if (forfeitTimers.has(matchId)) {
        clearTimeout(forfeitTimers.get(matchId));
        forfeitTimers.delete(matchId);
    }
    duelService.clearBotTimer(matchId);
}

function initDuelSocket(io) {
    const duelNamespace = io.of('/duel');

    /**
     * Phát dữ liệu trận đấu tới từng socket trong phòng với quyền lọc thông tin riêng của mỗi người chơi
     * (Đảm bảo người chơi thấy đáp án đã chọn của chính mình nhưng không thấy của đối thủ trước khi công bố)
     */
    async function emitMatchToRoom(roomName, eventName, rawMatchDoc, extraPayload = {}) {
        try {
            const socketsInRoom = await duelNamespace.in(roomName).fetchSockets();
            if (!socketsInRoom || socketsInRoom.length === 0) {
                duelNamespace.to(roomName).emit(eventName, {
                    ...extraPayload,
                    match: duelService.sanitizeMatchForClient(rawMatchDoc),
                });
                return;
            }

            const isTerminal =
                eventName === 'duel:finished' ||
                rawMatchDoc.status === 'FINISHED' ||
                rawMatchDoc.status === 'CANCELLED';

            for (const sock of socketsInRoom) {
                if (isTerminal) {
                    sock.currentMatchId = null;
                } else {
                    sock.currentMatchId = rawMatchDoc.matchId;
                }

                sock.emit(eventName, {
                    ...extraPayload,
                    match: duelService.sanitizeMatchForClient(rawMatchDoc, sock.currentUserId),
                });
            }
        } catch (err) {
            console.error(`[Duel Socket] Lỗi emit ${eventName}:`, err.message);
        }
    }

    // Lắng nghe sự kiện nội bộ khi bot nộp bài làm hoàn thành hiệp đấu
    duelNamespace.on('internal:round_completed', ({ matchId, match }) => {
        handleRoundCompleted(matchId, match, duelNamespace);
    });

    /**
     * Bắt đầu đếm ngược 3 giây trước khi vào câu hỏi số 1
     */
    function startMatchCountdown(matchId) {
        clearMatchTimers(matchId);
        const roomName = `match_${matchId}`;

        duelNamespace.to(roomName).emit('duel:countdown', {
            matchId,
            countdownSeconds: 3,
        });

        const timer = setTimeout(async () => {
            countdownTimers.delete(matchId);
            try {
                const match = await DuelMatch.findOne({ matchId });
                if (!match || match.status === 'FINISHED' || match.status === 'CANCELLED') return;

                match.status = 'IN_PROGRESS';
                match.currentQuestionIndex = 0;
                match.roundStartTime = new Date();
                await match.save();

                await emitMatchToRoom(roomName, 'duel:round_start', match, { matchId });

                // Đặt giới hạn 11.5 giây cho hiệp 1
                scheduleRoundTimeout(matchId, 0, duelNamespace);

                // Lập lịch cho Bot trả lời hiệp 1 nếu là trận đấu với bot
                if (match.isBotMatch) {
                    duelService.scheduleBotAnswer(
                        matchId,
                        0,
                        duelNamespace,
                        (mId, rawMatch) => handleRoundCompleted(mId, rawMatch, duelNamespace),
                        (mId, rawMatch) => emitMatchToRoom(`match_${mId}`, 'duel:updated', rawMatch),
                        match.botDifficulty || 'medium'
                    );
                }
            } catch (err) {
                console.error('[Duel Socket] Lỗi khởi động hiệp 1:', err.message);
            }
        }, 3000);

        countdownTimers.set(matchId, timer);
    }

    /**
     * Lập lịch tự động nộp bài khi hết 11.5 giây mà người chơi chưa chọn đáp án (Server Timeout)
     */
    function scheduleRoundTimeout(matchId, questionIndex, namespace) {
        if (roundTimers.has(matchId)) {
            clearTimeout(roundTimers.get(matchId));
            roundTimers.delete(matchId);
        }

        const timer = setTimeout(async () => {
            roundTimers.delete(matchId);
            try {
                const match = await DuelMatch.findOne({ matchId });
                if (!match || match.status !== 'IN_PROGRESS' || match.currentQuestionIndex !== questionIndex) {
                    return;
                }

                let hasTimeoutSubmission = false;

                // Tự động nộp bài -1 (timeout) cho Player 1 nếu chưa nộp
                if (!match.player1.answers.some((a) => a.questionIndex === questionIndex)) {
                    match.player1.answers.push({
                        questionIndex,
                        selectedIndex: -1,
                        isCorrect: false,
                        responseTimeMs: 10000,
                        points: 0,
                    });
                    hasTimeoutSubmission = true;
                }

                // Tự động nộp bài -1 (timeout) cho Player 2 nếu chưa nộp
                if (match.player2 && !match.player2.answers.some((a) => a.questionIndex === questionIndex)) {
                    match.player2.answers.push({
                        questionIndex,
                        selectedIndex: -1,
                        isCorrect: false,
                        responseTimeMs: 10000,
                        points: 0,
                    });
                    hasTimeoutSubmission = true;
                }

                if (hasTimeoutSubmission) {
                    match.status = 'ROUND_COMPLETED';
                    await match.save();
                    handleRoundCompleted(matchId, match, namespace);
                }
            } catch (err) {
                console.error('[Duel Socket] Lỗi xử lý round timeout:', err.message);
            }
        }, 11500);

        roundTimers.set(matchId, timer);
    }

    /**
     * Xử lý giai đoạn công bố kết quả hiệp đấu (3.2 giây review) rồi chuyển câu
     */
    function handleRoundCompleted(matchId, rawOrSanitizedMatch, namespace) {
        if (roundTimers.has(matchId)) {
            clearTimeout(roundTimers.get(matchId));
            roundTimers.delete(matchId);
        }
        if (reviewTimers.has(matchId)) {
            clearTimeout(reviewTimers.get(matchId));
            reviewTimers.delete(matchId);
        }
        duelService.clearBotTimer(matchId);

        const roomName = `match_${matchId}`;
        emitMatchToRoom(roomName, 'duel:round_completed', rawOrSanitizedMatch, {
            reviewSeconds: 3,
        });

        const timer = setTimeout(async () => {
            reviewTimers.delete(matchId);
            try {
                const match = await DuelMatch.findOne({ matchId });
                if (!match || match.status === 'FINISHED' || match.status === 'CANCELLED') return;

                const currIdx = match.currentQuestionIndex;
                if (currIdx >= match.questions.length - 1) {
                    // ĐÃ HẾT 5 CÂU HỎI -> KẾT THÚC TRẬN ĐẤU & TRAO EXP
                    await duelService.finishMatch(matchId, namespace);
                    clearMatchTimers(matchId);
                    const socketsInRoom = await namespace.in(roomName).fetchSockets();
                    socketsInRoom.forEach((s) => {
                        s.currentMatchId = null;
                    });
                } else {
                    // CHUYỂN SANG CÂU HỎI KẾ TIẾP
                    match.currentQuestionIndex += 1;
                    match.status = 'IN_PROGRESS';
                    match.roundStartTime = new Date();
                    await match.save();

                    await emitMatchToRoom(roomName, 'duel:next_round', match);

                    // Đặt lịch timeout & bot cho câu mới
                    scheduleRoundTimeout(matchId, match.currentQuestionIndex, namespace);
                    if (match.isBotMatch) {
                        duelService.scheduleBotAnswer(
                            matchId,
                            match.currentQuestionIndex,
                            namespace,
                            (mId, rawMatch) => handleRoundCompleted(mId, rawMatch, namespace),
                            (mId, rawMatch) => emitMatchToRoom(`match_${mId}`, 'duel:updated', rawMatch),
                            match.botDifficulty || 'medium'
                        );
                    }
                }
            } catch (err) {
                console.error('[Duel Socket] Lỗi chuyển hiệp đấu:', err.message);
            }
        }, 3200);

        reviewTimers.set(matchId, timer);
    }

    duelNamespace.on('connection', (socket) => {
        socket.currentUserId = null;
        socket.currentMatchId = null;

        const clearQueueTimer = (userId) => {
            if (userId && queueTimers.has(userId.toString())) {
                clearTimeout(queueTimers.get(userId.toString()));
                queueTimers.delete(userId.toString());
            }
        };

        // Người chơi tham gia hàng đợi ghép cặp ngẫu nhiên
        socket.on('duel:join_queue', async (data) => {
            try {
                const userId = data?.userId;
                const name = data?.name || 'Sĩ tử';
                const avatar = data?.avatar || '';

                if (!userId) {
                    socket.emit('duel:error', { message: 'Không tìm thấy thông tin sĩ tử. Vui lòng đăng nhập lại.' });
                    return;
                }

                socket.currentUserId = userId;
                clearQueueTimer(userId);

                const result = await duelService.joinMatchmaking({
                    userId,
                    name,
                    avatar,
                    socketId: socket.id,
                });

                if (result.status === 'MATCHED') {
                    socket.currentMatchId = result.matchId;
                    const roomName = `match_${result.matchId}`;
                    socket.join(roomName);

                    if (result.opponent && result.opponent.userId) {
                        clearQueueTimer(result.opponent.userId);
                    }
                    if (result.opponent && result.opponent.socketId) {
                        const oppSocket = duelNamespace.sockets.get(result.opponent.socketId);
                        if (oppSocket) {
                            oppSocket.join(roomName);
                            oppSocket.currentMatchId = result.matchId;
                        }
                    }

                    await emitMatchToRoom(roomName, 'duel:matched', result.rawMatch || result.match, {
                        matchId: result.matchId,
                        isBot: false,
                        countdownSeconds: 3,
                    });

                    startMatchCountdown(result.matchId);
                } else if (result.status === 'IN_MATCH') {
                    socket.currentMatchId = result.match.matchId;
                    const roomName = `match_${result.match.matchId}`;
                    socket.join(roomName);

                    // Hủy bộ đếm forfeit nếu người chơi kết nối lại kịp thời
                    if (forfeitTimers.has(result.match.matchId)) {
                        clearTimeout(forfeitTimers.get(result.match.matchId));
                        forfeitTimers.delete(result.match.matchId);
                    }

                    socket.emit('duel:in_match', { match: result.match });
                } else {
                    socket.emit('duel:waiting', { message: result.message, queueLength: result.queueLength });

                    // BẮT ĐẦU ĐẾM 10 GIÂY: Sau 10s tự động ghép với Trạng Nguyên AI
                    const timer = setTimeout(async () => {
                        queueTimers.delete(userId.toString());
                        if (duelService.isUserInQueue(userId)) {
                            try {
                                const botResult = await duelService.createBotMatch({
                                    userId,
                                    name,
                                    avatar,
                                    socketId: socket.id,
                                    botDifficulty: data?.botDifficulty || 'medium',
                                    questionCount: data?.questionCount || 5,
                                });

                                if (botResult && botResult.status === 'MATCHED') {
                                    socket.currentMatchId = botResult.matchId;
                                    const roomName = `match_${botResult.matchId}`;
                                    socket.join(roomName);

                                    await emitMatchToRoom(roomName, 'duel:matched', botResult.rawMatch || botResult.match, {
                                        matchId: botResult.matchId,
                                        isBot: true,
                                        countdownSeconds: 3,
                                    });

                                    startMatchCountdown(botResult.matchId);
                                }
                            } catch (botErr) {
                                console.error('[Duel Socket] Lỗi tự động ghép bot:', botErr.message);
                            }
                        }
                    }, 10000);

                    queueTimers.set(userId.toString(), timer);
                }
            } catch (err) {
                console.error('[Duel Socket] Lỗi join queue:', err);
                socket.emit('duel:error', { message: err.message });
            }
        });

        // Người chơi yêu cầu thách đấu ngay với Bot AI
        socket.on('duel:request_bot', async (data) => {
            try {
                const userId = data?.userId || socket.currentUserId;
                if (!userId) return;

                socket.currentUserId = userId;
                clearQueueTimer(userId);

                // Nếu đang tham gia trận cũ thì xóa timer trận cũ trước
                if (socket.currentMatchId) {
                    clearMatchTimers(socket.currentMatchId);
                    socket.leave(`match_${socket.currentMatchId}`);
                }

                const botResult = await duelService.createBotMatch({
                    userId,
                    name: data?.name || 'Sĩ tử',
                    avatar: data?.avatar || '',
                    socketId: socket.id,
                    botDifficulty: data?.botDifficulty || 'medium',
                    questionCount: data?.questionCount || 5,
                });

                if (botResult && botResult.status === 'MATCHED') {
                    socket.currentMatchId = botResult.matchId;
                    const roomName = `match_${botResult.matchId}`;
                    socket.join(roomName);

                    await emitMatchToRoom(roomName, 'duel:matched', botResult.rawMatch || botResult.match, {
                        matchId: botResult.matchId,
                        isBot: true,
                        countdownSeconds: 3,
                    });

                    startMatchCountdown(botResult.matchId);
                }
            } catch (err) {
                console.error('[Duel Socket] Lỗi yêu cầu ghép bot:', err.message);
                socket.emit('duel:error', { message: err.message || 'Lỗi ghép với Danh Nho AI' });
            }
        });

        // Tạo phòng riêng với bạn bè (Sinh mã 6 số)
        socket.on('duel:create_private_room', async (data) => {
            try {
                const userId = data?.userId || socket.currentUserId;
                if (!userId) {
                    socket.emit('duel:error', { message: 'Vui lòng đăng nhập để tạo phòng' });
                    return;
                }
                socket.currentUserId = userId;
                clearQueueTimer(userId);

                const result = await duelService.createPrivateRoom({
                    userId,
                    name: data?.name || 'Sĩ tử',
                    avatar: data?.avatar || '',
                    socketId: socket.id,
                    questionCount: data?.questionCount || 5,
                });

                socket.currentMatchId = result.matchId;
                const roomName = `match_${result.matchId}`;
                socket.join(roomName);

                socket.emit('duel:room_created', {
                    roomCode: result.roomCode,
                    matchId: result.matchId,
                    match: result.match,
                });
            } catch (err) {
                console.error('[Duel Socket] Lỗi tạo phòng riêng:', err.message);
                socket.emit('duel:error', { message: err.message });
            }
        });

        // Tham gia phòng riêng bằng mã 6 số
        socket.on('duel:join_private_room', async (data) => {
            try {
                const userId = data?.userId || socket.currentUserId;
                const roomCode = data?.roomCode;

                if (!userId || !roomCode) {
                    socket.emit('duel:error', { message: 'Thiếu mã phòng hoặc thông tin tài khoản' });
                    return;
                }
                socket.currentUserId = userId;
                clearQueueTimer(userId);

                const result = await duelService.joinPrivateRoom({
                    roomCode,
                    userId,
                    name: data?.name || 'Sĩ tử',
                    avatar: data?.avatar || '',
                    socketId: socket.id,
                });

                socket.currentMatchId = result.matchId;
                const roomName = `match_${result.matchId}`;
                socket.join(roomName);

                // Cập nhật currentMatchId cho chủ phòng đang đợi
                const socketsInRoom = await duelNamespace.in(roomName).fetchSockets();
                socketsInRoom.forEach((s) => {
                    s.currentMatchId = result.matchId;
                });

                // Thông báo tới cả 2 người chơi trong phòng
                await emitMatchToRoom(roomName, 'duel:matched', result.rawMatch || result.match, {
                    matchId: result.matchId,
                    isBot: false,
                    countdownSeconds: 3,
                });

                startMatchCountdown(result.matchId);
            } catch (err) {
                console.error('[Duel Socket] Lỗi tham gia phòng riêng:', err.message);
                socket.emit('duel:error', { message: err.message });
            }
        });

        // Hủy ghép cặp
        socket.on('duel:leave_queue', (data) => {
            const uid = socket.currentUserId || data?.userId;
            clearQueueTimer(uid);
            if (uid) {
                duelService.leaveQueue(uid);
                socket.emit('duel:queue_left', { success: true });
            }
        });

        // Hủy trận đấu hoặc rời phòng chờ chủ động
        socket.on('duel:cancel_match', async (data) => {
            try {
                const matchId = data?.matchId || socket.currentMatchId;
                const userId = data?.userId || socket.currentUserId;
                if (!matchId) return;

                clearMatchTimers(matchId);
                const roomName = `match_${matchId}`;
                socket.leave(roomName);
                socket.currentMatchId = null;

                const result = await duelService.cancelMatch(matchId, userId);
                if (result?.action === 'FORFEIT') {
                    await duelService.forfeitMatch(matchId, userId, duelNamespace);
                }
            } catch (err) {
                console.warn('[Duel Socket] Lỗi hủy trận đấu:', err.message);
            }
        });

        // Người chơi gửi câu trả lời
        socket.on('duel:submit_answer', async (data) => {
            try {
                const { matchId, userId, questionIndex, selectedIndex, responseTimeMs } = data;
                if (userId) socket.currentUserId = userId;
                socket.currentMatchId = matchId;

                const updatedRawMatch = await duelService.submitRoundAnswerInternal({
                    matchId,
                    userId,
                    questionIndex,
                    selectedIndex,
                    clientResponseTimeMs: responseTimeMs,
                });

                const roomName = `match_${matchId}`;
                if (updatedRawMatch.status === 'ROUND_COMPLETED') {
                    // Cả 2 đã nộp bài -> Kích hoạt công bố kết quả hiệp đấu (3s review)
                    handleRoundCompleted(matchId, updatedRawMatch, duelNamespace);
                } else {
                    // Mới có 1 người nộp bài -> Cập nhật trạng thái chờ đối thủ (mã hóa từng user riêng biệt)
                    await emitMatchToRoom(roomName, 'duel:updated', updatedRawMatch);
                }
            } catch (err) {
                console.error('[Duel Socket] Lỗi submit answer:', err.message);
                socket.emit('duel:error', { message: err.message });
            }
        });

        // Ngắt kết nối
        socket.on('disconnect', async () => {
            const userId = socket.currentUserId;
            const matchId = socket.currentMatchId;

            clearQueueTimer(userId);
            if (userId) {
                duelService.leaveQueue(userId);
            }

            if (matchId) {
                try {
                    const match = await DuelMatch.findOne({ matchId }).lean();
                    if (!match || match.status === 'FINISHED' || match.status === 'CANCELLED') {
                        return;
                    }

                    // Nếu là phòng chờ riêng hoặc trận Bot -> không xử forfeit thắng/thua PvP, dọn sạch sau 15s nếu không quay lại
                    if (match.status === 'WAITING' || match.isBotMatch) {
                        clearMatchTimers(matchId);
                        await DuelMatch.updateOne(
                            { matchId, status: { $in: ['WAITING', 'COUNTDOWN', 'IN_PROGRESS', 'ROUND_COMPLETED'] } },
                            { $set: { status: 'CANCELLED', endedAt: new Date() } }
                        );
                        return;
                    }

                    // Trận PvP thực tế giữa 2 người chơi -> thông báo & đếm ngược 6s xử thua
                    const roomName = `match_${matchId}`;
                    socket.to(roomName).emit('duel:opponent_disconnected', {
                        message: 'Đối thủ đã mất kết nối tạm thời. Chờ kết nối lại trong 6 giây...',
                    });

                    const timer = setTimeout(async () => {
                        forfeitTimers.delete(matchId);
                        try {
                            await duelService.forfeitMatch(matchId, userId, duelNamespace);
                            clearMatchTimers(matchId);
                        } catch (forfeitErr) {
                            console.error('[Duel Socket] Lỗi forfeit khi disconnect:', forfeitErr.message);
                        }
                    }, 6000);

                    forfeitTimers.set(matchId, timer);
                } catch (err) {
                    console.warn('[Duel Socket] Lỗi xử lý disconnect:', err.message);
                }
            }
        });
    });
}

module.exports = { initDuelSocket };
