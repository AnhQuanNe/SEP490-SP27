const express = require('express');
const router = express.Router();
const literatureController = require('../controllers/literature.controller');

// Lấy danh sách tác phẩm nổi bật
router.get('/featured', literatureController.getFeatured);

// Lấy danh mục văn học
router.get('/categories', literatureController.getCategories);

// Lấy từ khóa gợi ý
router.get('/tags', literatureController.getTags);

// Tìm kiếm & lọc tác phẩm (UC06 Browse, UC07 Search)
router.get('/search', literatureController.search);

// Xem chi tiết tác phẩm theo slug (UC08 View Details)
router.get('/:slug', literatureController.getDetail);

module.exports = router;
