const User = require('../models/User');
const ExperienceTransaction = require('../models/ExperienceTransaction');
const DailyLearningActivity = require('../models/DailyLearningActivity');

// Cấu hình điểm EXP theo quy tắc nghiệp vụ
const EXP_CONFIG = {
    READ_WORK: 5,            // Đọc và tìm hiểu 1 tác phẩm
    AI_TUTOR_CHAT: 10,       // Đàm đạo với Gia sư AI
    QUIZ_CORRECT: 10,        // Trả lời đúng 1 câu quiz
    POEM_REVIEWED: 15,       // Sáng tác & thẩm định thơ Lục Bát
    SUBMISSION_APPROVED: 50, // Đóng góp ca dao được duyệt
    DUEL_VICTORY: 30,        // Chiến thắng trận đấu Thi Đình 1v1
    DUEL_PARTICIPATE: 10,    // Hoàn thành trận đấu Thi Đình
    DAILY_STREAK: 10,        // Thưởng duy trì chuỗi học tập
};

// Cấu hình 6 bậc danh hiệu khoa bảng cổ truyền
const ACADEMIC_TITLES = [
    { minExp: 0, maxExp: 100, title: 'Đồng Tử / Học Sinh', color: 'stone', badge: '🌱', description: 'Mới nhập môn, bắt đầu hành trình tìm hiểu văn hóa dân gian' },
    { minExp: 101, maxExp: 300, title: 'Tú Tài', color: 'amber', badge: '📜', description: 'Nắm vững kiến thức ca dao tục ngữ căn bản' },
    { minExp: 301, maxExp: 700, title: 'Cử Nhân', color: 'emerald', badge: '🏮', description: 'Hiểu sâu sắc nghĩa đen, nghĩa bóng và đạo lý truyền thống' },
    { minExp: 701, maxExp: 1500, title: 'Tiến Sĩ', color: 'blue', badge: '🏅', description: 'Thấu hiểu bối cảnh lịch sử, tích truyện và văn hóa trung đại' },
    { minExp: 1501, maxExp: 3000, title: 'Bảng Nhãn / Thám Hoa', color: 'indigo', badge: '🌟', description: 'Trí tuệ uyên bác, thông tỏ kho tàng di sản ba miền' },
    { minExp: 3001, maxExp: Infinity, title: 'Trạng Nguyên', color: 'rose', badge: '👑', description: 'Đỉnh cao học vấn di sản văn hóa dân tộc' },
];

/**
 * Lấy danh hiệu khoa bảng tương ứng với số EXP
 */
function getTitleByExp(exp) {
    const validExp = Math.max(0, exp || 0);
    const found = ACADEMIC_TITLES.find((t) => validExp >= t.minExp && validExp <= t.maxExp);
    return found || ACADEMIC_TITLES[0];
}

/**
 * Lấy chuỗi ngày YYYY-MM-DD theo giờ Việt Nam (UTC+7)
 */
function getVietnamDateStr(date = new Date()) {
    const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return vnTime.toISOString().slice(0, 10);
}

/**
 * Tính toán chuỗi ngày học liên tục (Streak)
 */
async function calculateUserStreak(userId) {
    const todayStr = getVietnamDateStr();
    
    // Lấy danh sách các ngày học gần nhất sắp xếp giảm dần
    const activities = await DailyLearningActivity.find({ userId })
        .sort({ dateStr: -1 })
        .limit(60)
        .lean();

    if (activities.length === 0) {
        return { current: 0, isActiveToday: false, highest: 0 };
    }

    const uniqueDates = activities.map((a) => a.dateStr);
    const isActiveToday = uniqueDates.includes(todayStr);

    let streak = 0;
    // Kiểm tra liên tục lùi từng ngày
    let checkDate = new Date();
    // Nếu hôm nay chưa học, kiểm tra bắt đầu từ hôm qua
    if (!isActiveToday) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        const dStr = getVietnamDateStr(checkDate);
        if (uniqueDates.includes(dStr)) {
            streak += 1;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return {
        current: streak,
        isActiveToday,
        highest: Math.max(streak, activities.length),
    };
}

/**
 * Ghi nhận hoạt động học tập và cộng điểm Heritage EXP
 */
async function awardExperience({ userId, actionType, targetId = null, description = '' }) {
    if (!userId || !actionType) {
        throw new Error('Thiếu thông tin người dùng hoặc loại hoạt động');
    }

    const expAmount = EXP_CONFIG[actionType] || 5;

    // Chống cộng điểm trùng lặp cho các hành động 1 lần (Idempotency)
    if (targetId) {
        const existing = await ExperienceTransaction.findOne({
            userId,
            actionType,
            targetId,
        });
        if (existing) {
            // Đã được cộng điểm trước đó -> trả về trạng thái hiện tại mà không cộng thêm
            return {
                awarded: false,
                reason: 'Hành động này đã được ghi nhận trước đó',
                expEarned: 0,
            };
        }
    }

    // 1. Ghi nhận giao dịch EXP
    const transaction = await ExperienceTransaction.create({
        userId,
        actionType,
        expEarned: expAmount,
        targetId,
        description: description || `Cộng ${expAmount} EXP từ hoạt động ${actionType}`,
    });

    // 2. Ghi nhận hoạt động vào DailyLearningActivity
    const dateStr = getVietnamDateStr();
    await DailyLearningActivity.findOneAndUpdate(
        { userId, dateStr },
        {
            $inc: { activityCount: 1 },
            $addToSet: { activities: actionType },
        },
        { upsert: true, returnDocument: 'after' }
    );

    // 3. Tính tổng EXP hiện tại của người dùng
    const totalExpAgg = await ExperienceTransaction.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$expEarned' } } },
    ]);
    const totalExp = totalExpAgg[0]?.total || expAmount;

    // 4. Tính danh hiệu khoa bảng mới
    const titleInfo = getTitleByExp(totalExp);

    // Cập nhật vào User model nếu có trường heritageExp
    await User.findByIdAndUpdate(userId, {
        $set: {
            heritageExp: totalExp,
            academicTitle: titleInfo.title,
        },
    });

    // 5. Tính streak
    const streakInfo = await calculateUserStreak(userId);

    return {
        awarded: true,
        expEarned: expAmount,
        totalExp,
        academicTitle: titleInfo.title,
        titleInfo,
        streak: streakInfo,
        transaction,
    };
}

