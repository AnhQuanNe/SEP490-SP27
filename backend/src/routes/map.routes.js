const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

// GET /api/map/works - Lấy toàn bộ markers và tác phẩm tiêu biểu phục vụ bản đồ tương tác
router.get('/works', locationController.getMapWorks);

module.exports = router;
