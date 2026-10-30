const User = require('../models/User');
const ContentSubmission = require('../models/ContentSubmission');
const Work = require('../models/Work');
const SystemSetting = require('../models/SystemSetting');
const { removeVietnameseTones } = require('../utils/vietnamese.utils');

// ==========================================
// UC15: VIEW AND UPDATE USER ACCOUNTS
// ==========================================

const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;
        const { search, role, status } = req.query;

        const filter = {};
        if (role && role !== 'all') filter.role = role;
        if (status && status !== 'all') filter.status = status;

        if (search && search.trim() !== '') {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: users,
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
            message: error.message || 'Lỗi khi tải danh sách người dùng',
        });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'locked'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ. Chỉ chấp nhận active hoặc locked',
            });
        }

        if (req.user._id.toString() === id && status === 'locked') {
            return res.status(400).json({
                success: false,
                message: 'Bạn không thể tự khóa tài khoản quản trị của chính mình',
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { status },
            { returnDocument: 'after' }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng',
            });
        }

        res.status(200).json({
            success: true,
            message: `Đã ${status === 'locked' ? 'khóa' : 'kích hoạt'} tài khoản thành công`,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['customer', 'user', 'staff', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Vai trò không hợp lệ',
            });
        }

        if (req.user._id.toString() === id && role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Bạn không thể tự hạ quyền quản trị viên của chính mình',
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { returnDocument: 'after' }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Đã cập nhật vai trò người dùng thành công',
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// UC16 & UC17: REVIEW CONTENT SUBMISSIONS & APPROVE/REJECT
// ==========================================

const getSubmissions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;
        const { status, category } = req.query;

        const filter = {};
        if (status && status !== 'all') filter.status = status;
        if (category && category !== 'all') filter.category = category;

        const [submissions, total] = await Promise.all([
            ContentSubmission.find(filter)
                .populate('user', 'name email avatar')
                .populate('reviewedBy', 'name email')
                .populate('publishedWorkId', 'title slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ContentSubmission.countDocuments(filter),
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
            message: error.message || 'Lỗi khi tải danh sách bài đóng góp',
        });
    }
};

const approveSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;

        const submission = await ContentSubmission.findById(id).populate('user', 'name');
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài đóng góp',
            });
        }

        if (submission.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Bài đóng góp này đã được phê duyệt từ trước',
            });
        }

        // Tạo slug duy nhất từ tiêu đề
        let baseSlug = removeVietnameseTones(submission.title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'tac-pham';

        let slug = baseSlug;
        let count = 1;
        while (await Work.findOne({ slug })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }

        const categoryNames = {
            'ca-dao': 'Ca dao Dân ca Việt Nam',
            'tuc-ngu': 'Tục ngữ Việt Nam',
            'than-thoai': 'Thần thoại dân gian',
            'truyen-thuyet': 'Truyền thuyết lịch sử',
            'co-tich': 'Truyện cổ tích',
            'khac': 'Văn học dân gian khác',
        };

        // Tạo tác phẩm mới vào bảng Work
        const newWork = await Work.create({
            title: submission.title,
            slug,
            category: submission.category,
            categoryName: categoryNames[submission.category] || 'Ca dao - Tục ngữ',
            period: 'Văn học Dân gian',
            region: submission.region || 'Toàn quốc',
            author: 'Dân gian',
            topic: submission.topic || 'Văn hóa & Đạo lý',
            summary: submission.summary || submission.meaning,
            quote: submission.title,
            literalMeaning: submission.literalMeaning || '',
            figurativeMeaning: submission.figurativeMeaning || submission.meaning,
            lesson: submission.lesson || '',
            historicalContext: submission.historicalContext || '',
            thematicMeaning: submission.meaning,
            source: submission.source,
            tags: [submission.title, categoryNames[submission.category] || 'Dân gian', submission.topic].filter(Boolean),
            status: 'published',
            isFeatured: false,
        });

        submission.status = 'approved';
        submission.reviewedBy = req.user._id;
        submission.reviewedAt = new Date();
        submission.publishedWorkId = newWork._id;
        if (adminNote) submission.adminNote = adminNote;
        await submission.save();

        res.status(200).json({
            success: true,
            message: `Phê duyệt bài đóng góp thành công! Đã xuất bản tác phẩm "${newWork.title}" vào kho tàng.`,
            data: {
                submission,
                publishedWork: newWork,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi phê duyệt bài đóng góp',
        });
    }
};

const rejectSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;

        const submission = await ContentSubmission.findById(id);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài đóng góp',
            });
        }

        submission.status = 'rejected';
        submission.reviewedBy = req.user._id;
        submission.reviewedAt = new Date();
        submission.adminNote = adminNote || 'Nội dung chưa đáp ứng tiêu chuẩn kiểm chứng của VietHeritage AI.';
        await submission.save();

        res.status(200).json({
            success: true,
            message: 'Đã từ chối bài đóng góp',
            data: submission,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// UC18: UPDATE PUBLISHED CONTENT
// ==========================================

const getWorks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;
        const { search, category, status } = req.query;

        const filter = {};
        if (category && category !== 'all') filter.category = category;
        if (status && status !== 'all') filter.status = status;

        if (search && search.trim() !== '') {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [{ title: regex }, { summary: regex }, { topic: regex }, { source: regex }];
        }

        const [works, total] = await Promise.all([
            Work.find(filter)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Work.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: works,
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
            message: error.message,
        });
    }
};

const createWork = async (req, res) => {
    try {
        const {
            title,
            category,
            categoryName,
            period,
            region,
            author,
            topic,
            summary,
            quote,
            literalMeaning,
            figurativeMeaning,
            lesson,
            historicalContext,
            thematicMeaning,
            source,
            tags,
            status,
            isFeatured,
        } = req.body;

        if (!title || !summary || !source) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ tiêu đề, tóm tắt/ý nghĩa và nguồn tham khảo kiểm chứng',
            });
        }

        let baseSlug = removeVietnameseTones(title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'tac-pham';

        let slug = baseSlug;
        let count = 1;
        while (await Work.findOne({ slug })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }

        const work = await Work.create({
            title: title.trim(),
            slug,
            category: category || 'ca-dao',
            categoryName: categoryName || 'Ca dao - Tục ngữ',
            period: period || 'Văn học Dân gian',
            region: region || 'Toàn quốc',
            author: author || 'Dân gian',
            coverImage: req.body.coverImage?.trim() || '',
            topic: topic || 'Văn hóa & Đạo lý',
            summary: summary.trim(),
            quote: quote?.trim() || title.trim(),
            literalMeaning: literalMeaning?.trim() || '',
            figurativeMeaning: figurativeMeaning?.trim() || '',
            lesson: lesson?.trim() || '',
            historicalContext: historicalContext?.trim() || '',
            thematicMeaning: thematicMeaning?.trim() || summary.trim(),
            source: source.trim(),
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : []),
            status: status || 'published',
            isFeatured: !!isFeatured,
        });

        res.status(201).json({
            success: true,
            message: 'Thêm mới tác phẩm thành công',
            data: work,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateWork = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Xử lý tags nếu là chuỗi phân cách bởi dấu phẩy
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map((t) => t.trim()).filter(Boolean);
        }

        const updatedWork = await Work.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedWork) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tác phẩm để cập nhật',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật tác phẩm thành công',
            data: updatedWork,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteWork = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Work.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tác phẩm cần xóa',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Đã xóa tác phẩm khỏi hệ thống',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// UC19: CONFIGURE SYSTEM SETTINGS
// ==========================================

const getSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.find().populate('updatedBy', 'name email').lean();
        res.status(200).json({
            success: true,
            data: settings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp key của thiết lập',
            });
        }

        const setting = await SystemSetting.findOneAndUpdate(
            { key },
            { value, updatedBy: req.user._id },
            { returnDocument: 'after', upsert: true }
        );

        res.status(200).json({
            success: true,
            message: `Đã cập nhật thiết lập [${key}] thành công`,
            data: setting,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getUsers,
    updateUserStatus,
    updateUserRole,
    getSubmissions,
    approveSubmission,
    rejectSubmission,
    getWorks,
    createWork,
    updateWork,
    deleteWork,
    getSettings,
    updateSetting,
};
