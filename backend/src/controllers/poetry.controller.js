const poetryService = require('../services/poetry.service');
const experienceService = require('../services/experience.service');

/**
 * Phân tích âm luật bài thơ Lục Bát bằng Rule Engine
 */
const analyzePoem = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp nội dung bài thơ',
            });
        }

        const analysis = poetryService.analyzePoemRule(content);
        res.status(200).json({
            success: true,
            data: analysis,
        });
    } catch (error) {
        console.error('[Poetry Controller] Lỗi phân tích âm luật:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể phân tích âm luật bài thơ',
        });
    }
};

/**
 * Thẩm định thơ toàn diện (Rule Engine + AI Critic)
 */
const critiquePoem = async (req, res) => {
    try {
        const { content, title, authorName } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp nội dung bài thơ để thẩm định',
            });
        }

        const result = await poetryService.critiquePoem({
            content,
            title: title || 'Không đề',
            authorName: authorName || (req.user ? req.user.name : 'Ẩn danh thi sĩ'),
        });

        // Nếu người dùng đã đăng nhập và bài thơ đạt điểm cao, có thể thưởng EXP học tập
        if (req.user && result.scores.totalScore >= 60) {
            try {
                await experienceService.awardExperience({
                    userId: req.user._id,
                    actionType: 'POEM_REVIEWED',
                    targetId: `poem-${Date.now()}`,
                    description: `Thẩm định bài thơ "${title || 'Không đề'}" đạt ${result.scores.totalScore} điểm`,
                });
            } catch (expErr) {
                console.warn('[Poetry Controller] Lỗi thưởng EXP thẩm định thơ:', expErr.message);
            }
        }

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[Poetry Controller] Lỗi thẩm định thơ:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể thẩm định bài thơ lúc này',
        });
    }
};

/**
 * Ứng khẩu đối câu Bát cùng AI
 */
const coWrite = async (req, res) => {
    try {
        const { lucLine, context } = req.body;
        if (!lucLine || !lucLine.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập câu Lục (6 tiếng)',
            });
        }

        const result = await poetryService.coWriteBatLine({ lucLine, context });
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[Poetry Controller] Lỗi đối thơ AI:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Không thể đối thơ lúc này',
        });
    }
};

/**
 * Lưu tác phẩm hoặc bản nháp
 */
const savePoem = async (req, res) => {
    try {
        const { poemId, title, content, authorName, status, analysisResult } = req.body;
        const poem = await poetryService.savePoem({
            userId: req.user._id,
            poemId,
            title,
            content,
            authorName: authorName || req.user.name,
            status,
            analysisResult,
        });

        res.status(200).json({
            success: true,
            message: status === 'draft' ? 'Đã lưu bản nháp thành công' : 'Đã lưu tác phẩm thành công',
            data: poem,
        });
    } catch (error) {
        console.error('[Poetry Controller] Lỗi lưu tác phẩm:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Không thể lưu tác phẩm',
        });
    }
};

/**
 * Lấy danh sách tác phẩm của người dùng
 */
const getMyPoems = async (req, res) => {
    try {
        const poems = await poetryService.getMyPoems(req.user._id);
        res.status(200).json({
            success: true,
            data: poems,
        });
    } catch (error) {
        console.error('[Poetry Controller] Lỗi lấy danh sách thơ:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể lấy danh sách tác phẩm',
        });
    }
};

/**
 * Lấy chi tiết tác phẩm
 */
const getPoemDetail = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        const poem = await poetryService.getPoemById(req.params.id, userId);
        res.status(200).json({
            success: true,
            data: poem,
        });
    } catch (error) {
        console.error('[Poetry Controller] Lỗi xem chi tiết bài thơ:', error);
        res.status(404).json({
            success: false,
            message: error.message || 'Không tìm thấy bài thơ',
        });
    }
};

/**
 * Xóa tác phẩm
 */
const deletePoem = async (req, res) => {
    try {
        const result = await poetryService.deletePoem(req.params.id, req.user._id);
        res.status(200).json(result);
    } catch (error) {
        console.error('[Poetry Controller] Lỗi xóa bài thơ:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Không thể xóa bài thơ',
        });
    }
};

/**
 * Lấy danh sách thơ cộng đồng đã công bố
 */
const getCommunityPoems = async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const result = await poetryService.getCommunityPoems({ page, limit });
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[Poetry Controller] Lỗi lấy thơ cộng đồng:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể tải thơ cộng đồng',
        });
    }
};

module.exports = {
    analyzePoem,
    critiquePoem,
    coWrite,
    savePoem,
    getMyPoems,
    getPoemDetail,
    deletePoem,
    getCommunityPoems,
};
