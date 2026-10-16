const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const { protect } = require('../middlewares/auth.middlewares');

// Tất cả các route đóng góp đều yêu cầu đăng nhập
router.use(protect);

router.post('/', submissionController.createSubmission);
router.get('/my', submissionController.getMySubmissions);
router.get('/my/:id', submissionController.getMySubmissionDetail);

module.exports = router;
