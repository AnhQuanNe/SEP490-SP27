const User = require('../models/User');

/**
 * Lấy thông tin tài khoản hiện tại
 */
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin tài khoản',
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Cập nhật thông tin profile (họ tên, số điện thoại, địa chỉ)
 */
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: updatedUser,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Đổi mật khẩu
 */
const changePassword = async (req, res) => {
    try {
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
            });
        }

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản',
            });
        }

        // Nếu tài khoản đăng nhập qua Google chưa từng tạo mật khẩu
        if (user.googleId && !user.password) {
            user.password = newPassword;
            await user.save();
            return res.status(200).json({
                success: true,
                message: 'Thiết lập mật khẩu thành công',
            });
        }

        if (!currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mật khẩu hiện tại',
            });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không chính xác',
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Upload ảnh đại diện
 */
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn một file ảnh để tải lên',
            });
        }

        // Tạo URL ảnh đại diện theo đường dẫn server
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: avatarUrl },
            { returnDocument: 'after' }
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật ảnh đại diện thành công',
            data: {
                avatar: avatarUrl,
                user,
            },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
};
