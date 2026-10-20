const literatureService = require('../services/literature.service');

class LiteratureController {
    /**
     * @route   GET /api/literature/featured
     * @desc    Lấy danh sách tác phẩm nổi bật (UC06)
     * @access  Public
     */
    async getFeatured(req, res, next) {
        try {
            const limit = req.query.limit || 6;
            const works = await literatureService.getFeaturedWorks(limit);
            res.status(200).json({
                success: true,
                count: works.length,
                data: works,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/literature/categories
     * @desc    Lấy danh sách các thể loại & số lượng (UC06)
     * @access  Public
     */
    async getCategories(req, res, next) {
        try {
            const categories = await literatureService.getCategories();
            res.status(200).json({
                success: true,
                data: categories,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/literature/tags
     * @desc    Lấy danh sách từ khóa tìm kiếm phổ biến
     * @access  Public
     */
    async getTags(req, res, next) {
        try {
            const tags = await literatureService.getPopularTags();
            res.status(200).json({
                success: true,
                data: tags,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/literature/search
     * @desc    Tìm kiếm tác phẩm / văn học dân gian (UC07)
     * @access  Public
     */
    async search(req, res, next) {
        try {
            const { q, category, region, page, limit } = req.query;
            const result = await literatureService.searchWorks({
                query: q,
                category,
                region,
                page,
                limit,
            });

            // Lưu lịch sử tìm kiếm nếu người dùng đã đăng nhập (UC13)
            if (req.user && q && q.trim() !== '') {
                try {
                    const SearchHistory = require('../models/SearchHistory');
                    await SearchHistory.create({
                        user: req.user._id,
                        query: q.trim(),
                        searchType: 'keyword',
                        resultsCount: result.pagination.total,
                    });
                } catch (historyErr) {
                    console.error('[SearchHistory] Lỗi lưu lịch sử:', historyErr.message);
                }
            }

            res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/literature/semantic-search
     * @desc    Tìm kiếm theo ý nghĩa bằng ngôn ngữ tự nhiên (UC09)
     * @access  Public / Optional Auth
     */
    async semanticSearch(req, res, next) {
        try {
            const { q, page, limit } = req.query;
            const result = await literatureService.semanticSearch({
                query: q,
                page,
                limit,
                userId: req.user?._id,
            });

            // Lưu lịch sử tìm kiếm ngữ nghĩa nếu người dùng đã đăng nhập (UC13)
            if (req.user && q && q.trim() !== '') {
                try {
                    const SearchHistory = require('../models/SearchHistory');
                    await SearchHistory.create({
                        user: req.user._id,
                        query: q.trim(),
                        searchType: 'semantic',
                        resultsCount: result.pagination.total,
                    });
                } catch (historyErr) {
                    console.error('[SearchHistory] Lỗi lưu lịch sử ngữ nghĩa:', historyErr.message);
                }
            }

            res.status(200).json({
                success: true,
                ...result,
                quota: req.guestQuota || null,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/literature/:idOrSlug/related
     * @desc    Gợi ý nội dung văn hóa liên quan (UC11)
     * @access  Public
     */
    async getRelated(req, res, next) {
        try {
            const { idOrSlug } = req.params;
            const limit = req.query.limit || 4;
            const related = await literatureService.getRelatedWorks(idOrSlug, limit);
            res.status(200).json({
                success: true,
                data: related,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/literature/:slug
     * @desc    Xem thông tin chi tiết một tác phẩm (UC08)
     * @access  Public
     */
    async getDetail(req, res, next) {
        try {
            const { slug } = req.params;
            const work = await literatureService.getWorkBySlug(slug);
            if (!work) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy tác phẩm với định danh: ${slug}`,
                });
            }
            res.status(200).json({
                success: true,
                data: work,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new LiteratureController();
