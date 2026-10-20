const Work = require('../models/Work');
const QuizProgress = require('../models/QuizProgress');
const QuizQuestion = require('../models/QuizQuestion');
const quizQuestionsData = require('../seeds/quizQuestions.data');

/**
 * Danh mục toàn bộ các Huy hiệu Thành tích (Achievement Badges)
 */
const ALL_ACHIEVEMENT_BADGES = [
    {
        id: 'first_quiz',
        title: 'Tân thủ Di sản',
        description: 'Hoàn thành lượt thi trắc nghiệm đầu tiên',
        icon: 'BookOpen',
        category: 'general',
        criterion: 'Hoàn thành 1 lượt trắc nghiệm bất kỳ',
    },
    {
        id: 'master_ca_dao',
        title: 'Am hiểu Ca dao',
        description: 'Trả lời đúng từ 5 câu Ca dao & Tục ngữ trở lên',
        icon: 'Sparkles',
        category: 'ca-dao',
        criterion: 'Đúng >= 5 câu thể loại Ca dao - Tục ngữ',
    },
    {
        id: 'master_tuc_ngu',
        title: 'Bậc thầy Tục ngữ',
        description: 'Trả lời đúng từ 10 câu Ca dao & Tục ngữ',
        icon: 'Award',
        category: 'ca-dao',
        criterion: 'Đúng >= 10 câu thể loại Ca dao - Tục ngữ',
    },
    {
        id: 'master_co_tich',
        title: 'Học giả Cổ tích',
        description: 'Trả lời đúng từ 5 câu Truyện cổ tích trở lên',
        icon: 'Crown',
        category: 'co-tich',
        criterion: 'Đúng >= 5 câu thể loại Truyện cổ tích',
    },
    {
        id: 'master_truyen_thuyet',
        title: 'Hào khí Truyền thuyết',
        description: 'Trả lời đúng từ 5 câu Thần thoại & Truyền thuyết',
        icon: 'Flame',
        category: 'truyen-thuyet',
        criterion: 'Đúng >= 5 câu Thần thoại & Truyền thuyết',
    },
    {
        id: 'master_trung_dai',
        title: 'Uyên bác Văn học Trung đại',
        description: 'Trả lời đúng từ 5 câu Văn học Trung đại trở lên',
        icon: 'Scroll',
        category: 'trung-dai',
        criterion: 'Đúng >= 5 câu thể loại Văn học Trung đại',
    },
    {
        id: 'perfect_score',
        title: 'Trạng nguyên Toàn năng',
        description: 'Đạt điểm tuyệt đối 100/100 trong một bài thi',
        icon: 'Trophy',
        category: 'special',
        criterion: 'Đạt điểm số 100 trong một lượt thi',
    },
    {
        id: 'daily_master',
        title: 'Chiến binh Bền bỉ',
        description: 'Hoàn thành Thử thách Hàng ngày (Daily Challenge)',
        icon: 'Calendar',
        category: 'daily',
        criterion: 'Vượt qua Thử thách Ngày đạt từ 60 điểm trở lên',
    },
    {
        id: 'quiz_veteran',
        title: 'Bách gia Chư tử',
        description: 'Hoàn thành từ 5 lượt thi trắc nghiệm trở lên',
        icon: 'Medal',
        category: 'milestone',
        criterion: 'Hoàn thành >= 5 bài thi trắc nghiệm',
    },
];

/**
 * Lấy chuỗi ngày YYYY-MM-DD theo múi giờ Việt Nam
 */
function getVietnamDateString() {
    try {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date());
    } catch {
        return new Date().toISOString().slice(0, 10);
    }
}

/**
 * Helper gắn thông tin Work liên quan và ẩn đáp án đúng trước khi gửi về client
 */
async function attachRelatedWorks(questions) {
    const slugs = questions.map((q) => q.relatedWorkSlug).filter(Boolean);
    const relatedWorks = await Work.find({ slug: { $in: slugs } })
        .select('title slug category categoryName')
        .lean();

    const workMap = {};
    for (const w of relatedWorks) {
        workMap[w.slug] = w;
    }

    return questions.map((q) => ({
        id: q.questionId || q.id,
        category: q.category,
        categoryName: q.categoryName,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        relatedWork: q.relatedWork || workMap[q.relatedWorkSlug] || null,
    }));
}

/**
 * Lấy danh sách câu hỏi trắc nghiệm từ Database (MongoDB)
 * Hỗ trợ: 'all', category cụ thể, 'personalized' (cá nhân hóa cho user) và 'daily' (thử thách ngày)
 */
