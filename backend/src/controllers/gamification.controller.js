const experienceService = require('../services/experience.service');
const duelService = require('../services/duel.service');
const DuelMatch = require('../models/DuelMatch');

/**
 * Lấy thông tin EXP, danh hiệu khoa bảng và streak của người dùng
 */
const getMyStats = async (req, res) => {
    try {
        const stats = await experienceService.getUserHeritageStats(req.user._id);
        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('[Gamification Controller] Lỗi lấy thông tin thành tích:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể lấy thông tin thành tích',
        });
    }
};

/**
 * Lấy Bảng Vàng Trạng Nguyên (Top 10 theo Tuần, Tháng hoặc Mọi thời đại)
 */
const getLeaderboard = async (req, res) => {
    try {
        const { type = 'all', limit = 10 } = req.query;
        const leaderboard = await experienceService.getLeaderboard({ type, limit });
        res.status(200).json({
            success: true,
            data: leaderboard,
        });
    } catch (error) {
        console.error('[Gamification Controller] Lỗi lấy Bảng Vàng:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể lấy Bảng Vàng Trạng Nguyên',
        });
    }
};

/**
 * Ghi nhận hoạt động học tập (Đọc tác phẩm, hoàn thành bài học)
 */
const trackActivity = async (req, res) => {
    try {
        const { actionType, targetId, description } = req.body;
        if (!actionType) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp loại hoạt động học tập',
            });
        }

        const result = await experienceService.awardExperience({
            userId: req.user._id,
            actionType,
            targetId,
            description,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[Gamification Controller] Lỗi ghi nhận hoạt động:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể ghi nhận hoạt động',
        });
    }
};

/**
 * Tham gia hàng đợi ghép cặp Đấu trường Thi Đình 1v1
 */
const matchmakeDuel = async (req, res) => {
    try {
        const result = await duelService.joinMatchmaking({
            userId: req.user._id,
            name: req.user.name,
            avatar: req.user.avatar,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[Gamification Controller] Lỗi ghép cặp Thi Đình:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể tham gia ghép cặp lúc này',
        });
    }
};

/**
 * Ghép cặp trực tiếp với Trạng Nguyên AI (Bot)
 */
const matchmakeBotDuel = async (req, res) => {
    try {
        const result = await duelService.createBotMatch({
            userId: req.user._id,
            name: req.user.name,
            avatar: req.user.avatar,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[Gamification Controller] Lỗi ghép bot:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể ghép với Bot lúc này',
        });
    }
};

/**
 * Rời khỏi hàng đợi Thi Đình
 */
const leaveDuelQueue = async (req, res) => {
    try {
        const removed = duelService.leaveQueue(req.user._id);
        res.status(200).json({
            success: true,
            message: removed ? 'Đã rời khỏi hàng đợi' : 'Bạn không nằm trong hàng đợi',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi rời hàng đợi',
        });
    }
};

/**
 * Lấy trạng thái thời gian thực của phòng thi đấu
 */
const getDuelMatchStatus = async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await DuelMatch.findOne({ matchId });
        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng thi đấu',
            });
        }

        const safeData = duelService.sanitizeMatchForClient(match, req.user._id);
        res.status(200).json({
            success: true,
            data: safeData,
        });
    } catch (error) {
        console.error('[Gamification Controller] Lỗi xem phòng thi đấu:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi kiểm tra phòng thi',
        });
    }
};

/**
 * Nộp câu trả lời cho hiệp đấu hiện tại
 */
const answerDuelRound = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { questionIndex, selectedIndex, responseTimeMs } = req.body;

        const updatedMatch = await duelService.submitRoundAnswer({
            matchId,
            userId: req.user._id,
            questionIndex: parseInt(questionIndex, 10),
            selectedIndex: parseInt(selectedIndex, 10),
            clientResponseTimeMs: parseInt(responseTimeMs, 10) || 5000,
        });

        res.status(200).json({
            success: true,
            data: updatedMatch,
        });
    } catch (error) {
        console.error('[Gamification Controller] Lỗi gửi đáp án Thi Đình:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Lỗi khi gửi đáp án',
        });
    }
};

/**
 * Lịch sử thi đấu của sĩ tử
 */
const getDuelHistory = async (req, res) => {
    try {
        const history = await duelService.getUserDuelHistory(req.user._id);
        res.status(200).json({
            success: true,
            data: history,
        });
    } catch (error) {
        console.error('[Gamification Controller] Lỗi lấy lịch sử thi đấu:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể tải lịch sử thi đấu',
        });
    }
};

module.exports = {
    getMyStats,
    getLeaderboard,
    trackActivity,
    matchmakeDuel,
    matchmakeBotDuel,
    leaveDuelQueue,
    getDuelMatchStatus,
    answerDuelRound,
    getDuelHistory,
};
