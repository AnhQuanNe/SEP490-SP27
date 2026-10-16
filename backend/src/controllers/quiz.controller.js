const quizService = require('../services/quiz.service');

/**
 * Lấy danh sách câu hỏi trắc nghiệm đố vui (UC10)
 */
const getQuestions = async (req, res) => {
    try {
        const { category = 'all', count = 5 } = req.query;
        const questions = await quizService.getQuestions({
            category,
            count: parseInt(count, 10) || 5,
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
 * Nộp bài thi và nhận kết quả, danh hiệu & giải thích
 */
const submit = async (req, res) => {
    try {
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp danh sách câu trả lời',
            });
        }

        const result = await quizService.submitQuiz({ answers });

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

module.exports = {
    getQuestions,
    submit,
};