const getQuestions = async ({ category = 'all', count = 5, userId = null }) => {
    const requestedCount = Math.max(1, Number(count) || 5);
    const today = getVietnamDateString();

    // 1. CHẾ ĐỘ DAILY CHALLENGE (Thử thách ngày: seed cố định theo ngày YYYY-MM-DD)
    if (category === 'daily') {
        const pool = await QuizQuestion.find({ isActive: true }).lean();
        if (pool.length === 0) return [];

        let seed = 0;
        for (let i = 0; i < today.length; i++) {
            seed += today.charCodeAt(i) * (i + 1);
        }

        // Sắp xếp xác định theo seed của ngày
        const dailyPool = [...pool].sort((a, b) => {
            const hA = (seed * (a.questionId?.charCodeAt(1) || 1)) % 100;
            const hB = (seed * (b.questionId?.charCodeAt(1) || 1)) % 100;
            return hA - hB;
        });

        const selected = dailyPool.slice(0, Math.min(requestedCount, dailyPool.length));
        return attachRelatedWorks(selected);
    }

    // 2. CHẾ ĐỘ PERSONALIZED QUIZ (Cá nhân hóa cho Registered User dựa trên lịch sử điểm)
    if (category === 'personalized' && userId) {
        try {
            const progress = await QuizProgress.findOne({ user: userId });
            if (progress && progress.categoryStats) {
                const stats = progress.categoryStats;
                const categoryPerformances = [];
                const allCats = ['co-tich', 'truyen-thuyet', 'than-thoai', 'ca-dao', 'trung-dai'];

                for (const cat of allCats) {
                    const cStat = stats.get ? stats.get(cat) : stats[cat];
                    const total = cStat?.total || 0;
                    const correct = cStat?.correct || 0;
                    const accuracy = total > 0 ? correct / total : 0;
                    categoryPerformances.push({ cat, total, accuracy });
                }

                // Ưu tiên chủ đề làm ít câu nhất hoặc tỷ lệ đúng thấp nhất
                categoryPerformances.sort((a, b) => a.accuracy - b.accuracy || a.total - b.total);
                const weakCategory = categoryPerformances[0]?.cat || 'ca-dao';

                const weakQuestions = await QuizQuestion.aggregate([
                    { $match: { category: weakCategory, isActive: true } },
                    { $sample: { size: 3 } },
                ]);

                const remaining = Math.max(0, requestedCount - weakQuestions.length);
                const otherQuestions = await QuizQuestion.aggregate([
                    { $match: { category: { $ne: weakCategory }, isActive: true } },
                    { $sample: { size: remaining } },
                ]);

                const combined = [...weakQuestions, ...otherQuestions].sort(() => 0.5 - Math.random());
                if (combined.length > 0) {
                    return attachRelatedWorks(combined);
                }
            }
        } catch (err) {
            console.warn('[Personalized Quiz] Lỗi tính cá nhân hóa từ DB:', err.message);
        }
    }

    // 3. CHẾ ĐỘ THEO THỂ LOẠI CỤ THỂ HOẶC TOÀN BỘ (Sử dụng MongoDB $sample bốc ngẫu nhiên cực nhanh)
    const match = { isActive: true };
    if (category && category !== 'all' && category !== 'personalized' && category !== 'daily') {
        match.category = category;
    }

    let selected = await QuizQuestion.aggregate([
        { $match: match },
        { $sample: { size: requestedCount } },
    ]);

    // Dự phòng trường hợp DB trống dữ liệu (fallback sang seed data)
    if (!selected || selected.length === 0) {
        let pool = [...quizQuestionsData];
        if (category && category !== 'all') {
            pool = pool.filter((q) => q.category === category);
        }
        selected = pool.sort(() => 0.5 - Math.random()).slice(0, requestedCount);
    }

    return attachRelatedWorks(selected);
};

/**
 * Chấm điểm bài thi và lưu tiến độ cho Registered User (Guest không lưu)
 */
