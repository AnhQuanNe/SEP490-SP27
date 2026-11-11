const mongoose = require('mongoose');
const DuelMatch = require('../models/DuelMatch');
const QuizQuestion = require('../models/QuizQuestion');
const quizService = require('./quiz.service');
const experienceService = require('./experience.service');

// ID cố định cho sĩ tử Bot để lưu vào MongoDB
const BOT_USER_ID = new mongoose.Types.ObjectId('000000000000000000000b07');

// Danh sách danh nhân, danh nho cổ phong Việt Nam làm sĩ tử đối đầu
const BOT_PROFILES = [
    {
        name: 'Trạng Trình Nguyễn Bỉnh Khiêm',
        title: 'Bậc Tiên Tri Đại Việt',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=NguyenBinhKhiem&skinColor=f2d3b1',
        accuracy: 0.85,
    },
    {
        name: 'Bác Học Lê Quý Đôn',
        title: 'Bách Khoa Toàn Thư Đại Việt',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LeQuyDon&skinColor=f2d3b1',
        accuracy: 0.8,
    },
    {
        name: 'Trạng Lường Lương Thế Vinh',
        title: 'Trạng Lường Kỳ Tài',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LuongTheVinh&skinColor=f2d3b1',
        accuracy: 0.75,
    },
    {
        name: 'Vạn Thế Sư Biểu Chu Văn An',
        title: 'Người Thầy Mẫu Mực',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChuVanAn&skinColor=f2d3b1',
        accuracy: 0.85,
    },
    {
        name: 'Lưỡng Quốc Trạng Nguyên Mạc Đĩnh Chi',
        title: 'Văn Tài Xuất Chúng Bang Giao',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MacDinhChi&skinColor=f2d3b1',
        accuracy: 0.8,
    },
    {
        name: 'Trạng Nguyên Nhỏ Tuổi Nguyễn Hiền',
        title: 'Thần Đồng Khoa Cử',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=NguyenHien&skinColor=f2d3b1',
        accuracy: 0.75,
    },
];

// Cấu hình 3 bậc độ khó khi đấu với Danh Nho AI
const BOT_DIFFICULTY_CONFIG = {
    easy: {
        key: 'easy',
        label: 'Dễ (Nhập Môn)',
        accuracy: 0.55,
        minDelayMs: 4500,
        maxDelayMs: 7500,
        preferredPoolOrder: ['de', 'trung-binh', 'kho'],
    },
    medium: {
        key: 'medium',
        label: 'Trung Bình (Cử Nhân)',
        accuracy: 0.78,
        minDelayMs: 3000,
        maxDelayMs: 5500,
        preferredPoolOrder: ['trung-binh', 'de', 'kho'],
    },
    hard: {
        key: 'hard',
        label: 'Khó (Trạng Nguyên)',
        accuracy: 0.92,
        minDelayMs: 1800,
        maxDelayMs: 3500,
        preferredPoolOrder: ['kho', 'trung-binh', 'de'],
    },
};

// Bộ đếm thời gian trả lời của Bot: matchId -> NodeJS.Timeout
const botTimers = new Map();

function clearBotTimer(matchId) {
    if (matchId && botTimers.has(matchId)) {
        clearTimeout(botTimers.get(matchId));
        botTimers.delete(matchId);
    }
}

/**
 * Dọn dẹp các trận đấu dở dang bị treo/cũ quá 2 phút của người chơi để không kẹt lại trận cũ
 */
