const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Trả lời câu hỏi thông minh kèm trích dẫn nguồn học thuật (UC09)
router.post('/ask', aiController.ask);

// Lấy danh sách câu hỏi gợi ý khám phá nhanh
router.get('/suggestions', aiController.getSuggestions);

module.exports = router;