const submitQuiz = async ({ answers, userId = null, mode = 'standard', category = 'all' }) => {
    if (!Array.isArray(answers)) {
        throw new Error('Dữ liệu bài nộp không hợp lệ');
    }

    // Tra cứu danh sách câu hỏi trực tiếp từ Database
    const questionIds = answers.map((a) => a.questionId).filter(Boolean);
    const dbQuestions = await QuizQuestion.find({ questionId: { $in: questionIds } }).lean();

    const questionMap = {};
    for (const q of dbQuestions) {
        questionMap[q.questionId] = q;
    }

    // Dự phòng fallback sang file seed nếu chưa kịp query DB
    for (const seedQ of quizQuestionsData) {
        if (!questionMap[seedQ.questionId]) {
            questionMap[seedQ.questionId] = seedQ;
        }
    }

    let correctCount = 0;
    const details = [];
    const categoryCorrectDelta = {};
    const categoryTotalDelta = {};

    for (const ans of answers) {
        const original = questionMap[ans.questionId];
        if (!original) continue;

        const isCorrect = original.correctIndex === ans.selectedIndex;
        if (isCorrect) correctCount += 1;

        const cat = original.category || 'other';
        categoryTotalDelta[cat] = (categoryTotalDelta[cat] || 0) + 1;
        if (isCorrect) {
            categoryCorrectDelta[cat] = (categoryCorrectDelta[cat] || 0) + 1;
        }

        details.push({
            questionId: original.questionId,
            question: original.question,
            category: original.category,
            categoryName: original.categoryName,
            userSelectedIndex: ans.selectedIndex,
            userAnswer: original.options[ans.selectedIndex] || 'Chưa chọn',
            correctIndex: original.correctIndex,
            correctAnswer: original.options[original.correctIndex],
            isCorrect,
            explanation: original.explanation,
            culturalContext: original.culturalContext || '',
            academicSource: original.academicSource || '',
            relatedWorkSlug: original.relatedWorkSlug,
        });
    }

    const totalQuestions = answers.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Xác định Danh hiệu Di sản của bài thi (Session Badge)
    let badge = {
        title: 'Tập Sự Tri Thức',
        description: 'Hãy tiếp tục đọc thêm các câu chuyện dân gian để mở rộng kho tàng tri thức!',
        tier: 'bronze',
        icon: 'Scroll',
    };

    if (score === 100) {
        badge = {
            title: 'Trạng Nguyên Văn Học',
            description: 'Tuyệt đỉnh uyên bác! Bạn nắm trọn tinh hoa và chiều sâu triết lý của di sản dân tộc!',
            tier: 'gold',
            icon: 'Crown',
        };
    } else if (score >= 80) {
        badge = {
            title: 'Bảng Nhãn Di Sản',
            description: 'Vốn hiểu biết sâu rộng! Bạn am tường các sự tích và nét đẹp đạo lý cổ truyền!',
            tier: 'silver',
            icon: 'Award',
        };
    } else if (score >= 60) {
        badge = {
            title: 'Thám Hoa Dân Gian',
            description: 'Rất ấn tượng! Bạn có nền tảng vững vàng về văn học dân gian nước nhà.',
            tier: 'emerald',
            icon: 'Sparkles',
        };
    } else if (score >= 40) {
        badge = {
            title: 'Tú Tài Đồng Môn',
            description: 'Khá tốt! Bạn đã nắm được những câu chuyện cốt lõi của tiền nhân.',
            tier: 'amber',
            icon: 'BookOpen',
        };
    }

    // NẾU LÀ GUEST (userId === null) -> Trả về kết quả ngay, KHÔNG lưu vào Database
    if (!userId) {
        return {
            totalQuestions,
            correctCount,
            score,
            passed: score >= 60,
            badge,
            details,
            isGuest: true,
            newlyUnlockedBadges: [],
        };
    }

    // NẾU LÀ REGISTERED USER -> Lưu tiến độ (Learning Progress & Badges) vào MongoDB
    let newlyUnlockedBadges = [];
    const today = getVietnamDateString();

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
                dailyChallenge: { lastCompletedDate: null, streak: 0 },
            });
        }

        // 1. Cập nhật tổng số
        progress.totalQuizzes += 1;
        progress.totalQuestions += totalQuestions;
        progress.totalCorrect += correctCount;

        // 2. Cập nhật categoryStats
        for (const cat of Object.keys(categoryTotalDelta)) {
            const current = progress.categoryStats.get(cat) || { total: 0, correct: 0 };
            progress.categoryStats.set(cat, {
                total: (current.total || 0) + (categoryTotalDelta[cat] || 0),
                correct: (current.correct || 0) + (categoryCorrectDelta[cat] || 0),
            });
        }

        // 3. Xử lý Daily Challenge nếu ở chế độ 'daily'
        let isDailySuccess = false;
        if (mode === 'daily' && score >= 60) {
            isDailySuccess = true;
            if (progress.dailyChallenge.lastCompletedDate !== today) {
                progress.dailyChallenge.lastCompletedDate = today;
                progress.dailyChallenge.streak = (progress.dailyChallenge.streak || 0) + 1;
            }
        }

        // 4. Kiểm tra mở khóa Huy hiệu Thành tích mới (Achievement Badges)
        const earnedIds = new Set(progress.badges.map((b) => b.id));

        for (const bDef of ALL_ACHIEVEMENT_BADGES) {
            if (earnedIds.has(bDef.id)) continue;

            let isUnlocked = false;

            if (bDef.id === 'first_quiz' && progress.totalQuizzes >= 1) isUnlocked = true;
            if (bDef.id === 'perfect_score' && score === 100) isUnlocked = true;
            if (bDef.id === 'quiz_veteran' && progress.totalQuizzes >= 5) isUnlocked = true;
            if (bDef.id === 'daily_master' && isDailySuccess) isUnlocked = true;

            // Kiểm tra tích lũy câu đúng theo thể loại
            if (bDef.id === 'master_ca_dao') {
                const cStat = progress.categoryStats.get('ca-dao');
                if (cStat && cStat.correct >= 5) isUnlocked = true;
            }
            if (bDef.id === 'master_tuc_ngu') {
                const cStat = progress.categoryStats.get('ca-dao');
                if (cStat && cStat.correct >= 10) isUnlocked = true;
            }
            if (bDef.id === 'master_co_tich') {
                const cStat = progress.categoryStats.get('co-tich');
                if (cStat && cStat.correct >= 5) isUnlocked = true;
            }
            if (bDef.id === 'master_truyen_thuyet') {
                const truyenThuyetStat = progress.categoryStats.get('truyen-thuyet')?.correct || 0;
                const thanThoaiStat = progress.categoryStats.get('than-thoai')?.correct || 0;
                if (truyenThuyetStat + thanThoaiStat >= 5) isUnlocked = true;
            }
            if (bDef.id === 'master_trung_dai') {
                const cStat = progress.categoryStats.get('trung-dai');
                if (cStat && cStat.correct >= 5) isUnlocked = true;
            }

            if (isUnlocked) {
                const newBadge = {
                    id: bDef.id,
                    title: bDef.title,
                    description: bDef.description,
                    category: bDef.category,
                    icon: bDef.icon,
                    earnedAt: new Date(),
                };
                progress.badges.push(newBadge);
                newlyUnlockedBadges.push(newBadge);
            }
        }

        // 5. Lưu lại 15 lượt thi gần nhất vào lịch sử
        if (!progress.history) progress.history = [];
        progress.history.unshift({
            date: new Date(),
            mode,
            category,
            totalQuestions,
            correctCount,
            score,
            badgeTitle: badge.title,
        });

        if (progress.history.length > 15) {
            progress.history = progress.history.slice(0, 15);
        }

        await progress.save();
    } catch (saveErr) {
        console.error('[Quiz Progress] Lỗi lưu tiến độ người dùng:', saveErr.message);
    }

    return {
        totalQuestions,
        correctCount,
        score,
        passed: score >= 60,
        badge,
        details,
        isGuest: false,
        newlyUnlockedBadges,
    };
};