async function cleanupStaleMatchesForUser(userId) {
    if (!userId) return;
    const staleThreshold = new Date(Date.now() - 2 * 60 * 1000);
    try {
        await DuelMatch.updateMany(
            {
                $or: [{ 'player1.userId': userId }, { 'player2.userId': userId }],
                status: { $in: ['WAITING', 'MATCHED', 'COUNTDOWN', 'IN_PROGRESS', 'ROUND_COMPLETED'] },
                updatedAt: { $lt: staleThreshold },
            },
            {
                $set: { status: 'CANCELLED', endedAt: new Date() },
            }
        );
    } catch (err) {
        console.warn('[Duel Service] Lỗi dọn dẹp trận cũ:', err.message);
    }
}

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

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/**
 * Lấy ngẫu nhiên bộ câu hỏi (5, 10 hoặc 15 câu) từ ngân hàng câu hỏi di sản, có lọc ưu tiên theo độ khó Bot
 */
async function generateDuelQuestions({ count = 5, botDifficulty = null } = {}) {
    const validCount = [5, 10, 15].includes(Number(count)) ? Number(count) : 5;

    let pool = [];
    try {
        pool = await QuizQuestion.find({ isActive: true }).lean();
    } catch (err) {
        console.warn('[Duel Service] Không thể query QuizQuestion từ DB:', err.message);
    }

    if (!pool || pool.length === 0) {
        pool = quizService.QUIZ_QUESTION_BANK || [];
    }

    // Tạo map bổ sung thông tin chuẩn xác nếu thiếu
    const bankMap = {};
    const seedBank = quizService.QUIZ_QUESTION_BANK || [];
    seedBank.forEach((q) => {
        const key = q.questionId || q.id;
        if (key) bankMap[key] = q;
    });

    let selected = [];

    if (botDifficulty && BOT_DIFFICULTY_CONFIG[botDifficulty]) {
        const cfg = BOT_DIFFICULTY_CONFIG[botDifficulty];
        const byDiff = {
            de: shuffleArray(pool.filter((q) => q.difficulty === 'de')),
            'trung-binh': shuffleArray(pool.filter((q) => q.difficulty === 'trung-binh')),
            kho: shuffleArray(pool.filter((q) => q.difficulty === 'kho')),
        };

        if (botDifficulty === 'medium') {
            // Trung bình: pha trộn cân bằng ~60% trung bình và ~40% dễ
            const medTarget = Math.ceil(validCount * 0.6);
            const medPicked = byDiff['trung-binh'].slice(0, medTarget);
            selected.push(...medPicked);

            const usedIds = new Set(selected.map((q) => q.questionId || q.id));
            const remainingNeeded = validCount - selected.length;
            const easyPicked = byDiff.de.filter((q) => !usedIds.has(q.questionId || q.id)).slice(0, remainingNeeded);
            selected.push(...easyPicked);
        } else {
            // Dễ (easy) ưu tiên câu 'de' trước; Khó (hard) ưu tiên câu 'kho' trước (đủ hết 12 câu 'kho' rồi bù từ 'trung-binh' nếu 15 câu)
            for (const diffKey of cfg.preferredPoolOrder) {
                if (selected.length >= validCount) break;
                const usedIds = new Set(selected.map((q) => q.questionId || q.id));
                const candidates = (byDiff[diffKey] || []).filter((q) => !usedIds.has(q.questionId || q.id));
                const needed = validCount - selected.length;
                selected.push(...candidates.slice(0, needed));
            }
        }

        // Bù thêm từ toàn bộ pool nếu vẫn chưa đủ số lượng
        if (selected.length < validCount) {
            const usedIds = new Set(selected.map((q) => q.questionId || q.id));
            const leftover = shuffleArray(pool.filter((q) => !usedIds.has(q.questionId || q.id)));
            selected.push(...leftover.slice(0, validCount - selected.length));
        }

        selected = shuffleArray(selected);
    } else {
        selected = shuffleArray(pool).slice(0, validCount);
    }

    return selected.map((q) => {
        const key = q.questionId || q.id;
        const original = bankMap[key] || q;
        return {
            id: key,
            question: q.question,
            options: q.options,
            correctIndex: typeof q.correctIndex === 'number'
                ? q.correctIndex
                : (original && typeof original.correctIndex === 'number' ? original.correctIndex : 0),
            explanation: q.explanation || original?.explanation || 'Kiến thức văn hóa dân gian Việt Nam.',
            categoryName: q.categoryName || original?.categoryName || 'Di sản',
        };
    });
}

