const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const User = require('../models/User');

/**
 * Lấy toàn bộ cây kỹ năng (Skill Tree) theo các chặng
 * GET /api/learning/skill-tree
 */
const getSkillTree = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;

        // Lấy tất cả bài học đang hoạt động
        const lessons = await Lesson.find({ isActive: true }).sort({ stage: 1, order: 1 });

        // Lấy tiến độ của user nếu đã đăng nhập
        let userProgressMap = {};
        if (userId) {
            const progressList = await Progress.find({ user: userId });
            progressList.forEach((p) => {
                userProgressMap[p.lesson.toString()] = p;
            });
        }

        // Cấu hình thông tin 5 Chặng chuẩn HeartSign
        const stageConfigs = {
            1: {
                id: 1,
                title: 'Chặng 1: Khởi Động & Chào Hỏi Cơ Bản',
                description: 'Bảng chữ cái ngón tay, cử chỉ chào hỏi, cảm ơn và xưng hô nhập môn.',
                requiredXp: 0,
            },
            2: {
                id: 2,
                title: 'Chặng 2: Số Đếm & Khái Niệm Thời Gian',
                description: 'Nhận biết các con số từ 1 đến 100, các thứ trong tuần và mốc thời gian.',
                requiredXp: 150,
            },
            3: {
                id: 3,
                title: 'Chặng 3: Gia Đình & Giao Tiếp Thường Nhật',
                description: 'Ký hiệu các thành viên trong gia đình: Bố mẹ, ông bà, anh chị em và bạn bè.',
                requiredXp: 400,
            },
            4: {
                id: 4,
                title: 'Chặng 4: Mua Sắm & Giao Dịch Xã Hội',
                description: 'Hỏi giá, mua đồ ăn, thanh toán tiền và chỉ đường tại nơi công cộng.',
                requiredXp: 800,
            },
            5: {
                id: 5,
                title: 'Chặng 5: Y Tế & Ứng Cứu Khẩn Cấp',
                description: 'Báo triệu chứng bệnh, gọi bác sĩ và giao tiếp khẩn cấp tại bệnh viện.',
                requiredXp: 1400,
            },
        };

        const currentXp = req.user ? req.user.xp || 0 : 0;

        // Nhóm bài học theo từng chặng
        const stagesObj = {};
        for (let i = 1; i <= 5; i++) {
            stagesObj[i] = {
                ...stageConfigs[i],
                lessons: [],
                status: currentXp >= stageConfigs[i].requiredXp ? 'in-progress' : 'locked',
                stars: 0,
                completedCount: 0,
            };
        }

        // Duyệt từng bài học để gán trạng thái
        lessons.forEach((lesson) => {
            const stg = lesson.stage;
            if (!stagesObj[stg]) return;

            const progress = userProgressMap[lesson._id.toString()];
            const isCompleted = progress ? progress.completed : false;

            const lessonData = {
                _id: lesson._id,
                title: lesson.title,
                signConcept: lesson.signConcept,
                pinyinOrEn: lesson.pinyinOrEn,
                category: lesson.category,
                stage: lesson.stage,
                order: lesson.order,
                description: lesson.description,
                instructions: lesson.instructions,
                tips: lesson.tips,
                region: lesson.region,
                xpReward: lesson.xpReward,
                difficulty: lesson.difficulty,
                holdTimeRequired: lesson.holdTimeRequired,
                completed: isCompleted,
                stars: progress ? progress.stars : 0,
                score: progress ? progress.score : 0,
            };

            if (isCompleted) {
                stagesObj[stg].completedCount += 1;
                stagesObj[stg].stars += progress.stars;
            }

            stagesObj[stg].lessons.push(lessonData);
        });

        // Chuẩn hóa trạng thái chặng: nếu tất cả bài học trong chặng hoàn thành -> 'completed'
        Object.keys(stagesObj).forEach((stgNum) => {
            const stg = stagesObj[stgNum];
            if (stg.lessons.length > 0 && stg.completedCount === stg.lessons.length) {
                stg.status = 'completed';
            }
        });

        const stagesList = Object.values(stagesObj);

        return res.status(200).json({
            success: true,
            data: {
                stages: stagesList,
                userStats: req.user
                    ? {
                          xp: req.user.xp || 0,
                          streak: req.user.streak || 1,
                          level: req.user.level || 1,
                      }
                    : null,
            },
        });
    } catch (error) {
        console.error('Lỗi lấy cây kỹ năng:', error);
        return res.status(500).json({
            success: false,
            message: 'Không thể tải cây kỹ năng bài học',
            error: error.message,
        });
    }
};

