const mongoose = require('mongoose');
const DuelMatch = require('../models/DuelMatch');
const quizService = require('./quiz.service');
const experienceService = require('./experience.service');
const { v4: uuidv4 } = require('crypto');

// ID cố định cho sĩ tử Bot để lưu vào MongoDB
const BOT_USER_ID = new mongoose.Types.ObjectId('000000000000000000000b07');

// Danh sách danh nho cổ đại làm hình mẫu cho sĩ tử đối đầu
const BOT_PROFILES = [
    {
        name: 'Nguyễn Bỉnh Khiêm',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nguyenbinhkhiem',
        accuracy: 0.8,
    },
    {
        name: 'Lê Quý Đôn',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lequydon',
        accuracy: 0.75,
    },
    {
        name: 'Lương Thế Vinh',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=luongthevinh',
        accuracy: 0.7,
    },
    {
        name: 'Chu Văn An',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=chuvanan',
        accuracy: 0.85,
    },
    {
        name: 'Mạc Đĩnh Chi',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=macdinhchi',
        accuracy: 0.8,
    },
    {
        name: 'Nguyễn Hiền',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nguyenhien',
        accuracy: 0.75,
    },
];

// Bộ đếm thời gian trả lời của Bot: matchId -> NodeJS.Timeout
const botTimers = new Map();

function isBotUser(userId) {
    if (!userId) return false;
    return userId.toString() === BOT_USER_ID.toString();
}

// Hàng đợi ghép cặp trong RAM để phản hồi tức thì
let waitingQueue = []; // [{ userId, name, avatar, socketId, joinTime }]

function isUserInQueue(userId) {
    if (!userId) return false;
    return waitingQueue.some((p) => p.userId && p.userId.toString() === userId.toString());
}

/**
 * Lấy ngẫu nhiên 5 câu hỏi từ ngân hàng câu hỏi di sản
 */
async function generateDuelQuestions() {
    // Lấy 5 câu hỏi đầy đủ (gồm cả đáp án đúng để server chấm điểm)
    const questions = await quizService.getQuestions({ count: 5 });
    
    // Tìm đáp án đúng từ QUIZ_QUESTION_BANK
    // (quizService.getQuestions ẩn correctIndex, nên ta cần ánh xạ lại)
    const bank = quizService.QUIZ_QUESTION_BANK || [];
    const bankMap = {};
    bank.forEach((q) => {
        bankMap[q.id] = q;
    });

    return questions.map((q) => {
        const original = bankMap[q.id];
        return {
            id: q.id,
            question: q.question,
            options: q.options,
            correctIndex: original ? original.correctIndex : 0,
            explanation: original ? original.explanation : 'Kiến thức văn hóa dân gian Việt Nam.',
            categoryName: q.categoryName || 'Di sản',
        };
    });
}

/**
 * Tìm hoặc tạo phòng đấu Thi Đình
 */
