const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middlewares');
const { uploadAvatar } = require('../middlewares/upload.middleware');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);
router.post('/avatar', protect, uploadAvatar.single('avatar'), userController.uploadAvatar);

module.exports = router;