/**
 * Lấy chi tiết một bài học để luyện tập trong phòng Gương ảo AI
 * GET /api/learning/lessons/:id
 */
const getLessonById = async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await Lesson.findById(id);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài học',
            });
        }

        let userProgress = null;
        if (req.user) {
            userProgress = await Progress.findOne({
                user: req.user._id,
                lesson: lesson._id,
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                lesson,
                progress: userProgress,
            },
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết bài học:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi lấy chi tiết bài học',
            error: error.message,
        });
    }
};

/**
 * Ghi nhận hoàn thành bài tập Gương ảo AI (Hold-time 1.5s validator)
 * POST /api/learning/lessons/:id/complete
 */
const completeLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { score = 95, holdTimeAchieved = 1.5 } = req.body;

        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài học',
            });
        }

        // Tính số sao dựa trên độ chính xác
        let stars = 1;
        if (score >= 90) stars = 3;
        else if (score >= 75) stars = 2;

        // Tìm hoặc tạo mới Progress
        let progress = await Progress.findOne({ user: userId, lesson: lesson._id });
        let isFirstTime = false;
        let xpGained = 0;

        if (!progress) {
            isFirstTime = true;
            xpGained = lesson.xpReward || 50;
            progress = new Progress({
                user: userId,
                lesson: lesson._id,
                completed: true,
                score,
                stars,
                attempts: 1,
                holdTimeAchieved,
                completedAt: new Date(),
            });
        } else {
            progress.attempts += 1;
            if (score > progress.score) progress.score = score;
            if (stars > progress.stars) progress.stars = stars;
            if (!progress.completed) {
                isFirstTime = true;
                progress.completed = true;
                xpGained = lesson.xpReward || 50;
            } else {
                // Luyện tập lại: thưởng khích lệ 10 XP
                xpGained = 10;
            }
            progress.completedAt = new Date();
        }

        await progress.save();

        // Cập nhật User: XP, Streak, Level
        const user = await User.findById(userId);
        user.xp = (user.xp || 0) + xpGained;

        // Tính chuỗi ngày học Streak
        const now = new Date();
        const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

        if (lastActive) {
            const diffTime = Math.abs(now - lastActive);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Học liên tiếp sang ngày hôm sau -> Tăng streak
                user.streak = (user.streak || 1) + 1;
            } else if (diffDays > 1) {
                // Bị ngắt quãng quá 1 ngày -> Reset streak về 1
                user.streak = 1;
            }
            // Nếu diffDays === 0 (học cùng ngày) -> Giữ nguyên streak
        } else {
            user.streak = 1;
        }

        user.lastActiveDate = now;
        user.level = Math.floor(user.xp / 500) + 1;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `Xuất sắc! Bạn đã hoàn thành bài học và nhận được +${xpGained} XP!`,
            data: {
                progress,
                xpGained,
                user: {
                    xp: user.xp,
                    streak: user.streak,
                    level: user.level,
                },
            },
        });
    } catch (error) {
        console.error('Lỗi ghi nhận hoàn thành bài tập:', error);
        return res.status(500).json({
            success: false,
            message: 'Không thể ghi nhận kết quả bài tập',
            error: error.message,
        });
    }
};

/**
 * Thống kê tổng quan năng lực cá nhân (UC08)
 * GET /api/learning/stats
 */
const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        const progressList = await Progress.find({ user: userId, completed: true }).populate(
            'lesson',
            'title category stage xpReward'
        );

        const totalCompleted = progressList.length;
        const totalStars = progressList.reduce((acc, curr) => acc + (curr.stars || 0), 0);

        return res.status(200).json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    xp: user.xp || 0,
                    streak: user.streak || 1,
                    level: user.level || 1,
                },
                totalCompleted,
                totalStars,
                history: progressList,
            },
        });
    } catch (error) {
        console.error('Lỗi lấy thống kê học tập:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi lấy thống kê học tập',
            error: error.message,
        });
    }
};

module.exports = {
    getSkillTree,
    getLessonById,
    completeLesson,
    getUserStats,
};
