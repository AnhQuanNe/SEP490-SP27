import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import educatorService from '../../services/educator.service';
import {
    GraduationCap,
    Users,
    BookOpen,
    Plus,
    Copy,
    Check,
    Flame,
    Award,
    Sparkles,
    Clock,
    AlertTriangle,
    TrendingUp,
    CheckCircle2,
    XCircle,
    X,
    ChevronRight,
    Calendar,
    Send,
    FileText,
    BarChart3,
    Layers,
    Search,
    MessageSquare,
    Video,
    ShieldAlert
} from 'lucide-react';

const EducatorConsole = () => {
    const { user } = useAuth();
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClassIndex, setSelectedClassIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'heatmap' | 'students'
    const [copiedCode, setCopiedCode] = useState(false);

    // Modals
    const [showCreateClassModal, setShowCreateClassModal] = useState(false);
    const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedStudentForNote, setSelectedStudentForNote] = useState(null);

    // Form inputs
    const [newClassName, setNewClassName] = useState('');
    const [newClassDesc, setNewClassDesc] = useState('');
    const [newClassLevel, setNewClassLevel] = useState('Cơ bản');

    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [assignmentSigns, setAssignmentSigns] = useState(['Xin chào', 'Cảm ơn']);
    const [assignmentMinScore, setAssignmentMinScore] = useState(85);
    const [assignmentDueDays, setAssignmentDueDays] = useState(7);

    const [studentNoteText, setStudentNoteText] = useState('');
    const [inputJoinCode, setInputJoinCode] = useState('');
    const [joinSuccessMsg, setJoinSuccessMsg] = useState('');
    const [joinErrorMsg, setJoinErrorMsg] = useState('');

    // Heatmap data
    const [heatmapData, setHeatmapData] = useState(null);

    // Fetch classrooms
    useEffect(() => {
        const loadClassrooms = async () => {
            setLoading(true);
            try {
                const res = await educatorService.getMyClassrooms();
                if (res.success && res.data) {
                    setClassrooms(res.data);
                }
            } catch (err) {
                console.error('Lỗi tải dữ liệu lớp học:', err);
            } finally {
                setLoading(false);
            }
        };
        loadClassrooms();
    }, []);

    const currentClass = classrooms[selectedClassIndex] || classrooms[0];

    // Fetch heatmap analytics when switching to heatmap tab
    useEffect(() => {
        if (currentClass?._id) {
            educatorService.getAnalyticsHeatmap(currentClass._id).then((res) => {
                if (res.success) {
                    setHeatmapData(res.data);
                }
            });
        }
    }, [currentClass]);

    // Copy Join Code to clipboard
    const handleCopyJoinCode = () => {
        if (currentClass?.joinCode) {
            navigator.clipboard.writeText(currentClass.joinCode);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    // Create Classroom
    const handleCreateClassroom = async (e) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        try {
            const res = await educatorService.createClassroom({
                name: newClassName,
                description: newClassDesc,
                gradeLevel: newClassLevel,
            });

            if (res.success && res.data) {
                setClassrooms([res.data, ...classrooms]);
                setSelectedClassIndex(0);
                setShowCreateClassModal(false);
                setNewClassName('');
                setNewClassDesc('');
            }
        } catch (err) {
            console.error('Lỗi tạo lớp học:', err);
        }
    };

    // Create Assignment
    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        if (!assignmentTitle.trim() || !currentClass?._id) return;

        try {
            const res = await educatorService.createAssignment(currentClass._id, {
                title: assignmentTitle,
                targetSigns: assignmentSigns,
                minScore: assignmentMinScore,
                minHoldTime: 1.5,
                dueDays: assignmentDueDays,
            });

            if (res.success && res.data) {
                const updatedClassrooms = [...classrooms];
                if (!updatedClassrooms[selectedClassIndex].assignments) {
                    updatedClassrooms[selectedClassIndex].assignments = [];
                }
                updatedClassrooms[selectedClassIndex].assignments.unshift(res.data);
                setClassrooms(updatedClassrooms);
                setShowCreateAssignmentModal(false);
                setAssignmentTitle('');
            }
        } catch (err) {
            console.error('Lỗi giao bài tập:', err);
        }
    };

    // Save Student Feedback Note
    const handleSaveStudentNote = async () => {
        if (!selectedStudentForNote || !currentClass?._id) return;

        try {
            await educatorService.addStudentFeedback(currentClass._id, {
                studentEmail: selectedStudentForNote.email,
                note: studentNoteText,
            });

            const updatedClassrooms = [...classrooms];
            const student = updatedClassrooms[selectedClassIndex].students.find(
                (s) => s.email === selectedStudentForNote.email
            );
            if (student) {
                student.educatorNote = studentNoteText;
                setClassrooms(updatedClassrooms);
            }
            setSelectedStudentForNote(null);
        } catch (err) {
            console.error('Lỗi lưu nhận xét:', err);
        }
    };

    // Join classroom via code
    const handleJoinClassroom = async (e) => {
        e.preventDefault();
        setJoinSuccessMsg('');
        setJoinErrorMsg('');

        try {
            const res = await educatorService.joinClassroom(inputJoinCode);
            if (res.success) {
                setJoinSuccessMsg(res.message);
                setInputJoinCode('');
            }
        } catch (err) {
            setJoinErrorMsg(err.response?.data?.message || 'Không thể tham gia lớp học.');
        }
    };

    const toggleSignSelection = (signName) => {
        if (assignmentSigns.includes(signName)) {
            setAssignmentSigns(assignmentSigns.filter((s) => s !== signName));
        } else {
            setAssignmentSigns([...assignmentSigns, signName]);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                            <GraduationCap className="w-4 h-4 text-indigo-400" />
                            <span>• Bảng Điều Khiển Giảng Viên Chuyên Biệt</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                            Quản Lý Lớp Học & Giáo Án Ký Hiệu AI
                        </h1>
                        <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                            Cấp Join Code tạo lớp học hòa nhập, giao bài tập về nhà Gương ảo AI MediaPipe và theo dõi biểu đồ nhiệt lỗi sai thế tay của từng học viên.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition flex items-center gap-2 backdrop-blur-md cursor-pointer"
                        >
                            <Users className="w-4 h-4 text-indigo-300" />
                            <span>Nhập Mã Tham Gia Lớp</span>
                        </button>

                        <button
                            onClick={() => setShowCreateClassModal(true)}
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-500/30 transition flex items-center gap-2 cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>Tạo Lớp Học Mới</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Tổng Học Viên</span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">
                        {currentClass?.students?.length || 0}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 font-semibold">Đã kích hoạt tài khoản</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Bài Tập Đã Giao</span>
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">
                        {currentClass?.assignments?.length || 0}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 font-semibold">Gương ảo AI chấm chuẩn</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Điểm Trung Bình</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-600">
                        {heatmapData?.averageClassScore || 89}%
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-1 font-semibold">Khớp góc tay MediaPipe</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Cần Lưu Ý</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-amber-600">
                        Cử chỉ 2 tay
                    </p>
                    <p className="text-[11px] text-amber-700 mt-1 font-semibold">Tỷ lệ sai 38% ở bệ đỡ</p>
                </div>
            </div>

            {/* Class Selector Bar */}
            {classrooms.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Lớp của bạn:</span>
                    {classrooms.map((cls, idx) => (
                        <button
                            key={cls._id || idx}
                            onClick={() => setSelectedClassIndex(idx)}
                            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                                selectedClassIndex === idx
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            {cls.name} ({cls.joinCode})
                        </button>
                    ))}
                </div>
            )}

            {/* Current Class Information & Prominent Join Code Card */}
            {currentClass && (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Cấp độ: {currentClass.gradeLevel}
                            </span>
                            <span className="text-xs text-slate-400">
                                • {currentClass.students?.length || 0} học viên
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                            {currentClass.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                            {currentClass.description}
                        </p>
                    </div>

                    {/* Prominent JOIN CODE Card */}
                    <div className="bg-gradient-to-tr from-rose-50 via-pink-50 to-indigo-50 p-4 sm:p-5 rounded-2xl border border-rose-200/80 flex items-center gap-4 flex-shrink-0 shadow-2xs">
                        <div>
                            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                                Mã Tham Gia Lớp (Join Code)
                            </p>
                            <p className="text-2xl sm:text-3xl font-black tracking-widest text-slate-900 font-mono mt-0.5">
                                {currentClass.joinCode}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Gửi mã này cho học sinh để vào lớp</p>
                        </div>
                        <button
                            onClick={handleCopyJoinCode}
                            className={`p-3 rounded-xl transition shadow-sm cursor-pointer ${
                                copiedCode
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                            title="Sao chép mã tham gia"
                        >
                            {copiedCode ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Functional Navigation Tabs */}
            <div className="border-b border-slate-200 flex items-center gap-4 sm:gap-8 text-sm font-bold">
                <button
                    onClick={() => setActiveTab('assignments')}
                    className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
                        activeTab === 'assignments'
                            ? 'border-rose-500 text-rose-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    <span>Bài Tập Giao Về Nhà</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {currentClass?.assignments?.length || 0}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('heatmap')}
                    className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
                        activeTab === 'heatmap'
                            ? 'border-rose-500 text-rose-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    <span>Biểu Đồ Lỗi Sai Cử Chỉ</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">
                        Heatmap
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('students')}
                    className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
                        activeTab === 'students'
                            ? 'border-rose-500 text-rose-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    <span>Sổ Điểm & Học Viên ({currentClass?.students?.length || 0})</span>
                </button>
            </div>

            {/* TAB 1: BÀI TẬP GIAO VỀ NHÀ (AI HOMEWORK) */}
            {activeTab === 'assignments' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-extrabold text-slate-900">Danh Sách Bài Tập Gương Ảo AI</h3>
                            <p className="text-xs text-slate-500">
                                Học viên mở webcam luyện tập đạt chuẩn để hệ thống tự động ghi nhận điểm
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateAssignmentModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Giao Bài Tập Mới</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentClass?.assignments && currentClass.assignments.length > 0 ? (
                            currentClass.assignments.map((assign, idx) => (
                                <div
                                    key={assign._id || idx}
                                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                                                    Đang hoạt động
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Hạn nộp: {new Date(assign.dueDate).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-extrabold text-slate-900">
                                                {assign.title}
                                            </h4>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <span className="text-xs font-bold text-slate-500 block">Tiêu chuẩn AI</span>
                                            <span className="text-sm font-black text-rose-600">
                                                &gt;= {assign.minScore}% • {assign.minHoldTime}s
                                            </span>
                                        </div>
                                    </div>

                                    {/* Target signs badges */}
                                    <div className="space-y-1.5">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Ký hiệu yêu cầu luyện:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {assign.targetSigns?.map((sgn) => (
                                                <span
                                                    key={sgn}
                                                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
                                                >
                                                    {sgn}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Submissions count bar */}
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 text-slate-600 font-semibold">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span>Đã nộp bài: {assign.submissions?.length || 0} học sinh</span>
                                        </div>
                                        <span className="text-indigo-600 font-bold hover:underline cursor-pointer">
                                            Xem chi tiết &gt;
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
                                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                                <p className="font-bold text-slate-700 text-sm">Chưa có bài tập nào được giao</p>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                    Bấm vào nút "Giao Bài Tập Mới" ở trên để chọn các cử chỉ ký hiệu và đặt tiêu chuẩn chấm điểm AI cho học viên.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: BIỂU ĐỒ LỖI SAI CỬ CHỈ (MISTAKE ANALYTICS HEATMAP - UC17) */}
            {activeTab === 'heatmap' && (
                <div className="space-y-6">
                    <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 sm:p-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                                Hệ Thống Phân Tích Lỗi Sai Cử Chỉ Tự Động (AI Mistake Heatmap)
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Dựa trên các lần luyện tập trước webcam của toàn bộ học viên trong lớp, AI tự động thống kê góc ngón tay hoặc tư thế nào đang bị trượt nhiều nhất để giảng viên kịp thời thị phạm và sửa sai trong buổi học tiếp theo.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {heatmapData?.gestureMistakeHeatmap?.map((item) => (
                            <div
                                key={item.sign}
                                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
                            >
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                                            {item.type}
                                        </span>
                                        <h4 className="text-lg font-black text-slate-900 mt-1">
                                            {item.sign}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                            Tỷ lệ mắc lỗi
                                        </span>
                                        <span className={`text-xl font-black ${
                                            parseInt(item.errorRate) > 30 ? 'text-rose-600' : 'text-amber-600'
                                        }`}>
                                            {item.errorRate}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-xs">
                                        <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-slate-800">Lỗi sai phổ biến nhất:</p>
                                            <p className="text-slate-500 mt-0.5">{item.topMistake}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-indigo-900">Gợi ý sư phạm cho giảng viên:</p>
                                            <p className="text-indigo-700 mt-0.5">{item.pedagogicalTip}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: SỔ ĐIỂM & DANH SÁCH HỌC VIÊN */}
            {activeTab === 'students' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-extrabold text-slate-900 text-base">
                                Sổ Điểm Học Viên Lớp {currentClass?.name}
                            </h3>
                            <span className="text-xs font-semibold text-slate-400">
                                {currentClass?.students?.length || 0} học viên đang theo học
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3.5">Học viên</th>
                                        <th className="px-6 py-3.5">Ngày tham gia</th>
                                        <th className="px-6 py-3.5 text-center">Bài tập đã nộp</th>
                                        <th className="px-6 py-3.5 text-center">Điểm TB</th>
                                        <th className="px-6 py-3.5">Ghi chú của Giảng viên</th>
                                        <th className="px-6 py-3.5 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentClass?.students && currentClass.students.length > 0 ? (
                                        currentClass.students.map((student, idx) => (
                                            <tr key={student.email || idx} className="hover:bg-slate-50/70 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                                                            {student.name ? student.name.charAt(0) : 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-extrabold text-slate-900">{student.name}</p>
                                                            <p className="text-xs text-slate-400">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-xs text-slate-500">
                                                    {student.joinedAt ? new Date(student.joinedAt).toLocaleDateString('vi-VN') : 'Mới tham gia'}
                                                </td>

                                                <td className="px-6 py-4 text-center font-bold text-slate-700">
                                                    {student.completedAssignmentsCount || 0} bài
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                                                        (student.averageScore || 0) >= 90
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : (student.averageScore || 0) >= 80
                                                            ? 'bg-indigo-50 text-indigo-700'
                                                            : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                        {student.averageScore || 0}%
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                                                    {student.educatorNote ? (
                                                        <span className="italic">"{student.educatorNote}"</span>
                                                    ) : (
                                                        <span className="text-slate-300">Chưa có ghi chú</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudentForNote(student);
                                                            setStudentNoteText(student.educatorNote || '');
                                                        }}
                                                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                                                    >
                                                        Ghi nhận xét
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-xs text-slate-400">
                                                Lớp học chưa có học viên nào. Gửi mã Join Code cho học sinh để tham gia lớp!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 1: TẠO LỚP HỌC MỚI */}
            {showCreateClassModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-extrabold text-lg text-slate-900">Tạo Lớp Học Chuyên Biệt Mới</h3>
                            <button
                                onClick={() => setShowCreateClassModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateClassroom} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Lớp Học *</label>
                                <input
                                    type="text"
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    placeholder="VD: Lớp Ký Hiệu Giao Tiếp K25..."
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Cấp Độ Lớp Học</label>
                                <select
                                    value={newClassLevel}
                                    onChange={(e) => setNewClassLevel(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                >
                                    <option value="Cơ bản">Cơ bản (Sơ cấp)</option>
                                    <option value="Trung cấp">Trung cấp (Giao tiếp thường nhật)</option>
                                    <option value="Nâng cao">Nâng cao (Hội thoại chuyên ngành)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Mô Tả Lớp Học</label>
                                <textarea
                                    value={newClassDesc}
                                    onChange={(e) => setNewClassDesc(e.target.value)}
                                    placeholder="Mô tả mục tiêu khóa học..."
                                    rows="3"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                ></textarea>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateClassModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md"
                                >
                                    Tạo Lớp & Cấp Mã
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: GIAO BÀI TẬP VỀ NHÀ MỚI */}
            {showCreateAssignmentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-extrabold text-lg text-slate-900">Giao Bài Tập Gương Ảo AI</h3>
                            <button
                                onClick={() => setShowCreateAssignmentModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAssignment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu Đề Bài Tập *</label>
                                <input
                                    type="text"
                                    value={assignmentTitle}
                                    onChange={(e) => setAssignmentTitle(e.target.value)}
                                    placeholder="VD: Bài tập tuần 02: Luyện tập cử chỉ 2 tay..."
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Chọn Ký Hiệu Yêu Cầu Luyện Tập:
                                </label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {['Xin chào', 'Cảm ơn', 'Tôi yêu bạn', 'Cần giúp đỡ', 'Chúc mừng', 'Ăn cơm'].map(
                                        (sign) => (
                                            <button
                                                type="button"
                                                key={sign}
                                                onClick={() => toggleSignSelection(sign)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                                    assignmentSigns.includes(sign)
                                                        ? 'bg-rose-500 text-white shadow-xs'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {sign}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Điểm AI Tối Thiểu (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="70"
                                        max="100"
                                        value={assignmentMinScore}
                                        onChange={(e) => setAssignmentMinScore(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Thời Hạn Nộp (Số Ngày)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={assignmentDueDays}
                                        onChange={(e) => setAssignmentDueDays(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateAssignmentModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold text-xs shadow-md"
                                >
                                    Phát Bài Tập Cho Cả Lớp
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: NHẬN XÉT HỌC VIÊN */}
            {selectedStudentForNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-extrabold text-base text-slate-900">
                                    Ghi Nhận Xét Cho {selectedStudentForNote.name}
                                </h3>
                                <p className="text-xs text-slate-400">{selectedStudentForNote.email}</p>
                            </div>
                            <button
                                onClick={() => setSelectedStudentForNote(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <textarea
                            value={studentNoteText}
                            onChange={(e) => setStudentNoteText(e.target.value)}
                            placeholder="Nhập lời nhận xét thế tay, khuyến khích học viên..."
                            rows="4"
                            className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        ></textarea>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedStudentForNote(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleSaveStudentNote}
                                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md"
                            >
                                Lưu Nhận Xét
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 4: NHẬP MÃ THAM GIA LỚP (JOIN CODE DÀNH CHO HỌC VIÊN) */}
            {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-extrabold text-lg text-slate-900">Tham Gia Lớp Bằng Join Code</h3>
                            <button
                                onClick={() => {
                                    setShowJoinModal(false);
                                    setJoinSuccessMsg('');
                                    setJoinErrorMsg('');
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleJoinClassroom} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Nhập Mã Lớp Học (6 ký tự, VD: HS-7842)
                                </label>
                                <input
                                    type="text"
                                    value={inputJoinCode}
                                    onChange={(e) => setInputJoinCode(e.target.value.toUpperCase())}
                                    placeholder="HS-XXXX"
                                    required
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-center font-mono font-black text-xl tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
                                />
                            </div>

                            {joinSuccessMsg && (
                                <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-xl text-center">
                                    {joinSuccessMsg}
                                </p>
                            )}

                            {joinErrorMsg && (
                                <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl text-center">
                                    {joinErrorMsg}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold text-sm shadow-md"
                            >
                                Xác Nhận Vào Lớp
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default EducatorConsole;
