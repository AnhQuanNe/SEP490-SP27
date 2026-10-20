const quizService = require('../services/quiz.service');

/**
 * Lấy danh sách câu hỏi trắc nghiệm đố vui (UC10 & UC21)
 * Hỗ trợ category: 'all', thể loại cụ thể, 'personalized' và 'daily'
 */
const getQuestions = async (req, res) => {
    try {
        const { category = 'all', count = 5 } = req.query;
        const questions = await quizService.getQuestions({
            category,
            count: parseInt(count, 10) || 5,
            userId: req.user?._id || null,
        });

        res.status(200).json({
            success: true,
            data: questions,
        });
    } catch (error) {
        console.error('[Quiz Controller] Lỗi lấy câu hỏi:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể tải câu hỏi đố vui',
        });
    }
};

/**
 * Nộp bài thi và nhận kết quả, danh hiệu & lưu tiến độ nếu là Registered User
 */
const submit = async (req, res) => {
    try {
        const { answers, mode = 'standard', category = 'all' } = req.body;
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp danh sách câu trả lời',
            });
        }

        const result = await quizService.submitQuiz({
            answers,
            userId: req.user?._id || null,
            mode,
            category,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[Quiz Controller] Lỗi chấm bài:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi chấm điểm bài thi',
        });
    }
};

/**
 * Lấy tiến độ học tập, lịch sử và huy hiệu thành tích của Registered User
 */
const getProgress = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để xem tiến độ học tập',
            });
        }

        const progress = await quizService.getUserProgress(req.user._id);

        res.status(200).json({
            success: true,
            data: progress,
        });
    } catch (error) {
        console.error('[Quiz Controller] Lỗi lấy tiến độ học tập:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể tải tiến độ học tập',
        });
    }
};

/**
 * Yêu cầu AI giải thích đa tầng cho một câu hỏi trắc nghiệm
 */
const explainQuestionWithAi = async (req, res) => {
    try {
        const { questionId, selectedAnswer } = req.body;
        if (!questionId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp mã câu hỏi (questionId)',
            });
        }

        const explanation = await quizService.getAiQuestionExplanation({
            questionId,
            selectedAnswer,
        });

        res.status(200).json({
            success: true,
            data: explanation,
        });
    } catch (error) {
        console.error('[Quiz Controller] Lỗi giải thích câu hỏi AI:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi yêu cầu AI giải thích câu hỏi',
        });
    }
};

module.exports = {
    getQuestions,
    submit,
    getProgress,
    explainQuestionWithAi,
};
