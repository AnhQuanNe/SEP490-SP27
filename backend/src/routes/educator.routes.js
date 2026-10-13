const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middlewares');
const educatorController = require('../controllers/educator.controller');

// Tất cả các route đều yêu cầu đăng nhập
router.use(protect);

// Quản lý lớp học
router.get('/classrooms', educatorController.getMyClassrooms);
router.post('/classrooms', educatorController.createClassroom);
router.get('/classrooms/:id', educatorController.getClassroomDetails);

// Giao bài tập & Phản hồi
router.post('/classrooms/:id/assignments', educatorController.createAssignment);
router.post('/classrooms/:id/feedback', educatorController.addStudentFeedback);

// Phân tích lỗi sai cử chỉ (Mistake Analytics Heatmap UC17)
router.get('/classrooms/:id/analytics', educatorController.getAnalyticsHeatmap);

// Học viên tham gia lớp bằng Join Code
router.post('/join', educatorController.joinClassroom);

module.exports = router;