async function joinMatchmaking({ userId, name, avatar, socketId = null }) {
    if (!userId) {
        throw new Error('Không tìm thấy thông tin sĩ tử (vui lòng đăng nhập lại)');
    }

    // 1. Kiểm tra xem người chơi có đang trong hàng đợi không
    const queueIndex = waitingQueue.findIndex((p) => p.userId && p.userId.toString() === userId.toString());
    if (queueIndex !== -1) {
        // Cập nhật socketId nếu đổi kết nối
        waitingQueue[queueIndex].socketId = socketId;
        return { status: 'WAITING', message: 'Đang đợi đối thủ vào phòng thi...', queueLength: waitingQueue.length };
    }

    // 2. Kiểm tra xem có trận đấu đang dở dang không
    const existingActiveMatch = await DuelMatch.findOne({
        $or: [{ 'player1.userId': userId }, { 'player2.userId': userId }],
        status: { $in: ['MATCHED', 'COUNTDOWN', 'IN_PROGRESS'] },
    }).sort({ createdAt: -1 });

    if (existingActiveMatch) {
        return {
            status: 'IN_MATCH',
            match: sanitizeMatchForClient(existingActiveMatch, userId),
        };
    }

    // 3. Nếu có người đang đợi trong hàng đợi (khác chính mình)
    const opponentIndex = waitingQueue.findIndex((p) => p.userId && p.userId.toString() !== userId.toString());
    if (opponentIndex !== -1) {
        const opponent = waitingQueue.splice(opponentIndex, 1)[0];
        
        // Tạo phòng đấu mới
        const matchId = 'thi-dinh-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const questions = await generateDuelQuestions();

        const newMatch = await DuelMatch.create({
            matchId,
            player1: {
                userId: opponent.userId,
                name: opponent.name,
                avatar: opponent.avatar,
                score: 0,
                answers: [],
            },
            player2: {
                userId,
                name,
                avatar,
                score: 0,
                answers: [],
            },
            questions,
            status: 'MATCHED',
            currentQuestionIndex: 0,
            roundStartTime: new Date(),
        });

        return {
            status: 'MATCHED',
            matchId,
            match: sanitizeMatchForClient(newMatch, userId),
            opponent,
        };
    }

    // 4. Nếu chưa có ai đợi, đưa vào hàng đợi
    waitingQueue.push({
        userId,
        name,
        avatar,
        socketId,
        joinTime: Date.now(),
    });

    return {
        status: 'WAITING',
        message: 'Đã vào hàng đợi, đang tìm sĩ tử tranh tài...',
        queueLength: waitingQueue.length,
    };
}

/**
 * Hủy hàng đợi ghép cặp
 */
function leaveQueue(userId) {
    if (!userId) return false;
    const initialLen = waitingQueue.length;
    waitingQueue = waitingQueue.filter((p) => p.userId && p.userId.toString() !== userId.toString());
    return waitingQueue.length < initialLen;
}

/**
 * Tạo phòng thi đấu trực tiếp với Bot sĩ tử danh nho AI
 */
async function createBotMatch({ userId, name, avatar, socketId = null }) {
    if (!userId) {
        throw new Error('Không tìm thấy thông tin sĩ tử (vui lòng đăng nhập lại)');
    }

    // 1. Loại bỏ người chơi khỏi hàng đợi nếu đang chờ
    leaveQueue(userId);

    // 2. Kiểm tra xem người chơi có trận đấu dở dang không
    const existingActiveMatch = await DuelMatch.findOne({
        $or: [{ 'player1.userId': userId }, { 'player2.userId': userId }],
        status: { $in: ['MATCHED', 'COUNTDOWN', 'IN_PROGRESS'] },
    }).sort({ createdAt: -1 });

    if (existingActiveMatch) {
        return {
            status: 'IN_MATCH',
            matchId: existingActiveMatch.matchId,
            match: sanitizeMatchForClient(existingActiveMatch, userId),
            opponent: existingActiveMatch.player1.userId.toString() === userId.toString()
                ? existingActiveMatch.player2
                : existingActiveMatch.player1,
            isBot: true,
        };
    }

    // 3. Chọn ngẫu nhiên một danh sĩ AI
    const botProfile = BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)];
    const matchId = 'thi-dinh-bot-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const questions = await generateDuelQuestions();

    const newMatch = await DuelMatch.create({
        matchId,
        player1: {
            userId,
            name,
            avatar,
            score: 0,
            answers: [],
            isBot: false,
        },
        player2: {
            userId: BOT_USER_ID,
            name: botProfile.name,
            avatar: botProfile.avatar,
            score: 0,
            answers: [],
            isBot: true,
        },
        questions,
        status: 'MATCHED',
        currentQuestionIndex: 0,
        roundStartTime: new Date(),
        isBotMatch: true,
    });

    return {
        status: 'MATCHED',
        matchId,
        match: sanitizeMatchForClient(newMatch, userId),
        opponent: {
            userId: BOT_USER_ID,
            name: botProfile.name,
            avatar: botProfile.avatar,
            isBot: true,
        },
        isBot: true,
    };
}

