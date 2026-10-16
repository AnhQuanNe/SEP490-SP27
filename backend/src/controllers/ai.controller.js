const aiService = require('../services/ai.service');

/**
 * Trả lời câu hỏi thông minh kèm trích dẫn nguồn học thuật (UC09)
 */
const ask = async (req, res) => {
    try {
        const { question, contextSlug, history } = req.body;

        if (!question || typeof question !== 'string' || question.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp nội dung câu hỏi cho Trợ lý AI',
            });
        }

        const result = await aiService.askAssistant({
            question,
            contextSlug,
            history,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[AI Controller] Lỗi xử lý câu hỏi:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi xử lý câu hỏi với Trợ lý AI',
        });
    }
};

/**
 * Lấy danh sách câu hỏi gợi ý khám phá nhanh
 */
const getSuggestions = async (req, res) => {
    try {
        const suggestions = await aiService.getSuggestions();
        res.status(200).json({
            success: true,
            data: suggestions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể tải danh sách gợi ý',
        });
    }
};

module.exports = {
    ask,
    getSuggestions,
};
