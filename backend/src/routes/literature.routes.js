const express = require('express');
const router = express.Router();
const literatureController = require('../controllers/literature.controller');
const { optionalAuth } = require('../middlewares/auth.middlewares');

// Lấy danh sách tác phẩm nổi bật
router.get('/featured', literatureController.getFeatured);

// Lấy danh mục văn học
router.get('/categories', literatureController.getCategories);

// Lấy từ khóa gợi ý
router.get('/tags', literatureController.getTags);

// Tìm kiếm & lọc tác phẩm từ khóa (UC06 Browse, UC07 Search)
router.get('/search', optionalAuth, literatureController.search);

// Tìm kiếm theo ý nghĩa bằng ngôn ngữ tự nhiên (UC09 Semantic Search)
router.get('/semantic-search', optionalAuth, literatureController.semanticSearch);

// Gợi ý nội dung văn hóa liên quan (UC11 Explore Related Content)
router.get('/:idOrSlug/related', literatureController.getRelated);

// Xem chi tiết tác phẩm theo slug (UC08 View Details)
router.get('/:slug', literatureController.getDetail);

module.exports = router;