/**
 * Tìm hoặc tạo phòng đấu ngẫu nhiên (Ghép cặp tự do)
 */
async function joinMatchmaking({ userId, name, avatar, socketId = null }) {
    if (!userId) {
        throw new Error('Không tìm thấy thông tin sĩ tử (vui lòng đăng nhập lại)');
    }

    await cleanupStaleMatchesForUser(userId);

    // 1. Kiểm tra xem người chơi có đang trong hàng đợi không
    const queueIndex = waitingQueue.findIndex((p) => p.userId && p.userId.toString() === userId.toString());
    if (queueIndex !== -1) {
        waitingQueue[queueIndex].socketId = socketId;
        return { status: 'WAITING', message: 'Đang đợi đối thủ vào phòng thi...', queueLength: waitingQueue.length };
    }

    // 2. Kiểm tra xem có trận đấu PvP đang dở dang (trong 90s gần nhất) không
    const recentThreshold = new Date(Date.now() - 90 * 1000);
    const existingActiveMatch = await DuelMatch.findOne({
        $or: [{ 'player1.userId': userId }, { 'player2.userId': userId }],
        status: { $in: ['MATCHED', 'COUNTDOWN', 'IN_PROGRESS', 'ROUND_COMPLETED'] },
        isBotMatch: false,
        updatedAt: { $gte: recentThreshold },
    }).sort({ createdAt: -1 });

    if (existingActiveMatch) {
        return {
            status: 'IN_MATCH',
            matchId: existingActiveMatch.matchId,
            rawMatch: existingActiveMatch,
            match: sanitizeMatchForClient(existingActiveMatch, userId),
            opponent: existingActiveMatch.player1.userId.toString() === userId.toString()
                ? existingActiveMatch.player2
                : existingActiveMatch.player1,
        };
    }

    // 3. Nếu có người đang đợi trong hàng đợi (khác chính mình)
    const opponentIndex = waitingQueue.findIndex((p) => p.userId && p.userId.toString() !== userId.toString());
    if (opponentIndex !== -1) {
        const opponent = waitingQueue.splice(opponentIndex, 1)[0];
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
                isBot: false,
            },
            player2: {
                userId,
                name,
                avatar,
                score: 0,
                answers: [],
                isBot: false,
            },
            questions,
            status: 'COUNTDOWN',
            currentQuestionIndex: 0,
            roundStartTime: new Date(),
            isBotMatch: false,
        });

        return {
            status: 'MATCHED',
            matchId,
            rawMatch: newMatch,
            match: sanitizeMatchForClient(newMatch, userId),
            opponent,
            isBot: false,
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
 * Luôn tạo ván mới sạch sẽ (hủy các trận Bot cũ chưa hoàn tất nếu có)
 */
async function createBotMatch({
    userId,
    name,
    avatar,
    socketId = null,
    botDifficulty = 'medium',
    questionCount = 5,
}) {
    if (!userId) {
        throw new Error('Không tìm thấy thông tin sĩ tử (vui lòng đăng nhập lại)');
    }

    const validDifficulty = BOT_DIFFICULTY_CONFIG[botDifficulty] ? botDifficulty : 'medium';
    const validCount = [5, 10, 15].includes(Number(questionCount)) ? Number(questionCount) : 5;

    leaveQueue(userId);
    await cleanupStaleMatchesForUser(userId);

    // Đóng tất cả trận đấu với Bot cũ đang treo/chưa hoàn tất của user để tránh lặp lại đáp án cũ
    const oldBotMatches = await DuelMatch.find({
        'player1.userId': userId,
        isBotMatch: true,
        status: { $in: ['WAITING', 'MATCHED', 'COUNTDOWN', 'IN_PROGRESS', 'ROUND_COMPLETED'] },
    }).select('matchId');

    for (const oldM of oldBotMatches) {
        clearBotTimer(oldM.matchId);
    }

    if (oldBotMatches.length > 0) {
        await DuelMatch.updateMany(
            { matchId: { $in: oldBotMatches.map((m) => m.matchId) } },
            { $set: { status: 'CANCELLED', endedAt: new Date() } }
        );
    }

    const botProfile = BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)];
    const matchId = 'thi-dinh-bot-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const questions = await generateDuelQuestions({
        count: validCount,
        botDifficulty: validDifficulty,
    });

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
            name: `${botProfile.name} (${botProfile.title})`,
            avatar: botProfile.avatar,
            score: 0,
            answers: [],
            isBot: true,
        },
        questions,
        status: 'COUNTDOWN',
        currentQuestionIndex: 0,
        roundStartTime: new Date(),
        isBotMatch: true,
        botDifficulty: validDifficulty,
        questionCount: validCount,
    });

    return {
        status: 'MATCHED',
        matchId,
        rawMatch: newMatch,
        match: sanitizeMatchForClient(newMatch, userId),
        opponent: {
            userId: BOT_USER_ID,
            name: `${botProfile.name} (${botProfile.title})`,
            avatar: botProfile.avatar,
            isBot: true,
        },
        isBot: true,
    };
}

