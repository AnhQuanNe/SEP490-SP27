const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const literatureRoutes = require('./literature.routes');
const aiRoutes = require('./ai.routes');
const quizRoutes = require('./quiz.routes');
const favoriteRoutes = require('./favorite.routes');
const searchHistoryRoutes = require('./searchHistory.routes');
const submissionRoutes = require('./submission.routes');
const adminRoutes = require('./admin.routes');
const learningPathRoutes = require('./learningPath.routes');
const SystemSetting = require('../models/SystemSetting');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/literature', literatureRoutes);
router.use('/ai', aiRoutes);
router.use('/quiz', quizRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/search-history', searchHistoryRoutes);
router.use('/submissions', submissionRoutes);
router.use('/admin', adminRoutes);
router.use('/learning-paths', learningPathRoutes);

// Public settings endpoint (để frontend hiển thị banner thông báo hoặc bật/tắt đóng góp)
router.get('/settings/public', async (req, res) => {
    try {
        const settings = await SystemSetting.find({
            key: { $in: ['allowUserSubmissions', 'aiExplanationEnabled', 'semanticSearchEnabled', 'systemNotice', 'maintenanceMode'] },
        }).lean();

        const config = {};
        settings.forEach((s) => {
            config[s.key] = s.value;
        });

        res.status(200).json({
            success: true,
            data: config,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

