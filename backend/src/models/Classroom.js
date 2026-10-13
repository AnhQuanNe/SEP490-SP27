const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên lớp học'],
            trim: true,
        },
        description: {
            type: String,
            default: 'Lớp học ngôn ngữ ký hiệu hòa nhập chuyên biệt',
            trim: true,
        },
        gradeLevel: {
            type: String,
            enum: ['Cơ bản', 'Trung cấp', 'Nâng cao', 'Chuyên sâu'],
            default: 'Cơ bản',
        },
        educatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Lớp học phải thuộc về một giảng viên'],
        },
        joinCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        students: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                name: String,
                email: String,
                avatar: String,
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
                averageScore: {
                    type: Number,
                    default: 0,
                },
                completedAssignmentsCount: {
                    type: Number,
                    default: 0,
                },
                educatorNote: {
                    type: String,
                    default: '',
                },
            },
        ],
        assignments: [
            {
                title: {
                    type: String,
                    required: true,
                    trim: true,
                },
                description: {
                    type: String,
                    default: '',
                },
                lessonIds: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Lesson',
                    },
                ],
                targetSigns: [String], // e.g. ["Xin chào", "Cảm ơn", "Cần giúp đỡ"]
                minScore: {
                    type: Number,
                    default: 85,
                },
                minHoldTime: {
                    type: Number,
                    default: 1.5,
                },
                dueDate: {
                    type: Date,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
                status: {
                    type: String,
                    enum: ['active', 'closed'],
                    default: 'active',
                },
                submissions: [
                    {
                        studentId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'User',
                        },
                        studentName: String,
                        score: Number,
                        holdTime: Number,
                        passed: Boolean,
                        submittedAt: {
                            type: Date,
                            default: Date.now,
                        },
                        commonMistakes: [String],
                    },
                ],
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Classroom', classroomSchema);