/**
 * Hủy trận đấu (khi người chơi thoát giữa chừng hoặc hủy phòng chờ)
 */
async function cancelMatch(matchId, userId) {
    if (!matchId) return null;
    clearBotTimer(matchId);

    const match = await DuelMatch.findOne({ matchId });
    if (!match || match.status === 'FINISHED' || match.status === 'CANCELLED') {
        return null;
    }

    // Nếu là phòng chờ riêng hoặc trận Bot -> chỉ cần hủy sạch
    if (match.status === 'WAITING' || match.isBotMatch) {
        match.status = 'CANCELLED';
        match.endedAt = new Date();
        await match.save();
        return { action: 'CANCELLED', match };
    }

    // Nếu là trận PvP đang diễn ra -> xử thua (Forfeit) cho đối thủ
    return { action: 'FORFEIT', match };
}

/**
 * Tạo phòng thách đấu riêng cho bạn bè (Sinh mã 6 số)
 */
async function createPrivateRoom({ userId, name, avatar, socketId = null, questionCount = 5 }) {
    if (!userId) {
        throw new Error('Vui lòng đăng nhập để tạo phòng');
    }
    leaveQueue(userId);
    const validCount = [5, 10, 15].includes(Number(questionCount)) ? Number(questionCount) : 5;

    // Sinh mã 6 số ngẫu nhiên không trùng với phòng đang chờ
    let roomCode = '';
    for (let i = 0; i < 10; i++) {
        const candidate = Math.floor(100000 + Math.random() * 900000).toString();
        const existing = await DuelMatch.findOne({ roomCode: candidate, status: 'WAITING' });
        if (!existing) {
            roomCode = candidate;
            break;
        }
    }
    if (!roomCode) roomCode = Math.floor(100000 + Math.random() * 900000).toString();

    const matchId = `thi-dinh-phong-${roomCode}-${Date.now()}`;
    const questions = await generateDuelQuestions({ count: validCount });

    const newMatch = await DuelMatch.create({
        matchId,
        roomCode,
        isPrivate: true,
        player1: {
            userId,
            name,
            avatar,
            score: 0,
            answers: [],
            isBot: false,
        },
        player2: null,
        questions,
        status: 'WAITING',
        currentQuestionIndex: 0,
        isBotMatch: false,
        questionCount: validCount,
    });

    return {
        status: 'ROOM_CREATED',
        matchId,
        roomCode,
        match: sanitizeMatchForClient(newMatch, userId),
    };
}

