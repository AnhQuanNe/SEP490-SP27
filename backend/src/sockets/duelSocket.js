const duelService = require('../services/duel.service');

// Map lưu timer 10s tự động ghép Bot cho từng user: userId -> NodeJS.Timeout
const queueTimers = new Map();

function initDuelSocket(io) {
    const duelNamespace = io.of('/duel');

    duelNamespace.on('connection', (socket) => {
        let currentUserId = null;
        let currentMatchId = null;

        const clearQueueTimer = (userId) => {
            if (userId && queueTimers.has(userId.toString())) {
                clearTimeout(queueTimers.get(userId.toString()));
                queueTimers.delete(userId.toString());
            }
        };

        // Người chơi đăng ký vào hàng đợi ghép cặp
        socket.on('duel:join_queue', async (data) => {
            try {
                const userId = data?.userId;
                const name = data?.name || 'Sĩ tử';
                const avatar = data?.avatar || '';

                if (!userId) {
                    console.warn('[Duel Socket] join_queue bị từ chối do thiếu userId');
                    socket.emit('duel:error', { message: 'Không tìm thấy mã người dùng. Vui lòng đăng nhập lại.' });
                    return;
                }

                currentUserId = userId;
                clearQueueTimer(userId);

                const result = await duelService.joinMatchmaking({
                    userId,
                    name,
                    avatar,
                    socketId: socket.id,
                });

                if (result.status === 'MATCHED') {
                    // Đã ghép được với người thật!
                    currentMatchId = result.matchId;
                    const roomName = `match_${result.matchId}`;

                    socket.join(roomName);

                    // Xóa timer của đối thủ nếu đối thủ đang đợi
                    if (result.opponent && result.opponent.userId) {
                        clearQueueTimer(result.opponent.userId);
                    }

                    // Thông báo tới đối thủ (nếu socket của đối thủ đang active)
                    if (result.opponent && result.opponent.socketId) {
                        const oppSocket = duelNamespace.sockets.get(result.opponent.socketId);
                        if (oppSocket) {
                            oppSocket.join(roomName);
                        }
                    }

                    duelNamespace.to(roomName).emit('duel:matched', {
                        matchId: result.matchId,
                        match: result.match,
                        isBot: false,
                    });
                } else if (result.status === 'IN_MATCH') {
                    currentMatchId = result.match.matchId;
                    socket.join(`match_${currentMatchId}`);
                    socket.emit('duel:in_match', { match: result.match });
                } else {
                    socket.emit('duel:waiting', { message: result.message, queueLength: result.queueLength });

                    // BẮT ĐẦU ĐẾM 10 GIÂY: Nếu sau 10s chưa tìm thấy đối thủ thật, tự động ghép với BOT
                    const timer = setTimeout(async () => {
                        queueTimers.delete(userId.toString());
                        if (duelService.isUserInQueue(userId)) {
                            try {
                                console.log(`[Duel Socket] Hết 10s tìm kiếm, tự động ghép với Trạng Nguyên AI cho userId: ${userId}`);
                                const botResult = await duelService.createBotMatch({
                                    userId,
                                    name,
                                    avatar,
                                    socketId: socket.id,
                                });

                                if (botResult && (botResult.status === 'MATCHED' || botResult.status === 'IN_MATCH')) {
                                    currentMatchId = botResult.matchId;
                                    const roomName = `match_${botResult.matchId}`;
                                    socket.join(roomName);

                                    duelNamespace.to(roomName).emit('duel:matched', {
                                        matchId: botResult.matchId,
                                        match: botResult.match,
                                        isBot: true,
                                    });

                                    // Khởi động lượt trả lời đầu tiên của Bot
                                    duelService.scheduleBotAnswer(botResult.matchId, 0, duelNamespace);
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

        // Người chơi yêu cầu ghép ngay với Bot (hoặc khi đồng hồ 10s client chạm đích)
        socket.on('duel:request_bot', async (data) => {
            try {
                const userId = data?.userId || currentUserId;
                if (!userId) return;

                clearQueueTimer(userId);

                console.log(`[Duel Socket] Nhận yêu cầu ghép bot trực tiếp cho userId: ${userId}`);
                const botResult = await duelService.createBotMatch({
                    userId,
                    name: data?.name || 'Sĩ tử',
                    avatar: data?.avatar || '',
                    socketId: socket.id,
                });

                if (botResult && (botResult.status === 'MATCHED' || botResult.status === 'IN_MATCH')) {
                    currentMatchId = botResult.matchId;
                    const roomName = `match_${botResult.matchId}`;
                    socket.join(roomName);

                    duelNamespace.to(roomName).emit('duel:matched', {
                        matchId: botResult.matchId,
                        match: botResult.match,
                        isBot: true,
                    });

                    duelService.scheduleBotAnswer(botResult.matchId, 0, duelNamespace);
                }
            } catch (err) {
                console.error('[Duel Socket] Lỗi yêu cầu ghép bot:', err.message);
            }
        });

        // Người chơi hủy ghép cặp
        socket.on('duel:leave_queue', (data) => {
            const uid = currentUserId || data?.userId;
            clearQueueTimer(uid);
            if (uid) {
                duelService.leaveQueue(uid);
                socket.emit('duel:queue_left', { success: true });
            }
        });

        // Người chơi gửi câu trả lời
        socket.on('duel:submit_answer', async (data) => {
            try {
                const { matchId, userId, questionIndex, selectedIndex, responseTimeMs } = data;
                currentMatchId = matchId;

                const updatedMatch = await duelService.submitRoundAnswer({
                    matchId,
                    userId,
                    questionIndex,
                    selectedIndex,
                    clientResponseTimeMs: responseTimeMs,
                });

                const roomName = `match_${matchId}`;
                if (updatedMatch.status === 'FINISHED') {
                    duelNamespace.to(roomName).emit('duel:finished', { match: updatedMatch });
                } else {
                    duelNamespace.to(roomName).emit('duel:updated', { match: updatedMatch });

                    // Nếu trận đấu có bot và vòng đấu vừa tăng lên, lập lịch cho bot trả lời câu mới
                    if (updatedMatch.isBotMatch && updatedMatch.currentQuestionIndex > questionIndex) {
                        duelService.scheduleBotAnswer(matchId, updatedMatch.currentQuestionIndex, duelNamespace);
                    }
                }
            } catch (err) {
                console.error('[Duel Socket] Lỗi submit answer:', err);
                socket.emit('duel:error', { message: err.message });
            }
        });

        // Ngắt kết nối
        socket.on('disconnect', () => {
            clearQueueTimer(currentUserId);
            if (currentUserId) {
                duelService.leaveQueue(currentUserId);
            }
            if (currentMatchId) {
                socket.to(`match_${currentMatchId}`).emit('duel:opponent_disconnected', {
                    message: 'Đối thủ đã mất kết nối tạm thời.',
                });
            }
        });
    });
}

module.exports = { initDuelSocket };
