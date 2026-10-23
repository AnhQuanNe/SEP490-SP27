const express = require('express');
const router = express.Router();
const poetryController = require('../controllers/poetry.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middlewares');

// Phân tích âm luật (công khai, kiểm tra realtime)
router.post('/analyze', poetryController.analyzePoem);

// Thẩm định thơ toàn diện bằng AI (cho phép cả khách và người dùng đăng nhập)
router.post('/critique', optionalAuth, poetryController.critiquePoem);

// Ứng khẩu đối câu Bát cùng AI
router.post('/co-write', optionalAuth, poetryController.coWrite);

// Danh sách thơ cộng đồng
router.get('/community', poetryController.getCommunityPoems);

// Xem chi tiết tác phẩm (kiểm tra quyền xem nếu riêng tư)
router.get('/:id', optionalAuth, poetryController.getPoemDetail);

// Các endpoint yêu cầu đăng nhập:
router.post('/save', protect, poetryController.savePoem);
router.get('/user/my-poems', protect, poetryController.getMyPoems);
router.delete('/:id', protect, poetryController.deletePoem);

module.exports = router;
