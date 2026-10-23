const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamification.controller');
const { protect } = require('../middlewares/auth.middlewares');

// Bảng Vàng Trạng Nguyên (Công khai cho toàn bộ khách và người dùng)
router.get('/leaderboard', gamificationController.getLeaderboard);

// Các endpoint yêu cầu đăng nhập:
router.get('/stats', protect, gamificationController.getMyStats);
router.post('/track-activity', protect, gamificationController.trackActivity);

// Đấu trường Thi Đình 1v1
router.post('/duel/matchmake', protect, gamificationController.matchmakeDuel);
router.post('/duel/match-bot', protect, gamificationController.matchmakeBotDuel);
router.post('/duel/leave-queue', protect, gamificationController.leaveDuelQueue);
router.get('/duel/history', protect, gamificationController.getDuelHistory);
router.get('/duel/:matchId', protect, gamificationController.getDuelMatchStatus);
router.post('/duel/:matchId/answer', protect, gamificationController.answerDuelRound);

module.exports = router;
