const locationService = require('../services/location.service');

class LocationController {
    /**
     * @route   GET /api/locations
     * @desc    Lấy danh sách địa phương công khai và tọa độ
     * @access  Public
     */
    async getLocations(req, res, next) {
        try {
            const { category, region } = req.query;
            const locations = await locationService.getLocations({ category, region });
            res.status(200).json({
                success: true,
                count: locations.length,
                data: locations,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/locations/:id
     * @desc    Lấy thông tin chi tiết một địa phương
     * @access  Public
     */
    async getLocationDetail(req, res, next) {
        try {
            const { id } = req.params;
            const location = await locationService.getLocationByIdOrSlug(id);
            if (!location) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy địa phương với định danh: ${id}`,
                });
            }
            res.status(200).json({
                success: true,
                data: location,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/locations/:id/works
     * @desc    Lấy danh sách các tác phẩm công khai của một địa phương
     * @access  Public
     */
    async getLocationWorks(req, res, next) {
        try {
            const { id } = req.params;
            const { category, page, limit } = req.query;
            const result = await locationService.getLocationWorks(id, { category, page, limit });
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy địa phương với định danh: ${id}`,
                });
            }
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/map/works
     * @desc    Lấy toàn bộ dữ liệu cần thiết để hiển thị bản đồ và hỗ trợ lọc theo thể loại
     * @access  Public
     */
    async getMapWorks(req, res, next) {
        try {
            const { category, region } = req.query;
            const result = await locationService.getMapWorks({ category, region });
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // ===================================
    // ADMIN ENDPOINTS
    // ===================================

    async adminCreate(req, res, next) {
        try {
            const location = await locationService.createLocation(req.body);
            res.status(201).json({
                success: true,
                message: 'Đã thêm địa phương văn hóa mới thành công',
                data: location,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    async adminUpdate(req, res, next) {
        try {
            const { id } = req.params;
            const location = await locationService.updateLocation(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Đã cập nhật thông tin địa phương thành công',
                data: location,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    async adminDelete(req, res, next) {
        try {
            const { id } = req.params;
            const result = await locationService.deleteLocation(id);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}

module.exports = new LocationController();
