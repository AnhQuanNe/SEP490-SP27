const mongoose = require('mongoose');

const dailyLearningActivitySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        dateStr: {
            type: String, // 'YYYY-MM-DD' theo giờ Việt Nam (UTC+7)
            required: true,
            index: true,
        },
        activityCount: {
            type: Number,
            default: 1,
        },
        activities: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Mỗi user chỉ có 1 bản ghi hoạt động cho 1 ngày
dailyLearningActivitySchema.index({ userId: 1, dateStr: 1 }, { unique: true });

module.exports = mongoose.model('DailyLearningActivity', dailyLearningActivitySchema);
