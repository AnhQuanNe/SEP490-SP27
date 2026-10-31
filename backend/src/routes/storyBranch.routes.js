const express = require('express');
const router = express.Router();
const storyBranchController = require('../controllers/storyBranch.controller');
const { protect } = require('../middlewares/auth.middlewares');

// Lấy danh sách câu chuyện (công khai để Guest khám phá danh mục)
router.get('/stories', storyBranchController.getStories);

// Lấy chi tiết 1 câu chuyện (công khai)
router.get('/stories/:slug', storyBranchController.getStoryDetail);

// Tiến bước tới hồi tiếp theo (Bắt buộc phải đăng nhập)
router.post('/next', protect, storyBranchController.nextChapter);

module.exports = router;
