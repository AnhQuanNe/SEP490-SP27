const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth.middlewares');

// Tất cả các route quản trị đều yêu cầu đăng nhập và có vai trò 'admin'
router.use(protect, authorize('admin'));

// UC20: Dashboard Overview Stats
router.get('/stats', adminController.getDashboardStats);

// UC15: View and update user accounts
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/role', adminController.updateUserRole);

// UC16 & UC17: Review and approve/reject content submissions
router.get('/submissions', adminController.getSubmissions);
router.post('/submissions/:id/approve', adminController.approveSubmission);
router.post('/submissions/:id/reject', adminController.rejectSubmission);

// UC18: Manage published folk literature content
router.get('/works', adminController.getWorks);
router.post('/works', adminController.createWork);
router.put('/works/:id', adminController.updateWork);
router.delete('/works/:id', adminController.deleteWork);

// UC19: Configure system settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSetting);

// Location Management for Cultural Map
const locationController = require('../controllers/location.controller');
router.post('/locations', locationController.adminCreate);
router.put('/locations/:id', locationController.adminUpdate);
router.delete('/locations/:id', locationController.adminDelete);

module.exports = router;
