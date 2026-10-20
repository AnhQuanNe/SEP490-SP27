const QuizQuestion = require('../models/QuizQuestion');
const Work = require('../models/Work');
const quizQuestionsData = require('./quizQuestions.data');

/**
 * Nạp dữ liệu 100 câu hỏi trắc nghiệm vào MongoDB
 * Tự động liên kết ObjectId của tác phẩm tương ứng (nếu có trong bảng Works)
 */
const seedQuizQuestions = async ({ force = false } = {}) => {
    try {
        const existingCount = await QuizQuestion.countDocuments();

        // Nếu đã có đủ dữ liệu và không yêu cầu force cập nhật thì bỏ qua
        if (existingCount >= quizQuestionsData.length && !force) {
            return {
                seeded: false,
                count: existingCount,
                message: `Ngân hàng đề thi đã có sẵn ${existingCount} câu hỏi trong Database.`,
            };
        }

        console.log(`[Seed Quiz] Đang chuẩn bị nạp ${quizQuestionsData.length} câu hỏi vào Database...`);

        // Lấy danh sách tất cả works để map ObjectId nhanh
        const works = await Work.find({}, '_id slug').lean();
        const workMap = new Map();
        works.forEach((w) => workMap.set(w.slug, w._id));

        let insertedOrUpdated = 0;

        for (const item of quizQuestionsData) {
            const relatedWorkId = item.relatedWorkSlug ? workMap.get(item.relatedWorkSlug) || null : null;

            const docData = {
                ...item,
                relatedWork: relatedWorkId,
                isActive: true,
            };

            await QuizQuestion.findOneAndUpdate(
                { questionId: item.questionId },
                { $set: docData },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            insertedOrUpdated++;
        }

        console.log(`[Seed Quiz] ✅ Hoàn tất nạp ${insertedOrUpdated} câu hỏi vào Database thành công!`);

        return {
            seeded: true,
            count: insertedOrUpdated,
            message: `Đã nạp thành công ${insertedOrUpdated} câu hỏi trắc nghiệm vào Database.`,
        };
    } catch (error) {
        console.error('[Seed Quiz] ❌ Lỗi khi nạp dữ liệu câu hỏi:', error.message);
        throw error;
    }
};

module.exports = seedQuizQuestions;
