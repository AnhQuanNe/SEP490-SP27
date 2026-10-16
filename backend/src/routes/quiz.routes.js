const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');

// Lấy danh sách câu hỏi đố vui
router.get('/questions', quizController.getQuestions);

// Nộp bài thi trắc nghiệm
router.post('/submit', quizController.submit);

module.exports = router;