/**
 * Lập lịch để Bot suy nghĩ và tự động nộp câu trả lời sau 2.5s - 5s
 */
function scheduleBotAnswer(matchId, questionIndex, duelNamespace) {
    if (botTimers.has(matchId)) {
        clearTimeout(botTimers.get(matchId));
        botTimers.delete(matchId);
    }

    // Bot suy nghĩ từ 2.5s đến 5.5s
    const delay = Math.floor(Math.random() * 3000) + 2500;

    const timer = setTimeout(async () => {
        try {
            botTimers.delete(matchId);

            const match = await DuelMatch.findOne({ matchId });
            if (!match || match.status === 'FINISHED' || match.status === 'CANCELLED') {
                return;
            }

            // Đảm bảo vẫn ở đúng câu hỏi cần trả lời
            if (match.currentQuestionIndex !== questionIndex) {
                return;
            }

            // Kiểm tra bot đã nộp câu này chưa
            const botPlayer = match.player2?.isBot ? match.player2 : (match.player1?.isBot ? match.player1 : null);
            if (!botPlayer) return;

            const alreadyAnswered = botPlayer.answers.some((a) => a.questionIndex === questionIndex);
            if (alreadyAnswered) return;

            const question = match.questions[questionIndex];
            if (!question) return;

            // Xác suất đúng ~75%
            const isCorrect = Math.random() < 0.75;
            let selectedIndex = question.correctIndex;
            if (!isCorrect && question.options.length > 1) {
                const wrongIndices = [0, 1, 2, 3].filter((idx) => idx !== question.correctIndex && idx < question.options.length);
                selectedIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)] ?? 0;
            }

            const updatedMatch = await submitRoundAnswer({
                matchId,
                userId: BOT_USER_ID,
                questionIndex,
                selectedIndex,
                clientResponseTimeMs: delay,
            });

            const roomName = `match_${matchId}`;
            if (updatedMatch.status === 'FINISHED') {
                if (botTimers.has(matchId)) {
                    clearTimeout(botTimers.get(matchId));
                    botTimers.delete(matchId);
                }
                duelNamespace.to(roomName).emit('duel:finished', { match: updatedMatch });
            } else {
                duelNamespace.to(roomName).emit('duel:updated', { match: updatedMatch });

                // Nếu vừa chuyển sang câu hỏi tiếp theo
                if (updatedMatch.currentQuestionIndex > questionIndex) {
                    scheduleBotAnswer(matchId, updatedMatch.currentQuestionIndex, duelNamespace);
                }
            }
        } catch (err) {
            console.error('[Duel Bot] Lỗi khi Bot nộp đáp án:', err.message);
        }
    }, delay);

    botTimers.set(matchId, timer);
}

/**
 * Ẩn đáp án đúng của các câu hỏi chưa đến lượt hiển thị trước khi gửi về client
 */
function sanitizeMatchForClient(match, currentUserId) {
    const doc = match.toObject ? match.toObject() : match;
    const currIdx = doc.currentQuestionIndex || 0;

    const safeQuestions = doc.questions.map((q, qIdx) => {
        // Chỉ gửi đáp án đúng và lời giải thích khi câu hỏi đó ĐÃ qua
        const hasPassed = qIdx < currIdx || doc.status === 'FINISHED';
        return {
            id: q.id,
            question: q.question,
            options: q.options,
            categoryName: q.categoryName,
            correctIndex: hasPassed ? q.correctIndex : undefined,
            explanation: hasPassed ? q.explanation : undefined,
        };
    });

    return {
        matchId: doc.matchId,
        status: doc.status,
        currentQuestionIndex: doc.currentQuestionIndex,
        roundStartTime: doc.roundStartTime,
        timeLimitSeconds: 10,
        isBotMatch: !!doc.isBotMatch,
        player1: {
            userId: doc.player1.userId,
            name: doc.player1.name,
            avatar: doc.player1.avatar,
            score: doc.player1.score,
            answeredCount: doc.player1.answers.length,
            isBot: !!doc.player1.isBot,
        },
        player2: doc.player2 ? {
            userId: doc.player2.userId,
            name: doc.player2.name,
            avatar: doc.player2.avatar,
            score: doc.player2.score,
            answeredCount: doc.player2.answers.length,
            isBot: !!doc.player2.isBot,
        } : null,
        currentQuestion: safeQuestions[currIdx] || null,
        questions: safeQuestions,
        winnerId: doc.winnerId,
        isTie: doc.isTie,
        endedAt: doc.endedAt,
    };
}