/**
 * Tham gia phòng thách đấu riêng bằng mã 6 số
 */
async function joinPrivateRoom({ roomCode, userId, name, avatar, socketId = null }) {
    if (!userId) {
        throw new Error('Vui lòng đăng nhập để vào phòng');
    }
    if (!roomCode) {
        throw new Error('Vui lòng nhập mã phòng');
    }
    leaveQueue(userId);

    const cleanCode = roomCode.toString().trim();
    const match = await DuelMatch.findOne({
        roomCode: cleanCode,
        status: 'WAITING',
    });

    if (!match) {
        throw new Error('Mã phòng không tồn tại hoặc phòng đã bắt đầu thi đấu');
    }

    if (match.player1.userId.toString() === userId.toString()) {
        throw new Error('Bạn đang là chủ phòng này, hãy gửi mã cho bạn bè');
    }

    match.player2 = {
        userId,
        name,
        avatar,
        score: 0,
        answers: [],
        isBot: false,
    };
    match.status = 'COUNTDOWN';
    match.currentQuestionIndex = 0;
    match.roundStartTime = new Date();
    await match.save();

    return {
        status: 'MATCHED',
        matchId: match.matchId,
        roomCode: match.roomCode,
        rawMatch: match,
        match: sanitizeMatchForClient(match, userId),
        opponent: match.player1,
        isBot: false,
    };
}

/**
 * Lập lịch để Bot suy nghĩ và tự động nộp câu trả lời dựa theo bậc độ khó
 */
function scheduleBotAnswer(
    matchId,
    questionIndex,
    duelNamespace,
    onRoundCompletedCallback = null,
    onRoundUpdatedCallback = null,
    botDifficulty = 'medium'
) {
    clearBotTimer(matchId);

    const cfg = BOT_DIFFICULTY_CONFIG[botDifficulty] || BOT_DIFFICULTY_CONFIG.medium;
    const delayRange = cfg.maxDelayMs - cfg.minDelayMs;
    const delay = Math.floor(Math.random() * delayRange) + cfg.minDelayMs;

    const timer = setTimeout(async () => {
        try {
            botTimers.delete(matchId);

            const match = await DuelMatch.findOne({ matchId });
            console.log(`[Duel Bot] Checking bot answer for match ${matchId} (${match?.botDifficulty || botDifficulty}): status=${match?.status}, currIdx=${match?.currentQuestionIndex}, expectedIdx=${questionIndex}`);
            if (!match || match.status === 'FINISHED' || match.status === 'CANCELLED') {
                return;
            }

            if (match.currentQuestionIndex !== questionIndex || match.status !== 'IN_PROGRESS') {
                return;
            }

            const botPlayer = match.player2?.isBot ? match.player2 : (match.player1?.isBot ? match.player1 : null);
            if (!botPlayer) return;

            const alreadyAnswered = botPlayer.answers.some((a) => a.questionIndex === questionIndex);
            if (alreadyAnswered) return;

            const question = match.questions[questionIndex];
            if (!question) return;

            // Tỷ lệ trả lời đúng theo độ khó đã chọn
            const activeCfg = BOT_DIFFICULTY_CONFIG[match.botDifficulty] || cfg;
            const isCorrect = Math.random() < activeCfg.accuracy;
            let selectedIndex = question.correctIndex;
            if (!isCorrect && question.options.length > 1) {
                const wrongIndices = [0, 1, 2, 3].filter((idx) => idx !== question.correctIndex && idx < question.options.length);
                selectedIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)] ?? 0;
            }

            const updatedRawMatch = await submitRoundAnswerInternal({
                matchId,
                userId: BOT_USER_ID,
                questionIndex,
                selectedIndex,
                clientResponseTimeMs: delay,
            });

            const roomName = `match_${matchId}`;
            if (updatedRawMatch.status === 'ROUND_COMPLETED') {
                if (typeof onRoundCompletedCallback === 'function') {
                    onRoundCompletedCallback(matchId, updatedRawMatch);
                } else if (duelNamespace) {
                    duelNamespace.to(roomName).emit('duel:round_completed', {
                        match: sanitizeMatchForClient(updatedRawMatch),
                        reviewSeconds: 3,
                    });
                }
            } else if (typeof onRoundUpdatedCallback === 'function') {
                onRoundUpdatedCallback(matchId, updatedRawMatch);
            } else if (duelNamespace) {
                duelNamespace.to(roomName).emit('duel:updated', {
                    match: sanitizeMatchForClient(updatedRawMatch, updatedRawMatch.player1?.userId),
                });
            }
        } catch (err) {
            console.error('[Duel Bot] Lỗi khi Bot nộp đáp án:', err.message);
        }
    }, delay);

    botTimers.set(matchId, timer);
}

