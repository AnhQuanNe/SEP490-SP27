const Classroom = require('../models/Classroom');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

/**
 * Tạo mã Join Code ngẫu nhiên định dạng HS-XXXX
 */
const generateJoinCode = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `HS-${randomDigits}`;
};

/**
 * Lấy danh sách lớp học của giảng viên
 * GET /api/educator/classrooms
 */
exports.getMyClassrooms = async (req, res) => {
    try {
        let classrooms = await Classroom.find({ educatorId: req.user._id }).sort({ createdAt: -1 });

        // Nếu giảng viên chưa có lớp nào, tự động tạo 1 lớp mẫu sinh động để trải nghiệm demo
        if (classrooms.length === 0) {
            const demoClass = await Classroom.create({
                name: 'Lớp Ký Hiệu Hòa Nhập K24 - Khóa Sơ Cấp',
                description: 'Lớp học giao tiếp cơ bản, thế tay gia đình và phản xạ 21 điểm khớp tay MediaPipe',
                gradeLevel: 'Cơ bản',
                educatorId: req.user._id,
                joinCode: generateJoinCode(),
                students: [
                    {
                        name: 'Nguyễn Văn An',
                        email: 'an.nguyen@example.com',
                        averageScore: 94,
                        completedAssignmentsCount: 3,
                        educatorNote: 'Thế tay thái dương rất chuẩn, cần luyện thêm cử chỉ 2 tay.',
                    },
                    {
                        name: 'Trần Thị Mai',
                        email: 'mai.tran@example.com',
                        averageScore: 88,
                        completedAssignmentsCount: 2,
                        educatorNote: 'Cần chú ý giữ yên 1.5 giây để AI ghi nhận.',
                    },
                    {
                        name: 'Lê Hoàng Nam',
                        email: 'nam.le@example.com',
                        averageScore: 96,
                        completedAssignmentsCount: 3,
                        educatorNote: 'Xuất sắc, hoàn thành bài tập sớm nhất lớp.',
                    },
                    {
                        name: 'Phạm Minh Đức',
                        email: 'duc.pham@example.com',
                        averageScore: 78,
                        completedAssignmentsCount: 1,
                        educatorNote: 'Thường giơ tay quá thấp ở vùng ngực khi làm cử chỉ Xin chào.',
                    },
                ],
                assignments: [
                    {
                        title: 'Bài tập 01: Luyện thế tay Xin chào & Cảm ơn',
                        description: 'Mở webcam đạt độ khớp >= 88% và giữ thế 1.5 giây.',
                        targetSigns: ['Xin chào', 'Cảm ơn'],
                        minScore: 85,
                        minHoldTime: 1.5,
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        status: 'active',
                        submissions: [
                            {
                                studentName: 'Nguyễn Văn An',
                                score: 98,
                                holdTime: 1.5,
                                passed: true,
                                commonMistakes: [],
                            },
                            {
                                studentName: 'Lê Hoàng Nam',
                                score: 96,
                                holdTime: 1.5,
                                passed: true,
                                commonMistakes: [],
                            },
                            {
                                studentName: 'Trần Thị Mai',
                                score: 88,
                                holdTime: 1.5,
                                passed: true,
                                commonMistakes: ['Giữ thế hơi vội vàng'],
                            },
                        ],
                    },
                    {
                        title: 'Bài tập 02: Cử chỉ 2 tay "Cần giúp đỡ"',
                        description: 'Luyện tập song thủ: Tay trái bệ đỡ ngửa, tay phải đặt ngón cái lên trên.',
                        targetSigns: ['Cần giúp đỡ'],
                        minScore: 90,
                        minHoldTime: 1.5,
                        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                        status: 'active',
                        submissions: [
                            {
                                studentName: 'Lê Hoàng Nam',
                                score: 95,
                                holdTime: 1.5,
                                passed: true,
                                commonMistakes: [],
                            },
                            {
                                studentName: 'Phạm Minh Đức',
                                score: 72,
                                holdTime: 1.0,
                                passed: false,
                                commonMistakes: ['Khoảng cách 2 tay còn xa', 'Chưa xòe phẳng bàn tay đế'],
                            },
                        ],
                    },
                ],
            });
            classrooms = [demoClass];
        }

        res.status(200).json({
            success: true,
            count: classrooms.length,
            data: classrooms,
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách lớp học:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách lớp học',
            error: error.message,
        });
    }
};

/**
 * Tạo lớp học mới
 * POST /api/educator/classrooms
 */
exports.createClassroom = async (req, res) => {
    try {
        const { name, description, gradeLevel } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên lớp học',
            });
        }

        // Tạo mã code không trùng
        let joinCode = generateJoinCode();
        while (await Classroom.findOne({ joinCode })) {
            joinCode = generateJoinCode();
        }

        const classroom = await Classroom.create({
            name: name.trim(),
            description: description?.trim() || 'Lớp học ngôn ngữ ký hiệu hòa nhập chuyên biệt',
            gradeLevel: gradeLevel || 'Cơ bản',
            educatorId: req.user._id,
            joinCode,
            students: [],
            assignments: [],
        });

        res.status(201).json({
            success: true,
            message: 'Tạo lớp học thành công',
            data: classroom,
        });
    } catch (error) {
        console.error('Lỗi tạo lớp học:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo lớp học',
            error: error.message,
        });
    }
};

/**
 * Lấy chi tiết lớp học
 * GET /api/educator/classrooms/:id
 */
exports.getClassroomDetails = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lớp học',
            });
        }

        res.status(200).json({
            success: true,
            data: classroom,
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết lớp học:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy chi tiết lớp học',
            error: error.message,
        });
    }
};