/**
 * Lấy thông tin thành tích, danh hiệu và lịch sử EXP của người dùng
 */
async function getUserHeritageStats(userId) {
    const [totalExpAgg, transactions, streakInfo] = await Promise.all([
        ExperienceTransaction.aggregate([
            { $match: { userId: typeof userId === 'string' ? new (require('mongoose').Types.ObjectId)(userId) : userId } },
            { $group: { _id: null, total: { $sum: '$expEarned' } } },
        ]),
        ExperienceTransaction.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
        calculateUserStreak(userId),
    ]);

    const totalExp = totalExpAgg[0]?.total || 0;
    const currentTitle = getTitleByExp(totalExp);

    // Tính mốc EXP tiếp theo
    const nextTitle = ACADEMIC_TITLES.find((t) => t.minExp > totalExp) || null;
    const progressPercent = nextTitle
        ? Math.min(100, Math.round(((totalExp - currentTitle.minExp) / (nextTitle.minExp - currentTitle.minExp)) * 100))
        : 100;

    return {
        totalExp,
        academicTitle: currentTitle.title,
        titleInfo: currentTitle,
        nextTitle,
        progressPercent,
        streak: streakInfo,
        recentTransactions: transactions,
        allTitles: ACADEMIC_TITLES,
    };
}

/**
 * Lấy Bảng Vàng Trạng Nguyên (Leaderboard) theo Tuần, Tháng hoặc Mọi thời đại
 */
async function getLeaderboard({ type = 'all', limit = 10 }) {
    const limitNum = Math.min(50, parseInt(limit, 10) || 10);
    const now = new Date();

    let matchStage = {};

    if (type === 'week') {
        // Đầu tuần này (Thứ 2 00:00:00)
        const dayOfWeek = now.getDay() || 7; // Chủ nhật là 7
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        matchStage = { createdAt: { $gte: startOfWeek } };
    } else if (type === 'month') {
        // Đầu tháng này (Ngày 1 00:00:00)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        matchStage = { createdAt: { $gte: startOfMonth } };
    }

    // Pipeline nhóm theo user và cộng điểm trong kỳ
    const pipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: '$userId',
                periodExp: { $sum: '$expEarned' },
                activityCount: { $sum: 1 },
                lastActivity: { $max: '$createdAt' },
            },
        },
        { $sort: { periodExp: -1, lastActivity: 1 } },
        { $limit: limitNum },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: '$user' },
        {
            $project: {
                userId: '$_id',
                name: '$user.name',
                avatar: '$user.avatar',
                periodExp: 1,
                totalExp: '$user.heritageExp',
                activityCount: 1,
                lastActivity: 1,
            },
        },
    ];

    let leaderboardData = await ExperienceTransaction.aggregate(pipeline);

    // Nếu bảng xếp hạng tuần/tháng chưa có giao dịch nào, lấy từ top users mọi thời đại để không bị trống
    if (leaderboardData.length === 0 && (type === 'week' || type === 'month')) {
        const topUsers = await User.find({ status: 'active' })
            .select('name avatar heritageExp')
            .sort({ heritageExp: -1 })
            .limit(limitNum)
            .lean();

        leaderboardData = topUsers.map((u) => ({
            userId: u._id,
            name: u.name,
            avatar: u.avatar,
            periodExp: 0,
            totalExp: u.heritageExp || 0,
        }));
    }

    // Bổ sung thông tin danh hiệu và thứ hạng
    const formatted = leaderboardData.map((item, index) => {
        const effectiveExp = item.totalExp || item.periodExp || 0;
        const titleInfo = getTitleByExp(effectiveExp);
        return {
            rank: index + 1,
            userId: item.userId,
            name: item.name || 'Sĩ tử Di sản',
            avatar: item.avatar || '',
            periodExp: item.periodExp,
            totalExp: effectiveExp,
            academicTitle: titleInfo.title,
            titleBadge: titleInfo.badge,
            titleColor: titleInfo.color,
        };
    });

    return formatted;
}

module.exports = {
    EXP_CONFIG,
    ACADEMIC_TITLES,
    getTitleByExp,
    awardExperience,
    calculateUserStreak,
    getUserHeritageStats,
    getLeaderboard,
};