/**
 * Gửi câu trả lời của 1 hiệp đấu
 */
async function submitRoundAnswer({ matchId, userId, questionIndex, selectedIndex, clientResponseTimeMs = 5000 }) {
    const match = await DuelMatch.findOne({ matchId });
    if (!match) {
        throw new Error('Không tìm thấy phòng thi đấu');
    }

    if (match.status === 'FINISHED' || match.status === 'CANCELLED') {
        throw new Error('Trận đấu đã kết thúc');
    }

    // Xác định người chơi là player1 hay player2
    const isPlayer1 = match.player1.userId.toString() === userId.toString();
    const isPlayer2 = match.player2 && match.player2.userId.toString() === userId.toString();

    if (!isPlayer1 && !isPlayer2) {
        throw new Error('Bạn không phải là sĩ tử trong phòng thi này');
    }

    const playerKey = isPlayer1 ? 'player1' : 'player2';
    const playerObj = match[playerKey];

    // Chặn gửi nhiều lần cho cùng 1 câu hỏi
    const alreadyAnswered = playerObj.answers.some((a) => a.questionIndex === questionIndex);
    if (alreadyAnswered) {
        return sanitizeMatchForClient(match, userId);
    }

    // Kiểm tra thời gian máy chủ (Server authoritative)
    const now = new Date();
    const roundStart = match.roundStartTime ? new Date(match.roundStartTime) : now;
    const elapsedMs = Math.max(0, now.getTime() - roundStart.getTime());

    // Thời hạn 10 giây (cho thêm 1.5 giây độ trễ mạng)
    const isTimeout = elapsedMs > 11500;

    const question = match.questions[questionIndex];
    if (!question) {
        throw new Error('Câu hỏi không tồn tại');
    }

    // Nếu selectedIndex < 0 nghĩa là người chơi hết giờ không chọn kịp
    const isCorrect = !isTimeout && selectedIndex >= 0 && selectedIndex === question.correctIndex;

    // Tính điểm: 100 điểm cơ bản + tối đa 50 điểm tốc độ
    let points = 0;
    if (isCorrect) {
        const speedBonus = Math.round(50 * Math.max(0, (10000 - elapsedMs) / 10000));
        points = 100 + speedBonus;
    }

    playerObj.answers.push({
        questionIndex,
        selectedIndex,
        isCorrect,
        responseTimeMs: elapsedMs,
        points,
    });
    playerObj.score += points;

    // Kiểm tra xem cả hai người chơi đã trả lời câu hỏi hiện tại chưa
    const otherKey = isPlayer1 ? 'player2' : 'player1';
    const otherPlayer = match[otherKey];
    const otherAnswered = otherPlayer?.answers.some((a) => a.questionIndex === questionIndex);

    // Nếu cả 2 đã trả lời xong câu này
    if (otherAnswered) {
        if (questionIndex >= match.questions.length - 1) {
            // Đã hoàn thành tất cả 5 câu -> KẾT THÚC TRẬN ĐẤU
            match.status = 'FINISHED';
            match.endedAt = new Date();

            if (match.player1.score > match.player2.score) {
                match.winnerId = match.player1.userId;
            } else if (match.player2.score > match.player1.score) {
                match.winnerId = match.player2.userId;
            } else {
                match.isTie = true;
            }

            // Trao thưởng EXP cho người chơi thật (bỏ qua bot)
            try {
                if (match.winnerId) {
                    const loserId = match.winnerId.toString() === match.player1.userId.toString()
                        ? match.player2.userId
                        : match.player1.userId;

                    // Thưởng thắng: +30 EXP (chỉ trao cho người thật)
                    if (!isBotUser(match.winnerId)) {
                        await experienceService.awardExperience({
                            userId: match.winnerId,
                            actionType: 'DUEL_VICTORY',
                            targetId: `duel-${match.matchId}`,
                            description: `Chiến thắng rạng rỡ tại Đấu trường Thi Đình (${match.matchId})`,
                        });
                    }

                    // Thưởng tham gia: +10 EXP (chỉ trao cho người thật)
                    if (!isBotUser(loserId)) {
                        await experienceService.awardExperience({
                            userId: loserId,
                            actionType: 'DUEL_PARTICIPATE',
                            targetId: `duel-${match.matchId}`,
                            description: `Tham gia giao lưu tại Đấu trường Thi Đình (${match.matchId})`,
                        });
                    }
                } else {
                    // Hòa trận: Cả hai nhận +15 EXP (chỉ trao cho người thật)
                    if (!isBotUser(match.player1.userId)) {
                        await experienceService.awardExperience({
                            userId: match.player1.userId,
                            actionType: 'DUEL_PARTICIPATE',
                            targetId: `duel-${match.matchId}`,
                            description: `Hòa trận kịch tính tại Đấu trường Thi Đình (${match.matchId})`,
                        });
                    }
                    if (match.player2 && !isBotUser(match.player2.userId)) {
                        await experienceService.awardExperience({
                            userId: match.player2.userId,
                            actionType: 'DUEL_PARTICIPATE',
                            targetId: `duel-${match.matchId}`,
                            description: `Hòa trận kịch tính tại Đấu trường Thi Đình (${match.matchId})`,
                        });
                    }
                }
            } catch (err) {
                console.warn('[Duel Service] Lỗi trao thưởng EXP:', err.message);
            }
        } else {
            // Chuyển sang câu hỏi kế tiếp
            match.currentQuestionIndex += 1;
            match.roundStartTime = new Date();
        }
    }

    await match.save();
    return sanitizeMatchForClient(match, userId);
}

