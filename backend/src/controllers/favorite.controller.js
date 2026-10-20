const Favorite = require('../models/Favorite');
const Work = require('../models/Work');
const mongoose = require('mongoose');

/**
 * Lấy danh sách các tác phẩm yêu thích của người dùng (UC12)
 */
const getFavorites = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const [favorites, total] = await Promise.all([
            Favorite.find({ user: req.user._id })
                .populate({
                    path: 'work',
                    match: { status: 'published' },
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Favorite.countDocuments({ user: req.user._id }),
        ]);

        // Lọc bỏ những favorite mà tác phẩm bị xóa hoặc không còn published
        const validWorks = favorites
            .filter((fav) => fav.work != null)
            .map((fav) => ({
                ...fav.work,
                favoriteId: fav._id,
                favoritedAt: fav.createdAt,
            }));

        res.status(200).json({
            success: true,
            data: validWorks,
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
            message: error.message || 'Lỗi khi tải danh sách yêu thích',
        });
    }
};

/**
 * Thêm hoặc xóa tác phẩm khỏi mục yêu thích (Toggle Favorite - UC12)
 */
const toggleFavorite = async (req, res) => {
    try {
        const { workId } = req.params;

        if (!mongoose.isValidObjectId(workId)) {
            return res.status(400).json({
                success: false,
                message: 'ID tác phẩm không hợp lệ',
            });
        }

        const work = await Work.findById(workId);
        if (!work) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tác phẩm trong hệ thống',
            });
        }

        const existing = await Favorite.findOne({
            user: req.user._id,
            work: workId,
        });

        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            // Giảm likesCount của tác phẩm
            if (work.likesCount > 0) {
                work.likesCount -= 1;
                await work.save();
            }
            return res.status(200).json({
                success: true,
                isFavorited: false,
                message: 'Đã xóa khỏi danh sách yêu thích',
            });
        } else {
            await Favorite.create({
                user: req.user._id,
                work: workId,
            });
            // Tăng likesCount của tác phẩm
            work.likesCount += 1;
            await work.save();
            return res.status(201).json({
                success: true,
                isFavorited: true,
                message: 'Đã lưu vào danh sách yêu thích',
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi xử lý yêu thích',
        });
    }
};

/**
 * Kiểm tra xem 1 tác phẩm đã được yêu thích chưa
 */
const checkFavorite = async (req, res) => {
    try {
        const { workId } = req.params;
        if (!mongoose.isValidObjectId(workId)) {
            return res.status(200).json({ success: true, isFavorited: false });
        }

        const existing = await Favorite.findOne({
            user: req.user._id,
            work: workId,
        });

        res.status(200).json({
            success: true,
            isFavorited: !!existing,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getFavorites,
    toggleFavorite,
    checkFavorite,
};