/**
 * Ẩn đáp án đúng, điểm hiệp hiện tại và kết quả của các câu hỏi chưa đến lượt công bố
 */
function sanitizeMatchForClient(match, currentUserId) {
    const doc = match.toObject ? match.toObject() : match;
    const currIdx = doc.currentQuestionIndex || 0;
    const isReviewOrFinished = doc.status === 'ROUND_COMPLETED' || doc.status === 'FINISHED';

    const safeQuestions = doc.questions.map((q, qIdx) => {
        // Chỉ công bố đáp án đúng và lời giải khi câu hỏi đã qua, hoặc đang trong giai đoạn review kết quả hiệp (ROUND_COMPLETED)
        const canReveal = qIdx < currIdx || (qIdx === currIdx && isReviewOrFinished);
        return {
            id: q.id,
            question: q.question,
            options: q.options,
            categoryName: q.categoryName,
            correctIndex: canReveal ? q.correctIndex : undefined,
            explanation: canReveal ? q.explanation : undefined,
        };
    });

    const p1Answers = doc.player1?.answers || [];
    const p2Answers = doc.player2?.answers || [];

    // Tính tổng điểm hiển thị: Chỉ cộng điểm của những câu đã công bố kết quả (tránh lộ đáp án qua việc nhảy điểm khi đang chờ)
    const computeVisibleScore = (answers) => {
        if (doc.status === 'FINISHED') {
            return null; // Khi kết thúc dùng thẳng doc.playerX.score chính xác từ DB
        }
        return answers.reduce((sum, a) => {
            const isRevealed = a.questionIndex < currIdx || (a.questionIndex === currIdx && isReviewOrFinished);
            return sum + (isRevealed ? (a.points || 0) : 0);
        }, 0);
    };

    // Lọc danh sách câu trả lời: Chỉ lộ đúng/sai và lựa chọn của đối thủ khi đã ở ROUND_COMPLETED hoặc FINISHED
    const sanitizeAnswers = (answers, isMe) => {
        return answers.map((a) => {
            const isRevealed = a.questionIndex < currIdx || (a.questionIndex === currIdx && isReviewOrFinished);
            const canSeeSelection = isRevealed || isMe;
            return {
                questionIndex: a.questionIndex,
                selectedIndex: canSeeSelection ? a.selectedIndex : undefined,
                isCorrect: isRevealed ? a.isCorrect : undefined,
                points: isRevealed ? a.points : undefined,
                submitted: true,
                responseTimeMs: a.responseTimeMs,
            };
        });
    };

    const isP1 = currentUserId && doc.player1?.userId?.toString() === currentUserId.toString();
    const p1VisibleScore = computeVisibleScore(p1Answers);
    const p2VisibleScore = computeVisibleScore(p2Answers);

    return {
        matchId: doc.matchId,
        roomCode: doc.roomCode || null,
        isPrivate: !!doc.isPrivate,
        status: doc.status,
        currentQuestionIndex: doc.currentQuestionIndex,
        roundStartTime: doc.roundStartTime,
        timeLimitSeconds: 10,
        isBotMatch: !!doc.isBotMatch,
        botDifficulty: doc.botDifficulty || 'medium',
        questionCount: doc.questions?.length || doc.questionCount || 5,
        player1: {
            userId: doc.player1.userId,
            name: doc.player1.name,
            avatar: doc.player1.avatar,
            score: p1VisibleScore !== null ? p1VisibleScore : doc.player1.score,
            answeredCount: p1Answers.length,
            isBot: !!doc.player1.isBot,
            hasAnsweredCurrent: p1Answers.some((a) => a.questionIndex === currIdx),
            answers: sanitizeAnswers(p1Answers, isP1),
        },
        player2: doc.player2 ? {
            userId: doc.player2.userId,
            name: doc.player2.name,
            avatar: doc.player2.avatar,
            score: p2VisibleScore !== null ? p2VisibleScore : doc.player2.score,
            answeredCount: p2Answers.length,
            isBot: !!doc.player2.isBot,
            hasAnsweredCurrent: p2Answers.some((a) => a.questionIndex === currIdx),
            answers: sanitizeAnswers(p2Answers, !isP1),
        } : null,
        currentQuestion: safeQuestions[currIdx] || null,
        questions: safeQuestions,
        winnerId: doc.winnerId,
        isTie: doc.isTie,
        endedAt: doc.endedAt,
    };
}