/**
 * Lấy toàn bộ thông tin tiến độ, thống kê theo thể loại & huy hiệu của Registered User
 */
const getUserProgress = async (userId) => {
    let progress = await QuizProgress.findOne({ user: userId }).lean();

    if (!progress) {
        return {
            totalQuizzes: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            overallAccuracy: 0,
            categoryStats: [],
            badges: [],
            allBadges: ALL_ACHIEVEMENT_BADGES.map((b) => ({ ...b, earned: false })),
            dailyChallenge: { completedToday: false, streak: 0 },
            history: [],
        };
    }

    const today = getVietnamDateString();
    const overallAccuracy =
        progress.totalQuestions > 0 ? Math.round((progress.totalCorrect / progress.totalQuestions) * 100) : 0;

    const categoryNames = {
        'co-tich': 'Truyện cổ tích',
        'truyen-thuyet': 'Truyền thuyết',
        'than-thoai': 'Thần thoại',
        'ca-dao': 'Ca dao - Tục ngữ',
        'trung-dai': 'Văn học Trung đại',
    };

    const categoryStatsList = Object.keys(categoryNames).map((catKey) => {
        const stat = progress.categoryStats?.[catKey] || { total: 0, correct: 0 };
        return {
            id: catKey,
            category: catKey,
            name: categoryNames[catKey],
            categoryName: categoryNames[catKey],
            total: stat.total || 0,
            correct: stat.correct || 0,
            accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
        };
    });

    const earnedBadgeIds = new Set((progress.badges || []).map((b) => b.id));
    const allBadgesWithStatus = ALL_ACHIEVEMENT_BADGES.map((bDef) => {
        const isUnlocked = earnedBadgeIds.has(bDef.id);
        return {
            ...bDef,
            earned: isUnlocked,
            isUnlocked: isUnlocked,
            earnedAt: progress.badges?.find((b) => b.id === bDef.id)?.earnedAt || null,
        };
    });

    return {
        totalQuizzes: progress.totalQuizzes,
        totalQuestions: progress.totalQuestions,
        totalCorrect: progress.totalCorrect,
        overallAccuracy,
        categoryStats: categoryStatsList,
        badges: progress.badges,
        allBadges: allBadgesWithStatus,
        dailyChallenge: {
            completedToday: progress.dailyChallenge?.lastCompletedDate === today,
            streak: progress.dailyChallenge?.streak || 0,
        },
        history: progress.history || [],
    };
};

