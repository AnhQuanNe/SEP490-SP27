const SearchHistory = require('../models/SearchHistory');

/**
 * Lấy lịch sử tìm kiếm của người dùng hiện tại (UC13)
 */
const getHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [history, total] = await Promise.all([
            SearchHistory.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            SearchHistory.countDocuments({ user: req.user._id }),
        ]);

        res.status(200).json({
            success: true,
            data: history,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi tải lịch sử tìm kiếm',
        });
    }
};

/**
 * Xóa toàn bộ lịch sử tìm kiếm của người dùng
 */
const clearHistory = async (req, res) => {
    try {
        await SearchHistory.deleteMany({ user: req.user._id });
        res.status(200).json({
            success: true,
            message: 'Đã xóa toàn bộ lịch sử tìm kiếm',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi xóa lịch sử',
        });
    }
};

/**
 * Xóa một mục lịch sử tìm kiếm cụ thể
 */
const deleteHistoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await SearchHistory.findOneAndDelete({
            _id: id,
            user: req.user._id,
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy mục lịch sử cần xóa',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Đã xóa mục lịch sử tìm kiếm',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi xóa mục lịch sử',
        });
    }
};

module.exports = {
    getHistory,
    clearHistory,
    deleteHistoryItem,
};