/**
 * Xử lý nộp câu trả lời nội bộ, trả về document Mongoose gốc
 */
async function submitRoundAnswerInternal({ matchId, userId, questionIndex, selectedIndex, clientResponseTimeMs = 5000 }) {
    const match = await DuelMatch.findOne({ matchId });
    if (!match) {
        throw new Error('Không tìm thấy phòng thi đấu');
    }

    if (match.status === 'FINISHED' || match.status === 'CANCELLED') {
        throw new Error('Trận đấu đã kết thúc');
    }

    // Chặn nộp bài sai hiệp (ví dụ gói tin trễ từ câu trước bay sang câu sau hoặc đang trong lúc review)
    if (match.status !== 'IN_PROGRESS' || match.currentQuestionIndex !== questionIndex) {
        return match;
    }

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
        return match;
    }

    const now = new Date();
    const roundStart = match.roundStartTime ? new Date(match.roundStartTime) : now;
    const elapsedMs = Math.max(0, now.getTime() - roundStart.getTime());

    // Thời hạn 10 giây (cho thêm 1.5 giây độ trễ mạng)
    const isTimeout = elapsedMs > 11500;

    const question = match.questions[questionIndex];
    if (!question) {
        throw new Error('Câu hỏi không tồn tại');
    }

    const isCorrect = !isTimeout && selectedIndex >= 0 && selectedIndex === question.correctIndex;

    // Tính điểm: 100 điểm chuẩn + tối đa 50 điểm phản xạ tốc độ
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

    // NẾU CẢ 2 ĐÃ TRẢ LỜI CÂU HỎI NÀY:
    // Chuyển trạng thái sang ROUND_COMPLETED để hiển thị màn công bố kết quả hiệp (3s review)
    if (otherAnswered) {
        match.status = 'ROUND_COMPLETED';
        clearBotTimer(matchId);
    }

    await match.save();
    return match;
}

/**
 * Gửi câu trả lời của 1 hiệp đấu (trả về dữ liệu đã lọc theo quyền người gửi)
 */
async function submitRoundAnswer(params) {
    const match = await submitRoundAnswerInternal(params);
    return sanitizeMatchForClient(match, params.userId);
}

/**
 * Kết thúc trận đấu và trao thưởng EXP
 */