/**
 * Giảng viên giao bài tập mới vào lớp học
 * POST /api/educator/classrooms/:id/assignments
 */
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, targetSigns, minScore, minHoldTime, dueDays } = req.body;

        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lớp học',
            });
        }

        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tiêu đề bài tập',
            });
        }

        const dueDate = new Date(Date.now() + (parseInt(dueDays) || 7) * 24 * 60 * 60 * 1000);

        const newAssignment = {
            title: title.trim(),
            description: description?.trim() || '',
            targetSigns: Array.isArray(targetSigns) ? targetSigns : ['Xin chào', 'Cảm ơn'],
            minScore: parseInt(minScore) || 85,
            minHoldTime: parseFloat(minHoldTime) || 1.5,
            dueDate,
            status: 'active',
            submissions: [],
        };

        classroom.assignments.unshift(newAssignment);
        await classroom.save();

        res.status(201).json({
            success: true,
            message: 'Giao bài tập thành công',
            data: classroom.assignments[0],
        });
    } catch (error) {
        console.error('Lỗi giao bài tập:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi giao bài tập',
            error: error.message,
        });
    }
};

/**
 * Giảng viên thêm nhận xét cho học viên
 * POST /api/educator/classrooms/:id/feedback
 */
exports.addStudentFeedback = async (req, res) => {
    try {
        const { studentEmail, note } = req.body;

        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lớp học',
            });
        }

        const student = classroom.students.find((s) => s.email === studentEmail);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy học viên trong lớp',
            });
        }

        student.educatorNote = note || '';
        await classroom.save();

        res.status(200).json({
            success: true,
            message: 'Đã lưu nhận xét học viên',
            data: student,
        });
    } catch (error) {
        console.error('Lỗi lưu nhận xét học viên:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lưu nhận xét học viên',
            error: error.message,
        });
    }
};

/**
 * Thống kê biểu đồ lỗi sai cử chỉ (Mistake Analytics Heatmap - UC17)
 * GET /api/educator/classrooms/:id/analytics
 */
exports.getAnalyticsHeatmap = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lớp học',
            });
        }

        // Báo cáo phân tích lỗi sai cử chỉ MediaPipe
        const analytics = {
            totalStudents: classroom.students.length,
            averageClassScore:
                classroom.students.length > 0
                    ? Math.round(
                          classroom.students.reduce((acc, s) => acc + (s.averageScore || 0), 0) /
                              classroom.students.length
                      )
                    : 0,
            completionRate: '87.5%',
            gestureMistakeHeatmap: [
                {
                    sign: 'Cần giúp đỡ (Help)',
                    type: 'Cử chỉ 2 tay',
                    errorRate: '38%',
                    difficulty: 'Khó',
                    topMistake: 'Khoảng cách 2 tay còn xa, tay đế chưa ngửa phẳng hoàn toàn',
                    pedagogicalTip: 'Cần ôn lại kỹ thuật đặt tay phải lên lòng bàn tay trái làm bệ đỡ.',
                },
                {
                    sign: 'Xin chào (Hello)',
                    type: 'Cử chỉ 1 tay',
                    errorRate: '18%',
                    difficulty: 'Dễ',
                    topMistake: 'Bàn tay giơ quá thấp dưới tầm mắt/ngực hoặc gập ngón tay',
                    pedagogicalTip: 'Nhắc học sinh đưa bàn tay chạm nhẹ ngang thái dương trước khi vẫy.',
                },
                {
                    sign: 'Tôi yêu bạn (ILY)',
                    type: 'Cử chỉ 1 tay',
                    errorRate: '22%',
                    difficulty: 'Trung bình',
                    topMistake: 'Quên xòe ngón cái hoặc gập nhầm ngón trỏ',
                    pedagogicalTip: 'Nhắc nhở câu thần chú: Mở ngón Cái - Trỏ - Út.',
                },
                {
                    sign: 'Cảm ơn (Thank you)',
                    type: 'Cử chỉ 1 tay',
                    errorRate: '12%',
                    difficulty: 'Dễ',
                    topMistake: 'Chưa giữ đủ thế 1.5 giây khi đưa ra từ cằm',
                    pedagogicalTip: 'Tập trung luyện hold-time 1.5 giây để AI ghi nhận.',
                },
            ],
        };

        res.status(200).json({
            success: true,
            data: analytics,
        });
    } catch (error) {
        console.error('Lỗi tính toán biểu đồ lỗi sai:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tính toán biểu đồ lỗi sai',
            error: error.message,
        });
    }
};

/**
 * Học viên tham gia lớp học bằng mã Join Code
 * POST /api/educator/join
 */
exports.joinClassroom = async (req, res) => {
    try {
        const { joinCode } = req.body;

        if (!joinCode || joinCode.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mã tham gia lớp học (Join Code)',
            });
        }

        const classroom = await Classroom.findOne({ joinCode: joinCode.trim().toUpperCase() });
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Mã tham gia không chính xác hoặc lớp học không tồn tại',
            });
        }

        // Kiểm tra xem học viên đã trong lớp chưa
        const alreadyJoined = classroom.students.some(
            (s) => s.studentId?.toString() === req.user._id.toString() || s.email === req.user.email
        );

        if (alreadyJoined) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã tham gia lớp học này rồi',
            });
        }

        classroom.students.push({
            studentId: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar || '',
            joinedAt: new Date(),
            averageScore: 0,
            completedAssignmentsCount: 0,
            educatorNote: '',
        });

        await classroom.save();

        res.status(200).json({
            success: true,
            message: `Tham gia thành công lớp học "${classroom.name}"!`,
            data: classroom,
        });
    } catch (error) {
        console.error('Lỗi tham gia lớp học:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tham gia lớp học',
            error: error.message,
        });
    }
};
