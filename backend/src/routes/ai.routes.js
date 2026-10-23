const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { optionalAuth } = require('../middlewares/auth.middlewares');
const { checkGuestQuota, getGuestQuotaStatus } = require('../middlewares/guestQuota.middleware');

// Lấy thông tin số lượt AI còn lại trong ngày (cho Guest hoặc Registered User)
router.get('/quota', optionalAuth, getGuestQuotaStatus);

// Trả lời câu hỏi thông minh kèm trích dẫn nguồn học thuật (UC10)
router.post('/ask', optionalAuth, checkGuestQuota, aiController.ask);

// Yêu cầu AI giải thích chi tiết câu ca dao, tục ngữ (UC10)
router.post('/explain', optionalAuth, checkGuestQuota, aiController.explain);

// Lấy danh sách câu hỏi gợi ý khám phá nhanh
router.get('/suggestions', aiController.getSuggestions);


// Trợ lý AI hỗ trợ người dùng phân tích 4 tầng nghĩa khi đóng góp nội dung mới
router.post('/draft-submission', optionalAuth, aiController.draftSubmission);

// Smart Text Selection: Phân tích địa danh, bối cảnh lịch sử hoặc biện pháp tu từ theo đoạn trích bôi đen
router.post('/analyze-snippet', optionalAuth, checkGuestQuota, aiController.analyzeSnippet);

module.exports = router;


