const mongoose = require('mongoose');
const Work = require('../models/Work');
const LearningPath = require('../models/LearningPath');
const QuizProgress = require('../models/QuizProgress');
const {
    GEMINI_MODELS,
    AVAILABLE_TOPIC_CONFIGS,
    getTopicCandidateFilter,
    buildLearningPathPrompts,
    synthesizeCurriculumFallback,
} = require('../constants/learningPath.constants');

class LearningPathService {
    /**
     * Lấy danh sách các chủ đề khả dụng dựa trên số lượng tác phẩm thật trong MongoDB
     */
    async getAvailableTopics() {
        const counts = await Work.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
        ]);

        const countMap = {};
        let totalCount = 0;
        counts.forEach((item) => {
            countMap[item._id] = item.count;
            totalCount += item.count;
        });

        return AVAILABLE_TOPIC_CONFIGS.map((config) => ({
            id: config.id,
            title: config.title,
            category: config.category,
            description: config.description,
            worksCount: config.calculateCount(countMap, totalCount),
            suggestedDays: config.suggestedDays,
            icon: config.icon,
            badge: config.badge,
        }));
    }

    /**
     * Truy xuất các tác phẩm thật trong MongoDB phù hợp với tiêu chí của người dùng
     */
    async getCandidateWorks({ topic }) {
        const filter = getTopicCandidateFilter(topic);

        const candidateWorks = await Work.find(filter)
            .sort({ isFeatured: -1, viewsCount: -1, createdAt: -1 })
            .lean();

        // Nếu chủ đề quá hẹp mà chưa đủ 4 tác phẩm, bổ sung thêm các câu ca dao tục ngữ phổ biến để lộ trình phong phú
        if (candidateWorks.length < 5 && topic !== 'all') {
            const currentIds = candidateWorks.map((w) => w._id);
            const fallbackWorks = await Work.find({
                status: 'published',
                _id: { $nin: currentIds },
                category: { $in: ['ca-dao', 'tuc-ngu'] },
            })
                .sort({ isFeatured: -1, viewsCount: -1 })
                .limit(10 - candidateWorks.length)
                .lean();

            return [...candidateWorks, ...fallbackWorks];
        }

        return candidateWorks;
    }

    /**
     * Tạo lộ trình học bằng Gemini API (với ràng buộc nghiêm ngặt: chỉ dùng các tác phẩm thật được cung cấp)
     */
    async generateWithGemini({ topicLabel, goal, totalDays, dailyMinutes, candidateWorks }) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return null;

        // Tóm lược danh sách tác phẩm thực sự gửi cho AI
        const worksPayload = candidateWorks.slice(0, Math.min(candidateWorks.length, totalDays * 2 + 3)).map((w) => ({
            id: w._id.toString(),
            title: w.title,
            slug: w.slug,
            category: w.category,
            categoryName: w.categoryName,
            quote: w.quote || w.title,
            summary: w.summary,
            literalMeaning: w.literalMeaning || '',
            figurativeMeaning: w.figurativeMeaning || '',
            lesson: w.lesson || '',
            source: w.source || 'Kho tàng Dân gian Việt Nam',
        }));

        const { systemInstruction, userPrompt } = buildLearningPathPrompts({
            topicLabel,
            goal,
            totalDays,
            dailyMinutes,
            worksPayload,
        });

        for (const model of GEMINI_MODELS) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        system_instruction: { parts: [{ text: systemInstruction }] },
                        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                        generationConfig: {
                            temperature: 0.4,
                            maxOutputTokens: 8192,
                            responseMimeType: 'application/json',
                        },
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (rawText) {
                        const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
                        if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
                            return parsed;
                        }
                    }
                }
            } catch (err) {
                console.warn(`[Gemini Learning Path] Model ${model} không thành công:`, err.message);
            }
        }

        return null;
    }

    /**
     * Động cơ sư phạm nội bộ (Internal Curriculum Engine):
     * Xây dựng lộ trình học tập khoa học, chuẩn mực từ cơ bản đến nâng cao hoàn toàn từ
     * các tác phẩm thật trong MongoDB, bảo đảm 100% hoạt động tin cậy ngay cả khi không có kết nối Gemini.
     */
    synthesizeCurriculum({ topicLabel, goal, totalDays, dailyMinutes, candidateWorks }) {
        return synthesizeCurriculumFallback({
            topicLabel,
            goal,
            totalDays,
            dailyMinutes,
            candidateWorks,
        });
    }

    /**
     * Tạo và lưu lộ trình học tập hoàn chỉnh vào MongoDB
     */
    async createLearningPath({ userId, topic, goal, totalDays = 7, dailyMinutes = 15 }) {
        if (!userId) {
            throw new Error('Vui lòng đăng nhập để tạo lộ trình học cá nhân hóa');
        }

        const daysCount = Math.max(1, Math.min(30, Number(totalDays) || 7));
        const minutes = Math.max(5, Math.min(60, Number(dailyMinutes) || 15));
        const cleanGoal = (goal && goal.trim()) || 'Khám phá và thấu hiểu chiều sâu văn hóa dân gian Việt Nam';

        // 1. Xác định nhãn chủ đề
        const availableTopics = await this.getAvailableTopics();
        const foundTopic = availableTopics.find((t) => t.id === topic) || availableTopics[0];
        const topicLabel = foundTopic.title;

        // 2. Truy vấn danh sách tác phẩm thật từ MongoDB
        const candidateWorks = await this.getCandidateWorks({ topic });
        if (!candidateWorks || candidateWorks.length === 0) {
            throw new Error(`Hiện chưa có tác phẩm văn hóa phù hợp trong cơ sở dữ liệu cho chủ đề "${topicLabel}". Vui lòng chọn chủ đề khác!`);
        }

        // Tạo map để tra cứu tác phẩm nhanh
        const worksMap = {};
        candidateWorks.forEach((w) => {
            worksMap[w._id.toString()] = w;
        });

        // 3. Thử tạo lộ trình bằng Gemini trước
        let curriculum = null;
        try {
            curriculum = await this.generateWithGemini({
                topicLabel,
                goal: cleanGoal,
                totalDays: daysCount,
                dailyMinutes: minutes,
                candidateWorks,
            });
        } catch (geminiErr) {
            console.warn('[Learning Path] Gemini generation fallback:', geminiErr.message);
        }

        // 4. Nếu Gemini không khả dụng hoặc lỗi, kích hoạt Động cơ Sư phạm Nội bộ
        if (!curriculum || !Array.isArray(curriculum.days) || curriculum.days.length === 0) {
            curriculum = this.synthesizeCurriculum({
                topicLabel,
                goal: cleanGoal,
                totalDays: daysCount,
                dailyMinutes: minutes,
                candidateWorks,
            });
        }

        // 5. Kiểm tra & chuẩn hóa dữ liệu ngày học: ĐẢM BẢO 100% CÁC TÁC PHẨM ĐỀU CÓ TRONG MONGODB THẬT
        const formattedDays = [];
        let validDayCount = 1;

        for (const rawDay of curriculum.days) {
            const rawWorkIds = Array.isArray(rawDay.workIds) ? rawDay.workIds : [];
            const validWorkIds = [];
            const dayWorksSnapshot = [];

            for (const wid of rawWorkIds) {
                const widStr = wid && wid.toString ? wid.toString() : String(wid);
                const workObj = worksMap[widStr];
                if (workObj) {
                    validWorkIds.push(workObj._id);
                    dayWorksSnapshot.push({
                        workId: workObj._id,
                        title: workObj.title,
                        slug: workObj.slug,
                        category: workObj.category,
                        categoryName: workObj.categoryName || '',
                        quote: workObj.quote || workObj.title,
                        summary: workObj.summary || '',
                        literalMeaning: workObj.literalMeaning || '',
                        figurativeMeaning: workObj.figurativeMeaning || '',
                        lesson: workObj.lesson || '',
                        historicalContext: workObj.historicalContext || '',
                        thematicMeaning: workObj.thematicMeaning || '',
                        source: workObj.source || 'Kho tàng Dân gian Việt Nam',
                    });
                }
            }

            // Nếu ngày đó không chứa ID hợp lệ từ DB, lấy tự động từ danh sách candidateWorks
            if (dayWorksSnapshot.length === 0) {
                const fallbackWork = candidateWorks[(validDayCount - 1) % candidateWorks.length];
                validWorkIds.push(fallbackWork._id);
                dayWorksSnapshot.push({
                    workId: fallbackWork._id,
                    title: fallbackWork.title,
                    slug: fallbackWork.slug,
                    category: fallbackWork.category,
                    categoryName: fallbackWork.categoryName || '',
                    quote: fallbackWork.quote || fallbackWork.title,
                    summary: fallbackWork.summary || '',
                    literalMeaning: fallbackWork.literalMeaning || '',
                    figurativeMeaning: fallbackWork.figurativeMeaning || '',
                    lesson: fallbackWork.lesson || '',
                    historicalContext: fallbackWork.historicalContext || '',
                    thematicMeaning: fallbackWork.thematicMeaning || '',
                    source: fallbackWork.source || 'Kho tàng Dân gian Việt Nam',
                });
            }

            // Chuẩn hóa câu hỏi trắc nghiệm
            const validQuestions = [];
            if (Array.isArray(rawDay.practiceQuestions) && rawDay.practiceQuestions.length > 0) {
                rawDay.practiceQuestions.forEach((q, qIdx) => {
                    if (q.question && Array.isArray(q.options) && q.options.length >= 2) {
                        validQuestions.push({
                            questionId: `day_${validDayCount}_q${qIdx + 1}`,
                            question: q.question,
                            options: q.options,
                            correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < q.options.length ? q.correctIndex : 0,
                            explanation: q.explanation || '',
                            culturalContext: q.culturalContext || '',
                            workId: dayWorksSnapshot[0]?.workId || null,
                            workTitle: dayWorksSnapshot[0]?.title || '',
                        });
                    }
                });
            }

            // Nếu chưa có câu hỏi trắc nghiệm nào hợp lệ, tự động tạo từ tác phẩm
            if (validQuestions.length === 0) {
                const mainWork = dayWorksSnapshot[0];
                validQuestions.push(
                    {
                        questionId: `day_${validDayCount}_q1`,
                        question: `Tác phẩm/câu nói "${mainWork.title}" mang tầng nghĩa đen trực quan nào sau đây?`,
                        options: [
                            mainWork.literalMeaning || 'Hình ảnh sinh động xuất phát từ thực tiễn sinh hoạt và lao động cổ truyền.',
                            'Một nghi lễ triều đình bắt buộc vào ngày lễ tết.',
                            'Một câu chuyện thần thoại về nguồn gốc vũ trụ.',
                            'Một truyền thuyết về danh tướng thời xưa.',
                        ],
                        correctIndex: 0,
                        explanation: mainWork.literalMeaning || 'Ý nghĩa trực quan gắn với sinh hoạt dân gian.',
                        workId: mainWork.workId,
                        workTitle: mainWork.title,
                    },
                    {
                        questionId: `day_${validDayCount}_q2`,
                        question: `Bài học triết lý và đạo đức cốt lõi trong "${mainWork.title}" là gì?`,
                        options: [
                            'Chỉ hành động khi mang lại lợi ích tiền bạc cho bản thân.',
                            mainWork.lesson || mainWork.figurativeMeaning || 'Răn dạy tinh thần đạo lý, sống trọn nghĩa vẹn tình và nhớ ơn người đi trước.',
                            'Phải luôn né tránh khó khăn và không cần đoàn kết.',
                            'Không quan tâm đến văn hóa nguồn cội.',
                        ],
                        correctIndex: 1,
                        explanation: mainWork.lesson || 'Bài học đạo đức nhân bản sâu sắc của cha ông.',
                        workId: mainWork.workId,
                        workTitle: mainWork.title,
                    }
                );
            }

            formattedDays.push({
                day: validDayCount,
                title: rawDay.title || `Ngày ${validDayCount}: Khám phá ${dayWorksSnapshot[0].title}`,
                objective: rawDay.objective || `Nắm vững ý nghĩa và giá trị nhân văn của ${dayWorksSnapshot[0].title}`,
                phase: rawDay.phase || (validDayCount === 1 ? 'basic' : validDayCount === daysCount ? 'synthesis' : 'intermediate'),
                workIds: validWorkIds,
                works: dayWorksSnapshot,
                aiAnalysis: rawDay.aiAnalysis || `Chào mừng bạn đến với bài học Ngày ${validDayCount}. Hãy cùng tìm hiểu "${dayWorksSnapshot[0].title}".`,
                activity: rawDay.activity || `Đọc kỹ tác phẩm và chiêm nghiệm về bài học đạo đức trong cuộc sống hôm nay.`,
                practiceQuestions: validQuestions,
                estimatedMinutes: rawDay.estimatedMinutes || minutes,
                isCompleted: false,
                quizScore: null,
            });

            validDayCount++;
        }

        // 6. Lưu LearningPath mới vào cơ sở dữ liệu MongoDB
        const newPath = new LearningPath({
            user: userId,
            title: curriculum.title || `Lộ trình ${formattedDays.length} ngày: ${topicLabel}`,
            topic,
            topicLabel,
            goal: cleanGoal,
            totalDays: formattedDays.length,
            dailyMinutes: minutes,
            status: 'in_progress',
            days: formattedDays,
            progress: {
                completedDays: 0,
                percent: 0,
                currentDay: 1,
                lastLearnedAt: new Date(),
            },
            recommendations: [
                {
                    type: 'continue',
                    message: `Chào mừng bạn bắt đầu lộ trình! Hãy mở Bài học Ngày 1 để tìm hiểu "${formattedDays[0]?.works[0]?.title || 'tác phẩm đầu tiên'}".`,
                    suggestedDay: 1,
                    createdAt: new Date(),
                },
            ],
        });

        await newPath.save();
        return newPath;
    }

    /**
     * Lấy danh sách các lộ trình của người dùng
     */
    async getUserPaths(userId) {
        return await LearningPath.find({ user: userId })
            .select('title topic topicLabel goal totalDays dailyMinutes status progress updatedAt createdAt')
            .sort({ updatedAt: -1 })
            .lean();
    }

    /**
     * Lấy chi tiết một lộ trình và các bài học của người dùng
     */
    async getPathById({ pathId, userId }) {
        if (!mongoose.Types.ObjectId.isValid(pathId)) {
            throw new Error('Mã lộ trình không hợp lệ');
        }

        const path = await LearningPath.findOne({ _id: pathId, user: userId })
            .populate('days.workIds', 'title slug category categoryName quote summary readTime')
            .lean();

        if (!path) {
            throw new Error('Không tìm thấy lộ trình học hoặc bạn không có quyền truy cập');
        }

        return path;
    }

    /**
     * Lấy lộ trình đang học gần nhất của người dùng để tiếp tục
     */
    async getActivePath(userId) {
        const activePath = await LearningPath.findOne({ user: userId, status: 'in_progress' })
            .sort({ updatedAt: -1 })
            .lean();

        if (activePath) return activePath;

        // Nếu không có lộ trình in_progress, lấy lộ trình mới cập nhật nhất
        return await LearningPath.findOne({ user: userId })
            .sort({ updatedAt: -1 })
            .lean();
    }

    /**
     * Đánh dấu hoàn thành một ngày học (hoặc lưu ghi chú học tập)
     */
    async completeDayLesson({ pathId, userId, dayNumber, userNotes = '' }) {
        if (!mongoose.Types.ObjectId.isValid(pathId)) {
            throw new Error('Mã lộ trình không hợp lệ');
        }

        const path = await LearningPath.findOne({ _id: pathId, user: userId });
        if (!path) {
            throw new Error('Không tìm thấy lộ trình học hoặc bạn không có quyền truy cập');
        }

        const targetDay = path.days.find((d) => d.day === Number(dayNumber));
        if (!targetDay) {
            throw new Error(`Không tìm thấy ngày học số ${dayNumber}`);
        }

        targetDay.isCompleted = true;
        targetDay.completedAt = new Date();
        if (userNotes && userNotes.trim()) {
            targetDay.userNotes = userNotes.trim();
        }

        // Tính toán lại tiến độ hoàn thành
        const completedCount = path.days.filter((d) => d.isCompleted).length;
        path.progress.completedDays = completedCount;
        path.progress.percent = Math.round((completedCount / path.totalDays) * 100);
        path.progress.lastLearnedAt = new Date();

        // Cập nhật currentDay sang ngày kế tiếp chưa hoàn thành
        const nextUncompletedDay = path.days.find((d) => !d.isCompleted);
        if (nextUncompletedDay) {
            path.progress.currentDay = nextUncompletedDay.day;
        } else {
            path.status = 'completed';
            path.progress.percent = 100;
        }

        await path.save();
        return path;
    }

    /**
     * Nộp bài luyện tập trắc nghiệm của một ngày học, tính điểm, cập nhật tiến độ và sinh đề xuất cá nhân hóa
     */
    async submitDayQuiz({ pathId, userId, dayNumber, answers }) {
        if (!mongoose.Types.ObjectId.isValid(pathId)) {
            throw new Error('Mã lộ trình không hợp lệ');
        }

        if (!Array.isArray(answers)) {
            throw new Error('Dữ liệu bài nộp câu hỏi không hợp lệ');
        }

        const path = await LearningPath.findOne({ _id: pathId, user: userId });
        if (!path) {
            throw new Error('Không tìm thấy lộ trình học hoặc bạn không có quyền truy cập');
        }

        const targetDay = path.days.find((d) => d.day === Number(dayNumber));
        if (!targetDay) {
            throw new Error(`Không tìm thấy bài học Ngày ${dayNumber}`);
        }

        const questions = targetDay.practiceQuestions;
        let correctCount = 0;
        const quizDetails = [];
        const incorrectWorks = [];

        answers.forEach((ans, idx) => {
            const questionObj = questions.find((q) => q.questionId === ans.questionId) || questions[idx];
            if (!questionObj) return;

            const isCorrect = questionObj.correctIndex === ans.selectedIndex;
            if (isCorrect) correctCount++;
            else {
                incorrectWorks.push(questionObj.workTitle || targetDay.works[0]?.title || 'tác phẩm');
            }

            quizDetails.push({
                question: questionObj.question,
                selectedIndex: ans.selectedIndex,
                correctIndex: questionObj.correctIndex,
                isCorrect,
                explanation: questionObj.explanation,
            });
        });

        const totalQ = questions.length || 1;
        const score = Math.round((correctCount / totalQ) * 100);

        targetDay.quizScore = score;
        targetDay.quizDetails = quizDetails;
        targetDay.isCompleted = true;
        targetDay.completedAt = new Date();

        // Cập nhật tiến độ tổng thể của lộ trình
        const completedCount = path.days.filter((d) => d.isCompleted).length;
        path.progress.completedDays = completedCount;
        path.progress.percent = Math.round((completedCount / path.totalDays) * 100);
        path.progress.lastLearnedAt = new Date();

        const nextUncompletedDay = path.days.find((d) => !d.isCompleted);
        if (nextUncompletedDay) {
            path.progress.currentDay = nextUncompletedDay.day;
        } else {
            path.status = 'completed';
            path.progress.percent = 100;
        }

        // Sinh đề xuất học tập & ôn tập cá nhân hóa (Personalized Recommendations - FR-6)
        if (score < 60) {
            const workName = incorrectWorks[0] || targetDay.works[0]?.title || 'tác phẩm';
            path.recommendations.unshift({
                type: 'review',
                message: `Điểm kiểm tra Ngày ${dayNumber} đạt ${score}/100. Gợi ý bạn nên đọc lại phần giải thích nghĩa bóng và triết lý của "${workName}" để củng cố kiến thức trước khi tiếp tục.`,
                relatedWorkTitle: workName,
                relatedWorkSlug: targetDay.works[0]?.slug || '',
                suggestedDay: dayNumber,
                createdAt: new Date(),
            });
        } else if (score >= 80) {
            if (path.status === 'completed') {
                path.recommendations.unshift({
                    type: 'encouragement',
                    message: `Chúc mừng bạn đã hoàn thành xuất sắc toàn bộ lộ trình học tập với kết quả ấn tượng! Bạn đã thấu suốt tinh hoa đạo lý dân tộc.`,
                    createdAt: new Date(),
                });
            } else {
                path.recommendations.unshift({
                    type: 'advance',
                    message: `Kết quả xuất sắc: ${score}/100 ở Ngày ${dayNumber}! Bạn đã nắm vững triết lý bài học. Hãy vững tin bước sang Ngày ${path.progress.currentDay}!`,
                    suggestedDay: path.progress.currentDay,
                    createdAt: new Date(),
                });
            }
        } else {
            path.recommendations.unshift({
                type: 'continue',
                message: `Hoàn thành tốt Ngày ${dayNumber} (${score}/100). Hãy tiếp tục duy trì nhịp độ học tập ở Ngày ${path.progress.currentDay}!`,
                suggestedDay: path.progress.currentDay,
                createdAt: new Date(),
            });
        }

        // Giữ tối đa 10 khuyến nghị gần nhất
        if (path.recommendations.length > 10) {
            path.recommendations = path.recommendations.slice(0, 10);
        }

        await path.save();

        // Ghi nhận vào QuizProgress chung của User (FR-7)
        try {
            let progress = await QuizProgress.findOne({ user: userId });
            if (!progress) {
                progress = new QuizProgress({
                    user: userId,
                    totalQuizzes: 0,
                    totalQuestions: 0,
                    totalCorrect: 0,
                    categoryStats: new Map(),
                    badges: [],
                    history: [],
                });
            }

            progress.totalQuizzes += 1;
            progress.totalQuestions += totalQ;
            progress.totalCorrect += correctCount;

            const categoryKey = targetDay.works[0]?.category || 'ca-dao';
            const currentCatStat = progress.categoryStats.get ? progress.categoryStats.get(categoryKey) : progress.categoryStats[categoryKey];
            const updatedTotal = (currentCatStat?.total || 0) + totalQ;
            const updatedCorrect = (currentCatStat?.correct || 0) + correctCount;

            if (progress.categoryStats.set) {
                progress.categoryStats.set(categoryKey, { total: updatedTotal, correct: updatedCorrect });
            } else {
                progress.categoryStats[categoryKey] = { total: updatedTotal, correct: updatedCorrect };
            }

            // Ghi vào lịch sử gần nhất
            progress.history.unshift({
                score,
                totalQuestions: totalQ,
                correctCount,
                category: categoryKey,
                mode: 'personalized',
                badgeTitle: score >= 80 ? 'Học Giả Lộ Trình' : 'Tập Sự Di Sản',
                completedAt: new Date(),
            });

            if (progress.history.length > 20) {
                progress.history = progress.history.slice(0, 20);
            }

            await progress.save();
        } catch (quizErr) {
            console.warn('[Learning Path] Cập nhật QuizProgress phụ:', quizErr.message);
        }

        return {
            path,
            day: targetDay,
            score,
            correctCount,
            totalQuestions: totalQ,
            passed: score >= 60,
            quizDetails,
        };
    }

    /**
     * Xóa lộ trình học của người dùng
     */
    async deletePath({ pathId, userId }) {
        if (!mongoose.Types.ObjectId.isValid(pathId)) {
            throw new Error('Mã lộ trình không hợp lệ');
        }

        const deleted = await LearningPath.findOneAndDelete({ _id: pathId, user: userId });
        if (!deleted) {
            throw new Error('Không tìm thấy lộ trình hoặc bạn không có quyền xóa');
        }

        return { success: true, message: 'Đã xóa lộ trình thành công' };
    }
}

module.exports = new LearningPathService();
