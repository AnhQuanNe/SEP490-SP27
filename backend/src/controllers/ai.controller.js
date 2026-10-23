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
            quota: req.guestQuota || null,
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

/**
 * Yêu cầu AI giải thích chi tiết câu ca dao, tục ngữ (UC10 Request AI Explanation)
 */
const explain = async (req, res) => {
    try {
        const { workId, slug } = req.body;
        if (!workId && !slug) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp workId hoặc slug của tác phẩm cần giải thích',
            });
        }

        const result = await aiService.explainWork({ workId, slug });
        res.status(200).json({
            success: true,
            data: result,
            quota: req.guestQuota || null,
        });
    } catch (error) {
        console.error('[AI Controller] Lỗi giải thích tác phẩm:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi yêu cầu AI giải thích nội dung',
        });
    }
};

/**
 * Lấy danh sách các chủ đề học tập cho Gia sư AI
 */
const getTutorTopics = async (req, res) => {
    try {
        const topics = await aiService.getTutorTopics();
        res.status(200).json({
            success: true,
            data: topics,
        });
    } catch (error) {
        console.error('[AI Controller] Lỗi lấy chủ đề Gia sư AI:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể tải danh sách chủ đề học tập',
        });
    }
};

/**
 * Xử lý phiên hỏi đáp & học tập cùng Gia sư văn hóa AI
 */
const tutorChat = async (req, res) => {
    try {
        const { message, topic, history, selectedWorkSlug } = req.body;

        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp nội dung câu hỏi cho Gia sư văn hóa AI',
            });
        }

        const result = await aiService.tutorChat({
            message,
            topic,
            history,
            selectedWorkSlug,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[AI Controller] Lỗi phiên học tập Gia sư AI:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi kết nối với Gia sư văn hóa AI',
        });
    }
};

/**
 * Trợ lý AI hỗ trợ người dùng phân tích 4 tầng nghĩa khi đóng góp nội dung mới
 */
const draftSubmission = async (req, res) => {
    try {
        const { title, category } = req.body;
        if (!title || typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp câu ca dao hoặc tục ngữ để AI phân tích",
            });
        }

        const result = await aiService.draftSubmissionAssist({
            title: title.trim(),
            category: category || "ca-dao",
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("[AI Controller] Lỗi hỗ trợ soạn bài đóng góp:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi khi AI phân tích ngữ liệu đóng góp",
        });
    }
};

/**
 * Smart Text Selection: Phân tích địa danh, bối cảnh lịch sử hoặc biện pháp tu từ cho đoạn trích bôi đen
 */
const analyzeSnippet = async (req, res) => {
    try {
        const { snippet, workSlug, workTitle, analysisType } = req.body;

        if (!snippet || typeof snippet !== 'string' || snippet.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đoạn trích hoặc từ ngữ cần phân tích',
            });
        }

        const result = await aiService.analyzeSnippet({
            snippet,
            workSlug,
            workTitle,
            analysisType: analysisType || 'general',
        });

        res.status(200).json({
            success: true,
            data: result,
            quota: req.guestQuota || null,
        });
    } catch (error) {
        console.error('[AI Controller] Lỗi phân tích đoạn trích:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi phân tích đoạn trích với AI',
        });
    }
};

module.exports = {
    draftSubmission,
    ask,
    explain,
    getSuggestions,
    getTutorTopics,
    tutorChat,
    analyzeSnippet,
};