/**
 * Lấy lịch sử thi đấu của người dùng
 */
async function getUserDuelHistory(userId) {
    const matches = await DuelMatch.find({
        $or: [{ 'player1.userId': userId }, { 'player2.userId': userId }],
        status: 'FINISHED',
    })
        .sort({ endedAt: -1 })
        .limit(10)
        .lean();

    return matches.map((m) => {
        const isPlayer1 = m.player1.userId.toString() === userId.toString();
        const myScore = isPlayer1 ? m.player1.score : m.player2?.score || 0;
        const opponent = isPlayer1 ? m.player2 : m.player1;
        const opponentScore = isPlayer1 ? m.player2?.score || 0 : m.player1.score;

        let outcome = 'TIE';
        if (m.winnerId) {
            outcome = m.winnerId.toString() === userId.toString() ? 'WIN' : 'LOSS';
        }

        return {
            matchId: m.matchId,
            endedAt: m.endedAt,
            outcome,
            myScore,
            opponentScore,
            opponentName: opponent?.name || 'Sĩ tử đối đầu',
            opponentAvatar: opponent?.avatar || '',
        };
    });
}

module.exports = {
    joinMatchmaking,
    leaveQueue,
    submitRoundAnswer,
    getUserDuelHistory,
    sanitizeMatchForClient,
    createBotMatch,
    scheduleBotAnswer,
    isUserInQueue,
    BOT_USER_ID,
};
