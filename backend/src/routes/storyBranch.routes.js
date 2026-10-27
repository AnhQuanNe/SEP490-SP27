const express = require('express');
const router = express.Router();
const storyBranchController = require('../controllers/storyBranch.controller');

// Lấy danh sách câu chuyện
router.get('/stories', storyBranchController.getStories);

// Lấy chi tiết 1 câu chuyện
router.get('/stories/:slug', storyBranchController.getStoryDetail);

// Tiến bước tới hồi tiếp theo
router.post('/next', storyBranchController.nextChapter);

module.exports = router;
