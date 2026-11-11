const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

// GET /api/locations - Danh sách địa phương công khai & tọa độ
router.get('/', locationController.getLocations);

// AI Map features: Địa danh cổ & Cửa ải lịch sử
router.get('/ancient-landmarks', locationController.getAncientLandmarks);
router.post('/ancient-landmarks/resolve', locationController.resolveAncientLandmark);

// GET /api/locations/:id - Chi tiết địa phương
router.get('/:id', locationController.getLocationDetail);

// GET /api/locations/:id/works - Danh sách tác phẩm của địa phương
router.get('/:id/works', locationController.getLocationWorks);

module.exports = router;