/**
 * AI Explanation cho một câu hỏi trắc nghiệm
 * Cung cấp phân tích đa tầng chuyên sâu: ý nghĩa nhân văn, bối cảnh lịch sử, bài học và nguồn học thuật
 */
const getAiQuestionExplanation = async ({ questionId, selectedAnswer = null }) => {
    // Tìm câu hỏi trong MongoDB, đồng thời populate thông tin tác phẩm liên quan
    let q = await QuizQuestion.findOne({ questionId }).populate('relatedWork').lean();

    // Fallback sang seed data nếu chưa tìm thấy trong DB
    if (!q) {
        q = quizQuestionsData.find((item) => item.questionId === questionId);
    }

    if (!q) {
        throw new Error('Không tìm thấy câu hỏi trong ngân hàng dữ liệu');
    }

    // Tra cứu thêm chi tiết tác phẩm liên quan nếu chưa có trong relatedWork
    let relatedDetail = q.relatedWork || null;
    if (!relatedDetail && q.relatedWorkSlug) {
        relatedDetail = await Work.findOne({ slug: q.relatedWorkSlug }).lean();
    }

    const isCorrect = selectedAnswer === q.options[q.correctIndex];

    const deepAnalysis = `
### 1. Phân tích cốt lõi & Đáp án chính xác:
- **Đáp án đúng:** **"${q.options[q.correctIndex]}"**
${isCorrect ? '✅ Bạn đã chọn hoàn toàn chính xác!' : `⚠️ Bạn đã chọn: *"${selectedAnswer || 'Chưa trả lời'}"*`}
- **Ý nghĩa trọng tâm:** ${q.explanation}

### 2. Chiều sâu Bối cảnh Văn hóa & Lịch sử:
${q.culturalContext || 'Tác phẩm phản ánh chân thực nhân sinh quan, thế giới quan và tâm hồn thuần hậu, giàu đức hy sinh của dân tộc Việt Nam qua hàng ngàn năm dựng nước và giữ nước.'}
${relatedDetail?.historicalContext ? `\n> *${relatedDetail.historicalContext}*` : ''}

### 3. Bài học Đạo lý & Triết lý Nhân sinh:
${relatedDetail?.thematicMeaning || 'Câu chuyện nhắc nhở thế hệ hôm nay luôn trân trọng đạo lý truyền thống, gìn giữ cội nguồn bản sắc và sống ân nghĩa, bao dung.'}

---
*Nguồn tư liệu đối chiếu học thuật:* **${q.academicSource || relatedDetail?.source || 'Viện Nghiên cứu Hán Nôm & Viện Văn học Việt Nam'}**`;

    return {
        questionId: q.questionId,
        question: q.question,
        correctAnswer: q.options[q.correctIndex],
        deepExplanation: deepAnalysis,
        academicSource: q.academicSource || relatedDetail?.source || 'Tư liệu Văn học Dân gian Việt Nam',
        relatedWork: relatedDetail
            ? {
                  title: relatedDetail.title,
                  slug: relatedDetail.slug,
                  categoryName: relatedDetail.categoryName,
              }
            : null,
    };
};

module.exports = {
    QUIZ_QUESTION_BANK: quizQuestionsData,
    ALL_ACHIEVEMENT_BADGES,
    getQuestions,
    submitQuiz,
    getUserProgress,
    getAiQuestionExplanation,
};
