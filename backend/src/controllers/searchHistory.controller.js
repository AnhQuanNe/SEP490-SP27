const SearchHistory = require('../models/SearchHistory');

/**
 * Lấy lịch sử tìm kiếm của người dùng hiện tại (UC13)
 * Hỗ trợ phân trang, lọc theo loại, sắp xếp và thống kê tổng số lượt tìm kiếm
 */
const getHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const { searchType, sort } = req.query;

        const filter = { user: req.user._id };
        if (searchType === 'semantic') {
            filter.searchType = 'semantic';
        } else if (searchType === 'keyword') {
            filter.searchType = { $ne: 'semantic' };
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'semantic') {
            sortOption = { searchType: -1, createdAt: -1 };
        } else if (sort === 'keyword') {
            sortOption = { searchType: 1, createdAt: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const [history, filteredTotal, totalUserSearches, semanticCount, keywordCount] = await Promise.all([
            SearchHistory.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .lean(),
            SearchHistory.countDocuments(filter),
            SearchHistory.countDocuments({ user: req.user._id }),
            SearchHistory.countDocuments({ user: req.user._id, searchType: 'semantic' }),
            SearchHistory.countDocuments({ user: req.user._id, searchType: { $ne: 'semantic' } }),
        ]);

        res.status(200).json({
            success: true,
            data: history,
            stats: {
                totalSearches: totalUserSearches,
                semanticSearches: semanticCount,
                keywordSearches: keywordCount,
            },
            pagination: {
                total: filteredTotal,
                page,
                limit,
                totalPages: Math.ceil(filteredTotal / limit) || 1,
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
 * Xóa toàn bộ hoặc xóa nhiều mục lịch sử tìm kiếm theo danh sách ids
 */
const clearHistory = async (req, res) => {
    try {
        const { ids } = req.body || {};
        if (Array.isArray(ids) && ids.length > 0) {
            const result = await SearchHistory.deleteMany({
                _id: { $in: ids },
                user: req.user._id,
            });
            return res.status(200).json({
                success: true,
                message: `Đã xóa ${result.deletedCount} mục lịch sử tìm kiếm đã chọn`,
                deletedCount: result.deletedCount,
            });
        }

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
 * Xóa nhiều mục lịch sử tìm kiếm theo danh sách IDs
 */
const deleteMultipleHistoryItems = async (req, res) => {
    try {
        const { ids } = req.body || {};
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp danh sách ID các mục cần xóa',
            });
        }

        const result = await SearchHistory.deleteMany({
            _id: { $in: ids },
            user: req.user._id,
        });

        res.status(200).json({
            success: true,
            message: `Đã xóa ${result.deletedCount} mục lịch sử tìm kiếm đã chọn`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi xóa nhiều mục lịch sử',
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
    deleteMultipleHistoryItems,
    deleteHistoryItem,
};