async function finishMatch(matchId, duelNamespace = null) {
    clearBotTimer(matchId);
    const match = await DuelMatch.findOne({ matchId });
    if (!match || match.status === 'FINISHED' || match.status === 'CANCELLED') {
        return match ? sanitizeMatchForClient(match) : null;
    }

    match.status = 'FINISHED';
    match.endedAt = new Date();

    const p1Score = match.player1.score;
    const p2Score = match.player2?.score || 0;

    if (p1Score > p2Score) {
        match.winnerId = match.player1.userId;
        match.isTie = false;
    } else if (p2Score > p1Score) {
        match.winnerId = match.player2.userId;
        match.isTie = false;
    } else {
        match.winnerId = null;
        match.isTie = true;
    }

    try {
        if (match.winnerId) {
            const loserId = match.winnerId.toString() === match.player1.userId.toString()
                ? match.player2?.userId
                : match.player1.userId;

            // Thưởng thắng: +30 EXP
            if (!isBotUser(match.winnerId)) {
                await experienceService.awardExperience({
                    userId: match.winnerId,
                    actionType: 'DUEL_VICTORY',
                    targetId: `duel-${match.matchId}`,
                    description: `Chiến thắng rạng rỡ tại Đấu trường Thi Đình (${match.matchId})`,
                });
            }

            // Thưởng tham gia: +10 EXP
            if (loserId && !isBotUser(loserId)) {
                await experienceService.awardExperience({
                    userId: loserId,
                    actionType: 'DUEL_PARTICIPATE',
                    targetId: `duel-${match.matchId}`,
                    description: `Tham gia giao lưu tại Đấu trường Thi Đình (${match.matchId})`,
                });
            }
        } else {
            // Hòa trận: Mỗi bên +15 EXP
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

    await match.save();
    const safeData = sanitizeMatchForClient(match);

    if (duelNamespace) {
        duelNamespace.to(`match_${matchId}`).emit('duel:finished', { match: safeData });
    }

    return safeData;
}

/**
 * Xử lý khi đối thủ bỏ cuộc / mất kết nối vĩnh viễn (Forfeit)
 */
async function forfeitMatch(matchId, forfeitingUserId, duelNamespace = null) {
    const match = await DuelMatch.findOne({ matchId });
    if (!match || match.status === 'FINISHED' || match.status === 'CANCELLED') return null;

    const isP1 = forfeitingUserId && match.player1.userId.toString() === forfeitingUserId.toString();
    const winnerPlayer = isP1 ? match.player2 : match.player1;

    match.status = 'FINISHED';
    match.endedAt = new Date();
    match.winnerId = winnerPlayer?.userId || null;
    match.isTie = false;

    if (winnerPlayer && !isBotUser(winnerPlayer.userId)) {
        try {
            await experienceService.awardExperience({
                userId: winnerPlayer.userId,
                actionType: 'DUEL_VICTORY',
                targetId: `duel-${match.matchId}`,
                description: `Chiến thắng do đối thủ rời trường thi (${match.matchId})`,
            });
        } catch (err) {
            console.warn('[Duel Service] Lỗi trao thưởng Forfeit:', err.message);
        }
    }

    await match.save();
    const safeData = sanitizeMatchForClient(match);

    if (duelNamespace) {
        duelNamespace.to(`match_${matchId}`).emit('duel:finished', {
            match: safeData,
            forfeit: true,
            message: 'Đối thủ đã rời trường thi. Bạn giành chiến thắng vang dội!',
        });
    }

    return safeData;
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
    createBotMatch,
    createPrivateRoom,
    joinPrivateRoom,
    scheduleBotAnswer,
    submitRoundAnswer,
    submitRoundAnswerInternal,
    cancelMatch,
    clearBotTimer,
    finishMatch,
    forfeitMatch,
    getUserDuelHistory,
    sanitizeMatchForClient,
    isUserInQueue,
    generateDuelQuestions,
    BOT_USER_ID,
    BOT_PROFILES,
    BOT_DIFFICULTY_CONFIG,
};
