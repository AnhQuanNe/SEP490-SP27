const ContentSubmission = require('../models/ContentSubmission');
const SystemSetting = require('../models/SystemSetting');

/**
 * Người dùng đăng ký gửi đóng góp nội dung ca dao, tục ngữ mới (UC14)
 */
const createSubmission = async (req, res) => {
    try {
        // Kiểm tra cấu hình hệ thống xem có cho phép gửi đóng góp không
        const submissionSetting = await SystemSetting.findOne({ key: 'allowUserSubmissions' });
        if (submissionSetting && submissionSetting.value === false) {
            return res.status(403).json({
                success: false,
                message: 'Hệ thống hiện đang tạm đóng chức năng đóng góp nội dung. Vui lòng quay lại sau.',
            });
        }

        const {
            title,
            category,
            topic,
            summary,
            meaning,
            literalMeaning,
            figurativeMeaning,
            lesson,
            historicalContext,
            region,
            source,
        } = req.body;

        // Validation
        if (!title || typeof title !== 'string' || title.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập câu ca dao hoặc tục ngữ hợp lệ (tối thiểu 3 ký tự)',
            });
        }

        if (!meaning || typeof meaning !== 'string' || meaning.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng giải thích ý nghĩa nội dung đóng góp (tối thiểu 10 ký tự)',
            });
        }

        if (!source || typeof source !== 'string' || source.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp nguồn tham khảo học thuật kiểm chứng (sách, nhà xuất bản, tác giả)',
            });
        }

        // Hạn chế spam: Kiểm tra xem user có bài đóng góp giống hệt đang pending không
        const duplicate = await ContentSubmission.findOne({
            user: req.user._id,
            title: title.trim(),
            status: 'pending',
        });
        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã có một bài đóng góp với nội dung này đang chờ Admin kiểm duyệt.',
            });
        }

        const newSubmission = await ContentSubmission.create({
            user: req.user._id,
            title: title.trim(),
            category: category || 'ca-dao',
            topic: topic || 'Đạo đức & Lối sống',
            summary: summary?.trim() || '',
            meaning: meaning.trim(),
            literalMeaning: literalMeaning?.trim() || '',
            figurativeMeaning: figurativeMeaning?.trim() || '',
            lesson: lesson?.trim() || '',
            historicalContext: historicalContext?.trim() || '',
            region: region?.trim() || 'Toàn quốc',
            source: source.trim(),
            status: 'pending', // Luôn mặc định là pending, không cho client ghi đè
        });

        res.status(201).json({
            success: true,
            message: 'Gửi đóng góp thành công! Bài viết đang chờ Ban Quản trị kiểm duyệt.',
            data: newSubmission,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi gửi đóng góp nội dung',
        });
    }
};

/**
 * Người dùng xem danh sách nội dung do chính mình đã đóng góp (UC14)
 */
const getMySubmissions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [submissions, total] = await Promise.all([
            ContentSubmission.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ContentSubmission.countDocuments({ user: req.user._id }),
        ]);

        res.status(200).json({
            success: true,
            data: submissions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi tải danh sách đóng góp của bạn',
        });
    }
};

/**
 * Xem chi tiết 1 bài đóng góp của chính người dùng
 */
const getMySubmissionDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await ContentSubmission.findOne({
            _id: id,
            user: req.user._id,
        }).lean();

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài đóng góp',
            });
        }

        res.status(200).json({
            success: true,
            data: submission,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createSubmission,
    getMySubmissions,
    getMySubmissionDetail,
};
