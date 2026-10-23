import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle2,
    Calendar,
    Clock,
    Target,
    BookOpen,
    Sparkles,
    Award,
    ChevronRight,
    ChevronLeft,
    Loader2,
    AlertCircle,
    Save,
    Layers,
    Feather,
    Check,
    X
} from 'lucide-react';
import learningPathService from '../../services/learningPath.service';
import WorkDetailModal from '../../components/common/WorkDetailModal';
import './LearningPath.css';

const PHASE_LABELS = {
    basic: { text: 'Khởi động & Nghĩa đen', color: 'bg-blue-100 text-blue-900 border-blue-200' },
    intermediate: { text: 'Nghĩa bóng & Ẩn dụ', color: 'bg-amber-100 text-amber-900 border-amber-200' },
    advanced: { text: 'Đạo lý & Giá trị sống', color: 'bg-purple-100 text-purple-900 border-purple-200' },
    synthesis: { text: 'Vận dụng & Tổng kết', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
};

const LearningPathDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [path, setPath] = useState(null);
    const [selectedDayNumber, setSelectedDayNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Trạng thái bài tập trắc nghiệm của ngày đang xem
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submittingQuiz, setSubmittingQuiz] = useState(false);
    const [quizResult, setQuizResult] = useState(null);

    // Ghi chú của người dùng
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [noteSavedAlert, setNoteSavedAlert] = useState(false);

    // Modal xem tư liệu gốc
    const [activeModalWork, setActiveModalWork] = useState(null);

    useEffect(() => {
        let ignore = false;
        const fetchDetail = async () => {
            try {
                const res = await learningPathService.getPathById(id);
                if (!ignore && res.success && res.data) {
                    setPath(res.data);
                    // Chọn ngày hiện tại đang học
                    const curr = res.data.progress?.currentDay || 1;
                    setSelectedDayNumber(curr);

                    // Khởi tạo ghi chú của ngày hiện tại
                    const dayObj = res.data.days.find((d) => d.day === curr);
                    if (dayObj) {
                        setNotes(dayObj.userNotes || '');
                        if (dayObj.quizScore !== null) {
                            setQuizResult({
                                score: dayObj.quizScore,
                                quizDetails: dayObj.quizDetails || [],
                            });
                        } else {
                            setQuizResult(null);
                            setSelectedAnswers({});
                        }
                    }
                }
            } catch (err) {
                if (!ignore) {
                    console.error('Lỗi tải lộ trình:', err);
                    setError(err.message || 'Không thể tải chi tiết lộ trình học tập');
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchDetail();
        return () => {
            ignore = true;
        };
    }, [id]);

    const handleSelectDay = (dayNum) => {
        setSelectedDayNumber(dayNum);
        const dayObj = path.days.find((d) => d.day === dayNum);
        if (dayObj) {
            setNotes(dayObj.userNotes || '');
            if (dayObj.quizScore !== null) {
                setQuizResult({
                    score: dayObj.quizScore,
                    quizDetails: dayObj.quizDetails || [],
                });
            } else {
                setQuizResult(null);
                setSelectedAnswers({});
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentDay = path?.days?.find((d) => d.day === selectedDayNumber);

    const handleSelectOption = (questionId, optionIdx) => {
        if (currentDay?.isCompleted && quizResult) return; // Không đổi đáp án khi đã nộp bài
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: optionIdx,
        }));
    };

    const handleSubmitQuiz = async () => {
        const questions = currentDay?.practiceQuestions || [];
        const answersPayload = questions.map((q) => ({
            questionId: q.questionId,
            selectedIndex: typeof selectedAnswers[q.questionId] === 'number' ? selectedAnswers[q.questionId] : -1,
        }));

        // Kiểm tra xem đã trả lời hết các câu hỏi chưa
        const unselected = answersPayload.filter((a) => a.selectedIndex === -1);
        if (unselected.length > 0) {
            if (!window.confirm(`Bạn còn ${unselected.length} câu chưa chọn đáp án. Bạn có chắc chắn muốn nộp bài ngay?`)) {
                return;
            }
        }

        setSubmittingQuiz(true);
        try {
            const res = await learningPathService.submitDayQuiz(path._id, selectedDayNumber, answersPayload);
            if (res.success && res.data) {
                setQuizResult(res.data);
                // Cập nhật lại state của path
                setPath(res.data.path);
            }
        } catch (err) {
            alert(err.message || 'Lỗi khi nộp bài trắc nghiệm');
        } finally {
            setSubmittingQuiz(false);
        }
    };

    const handleCompleteDayOnly = async () => {
        try {
            const res = await learningPathService.completeDay(path._id, selectedDayNumber, notes);
            if (res.success && res.data) {
                setPath(res.data);
                alert(`Chúc mừng bạn đã hoàn thành bài học Ngày ${selectedDayNumber}!`);
            }
        } catch (err) {
            alert(err.message || 'Không thể cập nhật trạng thái');
        }
    };

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            await learningPathService.completeDay(path._id, selectedDayNumber, notes);
            setNoteSavedAlert(true);
            setTimeout(() => setNoteSavedAlert(false), 3000);
        } catch (err) {
            alert(err.message || 'Không thể lưu ghi chú');
        } finally {
            setSavingNotes(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#fffdf9]">
                <Loader2 className="w-10 h-10 text-amber-700 animate-spin mb-4" />
                <p className="text-amber-950 font-medium">Đang tải nội dung bài học...</p>
            </div>
        );
    }

    if (error || !path) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#fffdf9] text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                <h2 className="text-xl font-bold text-stone-900 mb-2">Lỗi truy cập lộ trình</h2>
                <p className="text-stone-600 mb-6">{error || 'Không tìm thấy lộ trình học tập'}</p>
                <button
                    onClick={() => navigate('/lo-trinh-hoc')}
                    className="px-6 py-2.5 rounded-xl bg-amber-700 text-white font-bold cursor-pointer inline-flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách lộ trình
                </button>
            </div>
        );
    }

    const phaseConfig = PHASE_LABELS[currentDay?.phase] || PHASE_LABELS.basic;

    return (
        <div className="min-h-screen bg-[#fffdf9] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* HEADER THANH TIẾN ĐỘ & QUAY LẠI */}
                <div className="bg-white rounded-2xl border border-amber-900/15 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/lo-trinh-hoc')}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                            title="Về trung tâm lộ trình"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900">
                                    {path.topicLabel}
                                </span>
                                <span className="text-xs text-stone-500">
                                    {path.totalDays} ngày học • {path.dailyMinutes} phút/ngày
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-red-950 font-serif line-clamp-1">
                                {path.title}
                            </h1>
                        </div>
                    </div>

                    {/* Progress Bar & Stats */}
                    <div className="flex items-center gap-4 min-w-[260px]">
                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between text-xs font-medium text-stone-600">
                                <span>Tiến độ tổng thể</span>
                                <span className="font-bold text-amber-800">{path.progress?.completedDays || 0}/{path.totalDays} ngày ({path.progress?.percent || 0}%)</span>
                            </div>
                            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-500"
                                    style={{ width: `${path.progress?.percent || 0}%` }}
                                />
                            </div>
                        </div>
                        {path.status === 'completed' && (
                            <span className="p-2 rounded-full bg-emerald-100 text-emerald-800" title="Đã hoàn thành lộ trình">
                                <Award className="w-5 h-5" />
                            </span>
                        )}
                    </div>
                </div>

                {/* BANNER ĐỀ XUẤT CÁ NHÂN HÓA GẦN NHẤT (NẾU CÓ) */}
                {path.recommendations && path.recommendations.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl border border-amber-300/80 p-4 sm:p-5 shadow-xs flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1 text-sm">
                            <div className="font-bold text-amber-950 flex items-center gap-2">
                                <span>Gợi Ý Học Tập & Ôn Tập Cá Nhân Hóa (VietHeritage AI)</span>
                            </div>
                            <p className="text-amber-900 leading-relaxed">
                                {path.recommendations[0].message}
                            </p>
                        </div>
                    </div>
                )}

                {/* BỐ CỤC 2 CỘT: DANH SÁCH CÁC NGÀY + NỘI DUNG BÀI HỌC */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* CỘT TRÁI: TIMELINE / DANH SÁCH NGÀY HỌC */}
                    <div className="lg:col-span-4 bg-white rounded-3xl border border-amber-900/15 p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-amber-700" />
                                Lộ Trình {path.totalDays} Ngày
                            </h3>
                            <span className="text-xs text-stone-500">
                                {path.progress?.completedDays || 0} bài đã xong
                            </span>
                        </div>

                        <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
                            {path.days.map((dayItem) => {
                                const isSelected = dayItem.day === selectedDayNumber;
                                const isCompleted = dayItem.isCompleted;
                                const hasQuiz = dayItem.quizScore !== null;

                                return (
                                    <div
                                        key={dayItem.day}
                                        onClick={() => handleSelectDay(dayItem.day)}
                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                            isSelected
                                                ? 'border-amber-600 bg-amber-50/80 shadow-xs ring-1 ring-amber-600/30'
                                                : isCompleted
                                                    ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300'
                                                    : 'border-stone-200 hover:border-amber-200 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                                isCompleted
                                                    ? 'bg-emerald-600 text-white'
                                                    : isSelected
                                                        ? 'bg-amber-700 text-white'
                                                        : 'bg-stone-100 text-stone-700'
                                            }`}>
                                                {isCompleted ? <Check className="w-4 h-4" /> : dayItem.day}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-stone-900 truncate">
                                                    {dayItem.title}
                                                </h4>
                                                <p className="text-[11px] text-stone-500 truncate">
                                                    {dayItem.works?.[0]?.title || 'Tác phẩm văn hóa'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 flex items-center gap-1.5">
                                            {hasQuiz && (
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    dayItem.quizScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                                }`}>
                                                    {dayItem.quizScore}đ
                                                </span>
                                            )}
                                            {isSelected && (
                                                <ChevronRight className="w-4 h-4 text-amber-700" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* CỘT PHẢI: NỘI DUNG CHI TIẾT BÀI HỌC CỦA NGÀY ĐANG CHỌN */}
                    {currentDay && (
                        <div className="lg:col-span-8 space-y-6">
                            
                            {/* THẺ TỔNG QUAN BÀI HỌC NGÀY */}
                            <div className="bg-white rounded-3xl border border-amber-900/15 p-6 sm:p-8 shadow-sm space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${phaseConfig.color}`}>
                                        Giai đoạn: {phaseConfig.text}
                                    </span>
                                    <span className="text-xs text-stone-500 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        Thời lượng dự kiến: {currentDay.estimatedMinutes || 15} phút
                                    </span>
                                </div>

                                <h2 className="text-2xl sm:text-3xl font-black text-red-950 font-serif leading-tight">
                                    {currentDay.title}
                                </h2>

                                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
                                    <Target className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 mb-0.5">
                                            Mục tiêu bài học
                                        </h4>
                                        <p className="text-sm text-stone-700 leading-relaxed">
                                            {currentDay.objective}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* DANH SÁCH TÁC PHẨM VĂN HÓA TRONG NGÀY (CÓ THẬT TỪ DATABASE) */}
                            <div className="space-y-6">
                                {currentDay.works.map((w, wIdx) => (
                                    <div key={wIdx} className="bg-white rounded-3xl border border-amber-900/15 p-6 sm:p-8 shadow-sm space-y-6">
                                        
                                        {/* Tiêu đề & Thông tin phân loại */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-4">
                                            <div>
                                                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                                                    {w.categoryName || 'Văn học dân gian'}
                                                </span>
                                                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
                                                    {w.title}
                                                </h3>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setActiveModalWork(w)}
                                                className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 hover:bg-amber-100/70 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors cursor-pointer"
                                                title="Mở hồ sơ chi tiết tác phẩm gốc"
                                            >
                                                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                                                <span>Xem tư liệu gốc</span>
                                                <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                                            </button>
                                        </div>

                                        {/* NGUYÊN VĂN TÁC PHẨM (HERITAGE QUOTE) */}
                                        <div className="heritage-quote-box">
                                            <p className="text-lg sm:text-xl font-serif text-amber-950 font-semibold leading-relaxed italic pl-6">
                                                {w.quote || w.title}
                                            </p>
                                        </div>

                                        {/* 4 TẦNG NGHĨA & BÀI HỌC SÂU SẮC */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Nghĩa đen */}
                                            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                                                <span className="text-xs font-bold uppercase text-stone-600 flex items-center gap-1.5">
                                                    <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                                                    1. Ý nghĩa Nghĩa đen:
                                                </span>
                                                <p className="text-sm text-stone-700 leading-relaxed">
                                                    {w.literalMeaning || w.summary || 'Hình ảnh sinh động khởi nguồn từ đời sống và lao động cổ truyền.'}
                                                </p>
                                            </div>

                                            {/* Nghĩa bóng */}
                                            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                                                <span className="text-xs font-bold uppercase text-amber-900 flex items-center gap-1.5">
                                                    <Layers className="w-3.5 h-3.5 text-amber-700" />
                                                    2. Tầng nghĩa Nghĩa bóng:
                                                </span>
                                                <p className="text-sm text-stone-700 leading-relaxed">
                                                    {w.figurativeMeaning || 'Triết lý ẩn dụ sâu xa được gửi gắm qua hình ảnh dân gian.'}
                                                </p>
                                            </div>

                                            {/* Bài học đạo lý */}
                                            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-1.5">
                                                <span className="text-xs font-bold uppercase text-emerald-900 flex items-center gap-1.5">
                                                    <Award className="w-3.5 h-3.5 text-emerald-700" />
                                                    3. Bài học & Triết lý nhân sinh:
                                                </span>
                                                <p className="text-sm text-stone-700 leading-relaxed">
                                                    {w.lesson || 'Lời răn dạy quý báu về đạo làm người và cách đối nhân xử thế.'}
                                                </p>
                                            </div>

                                            {/* Bối cảnh văn hóa */}
                                            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200/80 space-y-1.5">
                                                <span className="text-xs font-bold uppercase text-purple-900 flex items-center gap-1.5">
                                                    <Feather className="w-3.5 h-3.5 text-purple-700" />
                                                    4. Bối cảnh văn hóa & Lịch sử:
                                                </span>
                                                <p className="text-sm text-stone-700 leading-relaxed">
                                                    {w.historicalContext || w.thematicMeaning || 'Đúc kết từ lịch sử dựng nước và phong tục truyền thống của dân tộc.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* NGUỒN THAM KHẢO HỌC THUẬT */}
                                        {w.source && (
                                            <div className="text-xs text-stone-500 italic border-t border-stone-100 pt-3">
                                                <span className="font-semibold text-stone-600">Nguồn trích dẫn học thuật:</span> {w.source}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* LỜI BÌNH & CHIÊM NGHIỆM TỪ VIETHERITAGE AI */}
                            {currentDay.aiAnalysis && (
                                <div className="bg-gradient-to-br from-amber-950 via-red-950 to-stone-900 text-amber-100 rounded-3xl p-6 sm:p-8 shadow-md space-y-3 relative overflow-hidden">
                                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                                        <Sparkles className="w-4 h-4" />
                                        Góc Chiêm Nghiệm Văn Hóa (VietHeritage AI)
                                    </div>
                                    <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif">
                                        {currentDay.aiAnalysis}
                                    </p>
                                </div>
                            )}

                            {/* HOẠT ĐỘNG HỌC TẬP THỰC TẾ & GHI CHÚ */}
                            <div className="bg-white rounded-3xl border border-amber-900/15 p-6 sm:p-8 shadow-sm space-y-4">
                                <div className="space-y-2">
                                    <span className="text-xs font-bold uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                                        <Target className="w-4 h-4 text-amber-700" />
                                        Hoạt Động Thực Hành Trong Ngày
                                    </span>
                                    <p className="text-sm text-stone-800 font-medium leading-relaxed bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
                                        {currentDay.activity || 'Đọc kỹ câu ca dao/tục ngữ và liên hệ với một hành động cụ thể trong gia đình hoặc nơi làm việc của bạn.'}
                                    </p>
                                </div>

                                {/* Ghi chú của học viên */}
                                <div className="space-y-2 pt-2">
                                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
                                        Sổ tay cảm nhận của bạn:
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        placeholder="Ghi lại cảm nhận, bài học bạn rút ra hoặc dự định áp dụng hôm nay..."
                                        className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-stone-900"
                                    />
                                    <div className="flex items-center justify-between">
                                        {noteSavedAlert ? (
                                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                                <Check className="w-3.5 h-3.5" /> Đã lưu ghi chú thành công!
                                            </span>
                                        ) : <div />}
                                        <button
                                            type="button"
                                            onClick={handleSaveNotes}
                                            disabled={savingNotes}
                                            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                        >
                                            <Save className="w-3.5 h-3.5" />
                                            {savingNotes ? 'Đang lưu...' : 'Lưu ghi chú'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* PHẦN CÂU HỎI LUYỆN TẬP TRẮC NGHIỆM (QUIZ) */}
                            {currentDay.practiceQuestions && currentDay.practiceQuestions.length > 0 && (
                                <div className="bg-white rounded-3xl border border-amber-900/15 p-6 sm:p-8 shadow-sm space-y-6">
                                    <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                                        <div>
                                            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                                                Kiểm tra kiến thức ngày
                                            </span>
                                            <h3 className="text-xl font-bold text-stone-900 font-serif">
                                                Câu Hỏi Luyện Tập & Trắc Nghiệm
                                            </h3>
                                        </div>
                                        {quizResult && (
                                            <div className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 ${
                                                quizResult.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                            }`}>
                                                <Award className="w-4 h-4" />
                                                <span>Điểm số: {quizResult.score}/100</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        {currentDay.practiceQuestions.map((q, qIdx) => {
                                            const questionKey = q.questionId;
                                            const selectedIdx = selectedAnswers[questionKey];
                                            const isEvaluated = !!quizResult;
                                            const detail = quizResult?.quizDetails?.[qIdx];

                                            return (
                                                <div key={qIdx} className="space-y-3 p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80">
                                                    <h4 className="text-sm font-bold text-stone-900">
                                                        Câu {qIdx + 1}: {q.question}
                                                    </h4>

                                                    <div className="grid grid-cols-1 gap-2.5">
                                                        {q.options.map((opt, optIdx) => {
                                                            let btnStyle = 'quiz-option-btn';
                                                            if (isEvaluated) {
                                                                if (optIdx === q.correctIndex) {
                                                                    btnStyle += ' correct';
                                                                } else if (selectedIdx === optIdx && !detail?.isCorrect) {
                                                                    btnStyle += ' wrong';
                                                                }
                                                            } else if (selectedIdx === optIdx) {
                                                                btnStyle += ' selected';
                                                            }

                                                            return (
                                                                <button
                                                                    key={optIdx}
                                                                    type="button"
                                                                    disabled={isEvaluated}
                                                                    onClick={() => handleSelectOption(questionKey, optIdx)}
                                                                    className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between cursor-pointer ${btnStyle}`}
                                                                >
                                                                    <span>{opt}</span>
                                                                    {isEvaluated && optIdx === q.correctIndex && (
                                                                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                                    )}
                                                                    {isEvaluated && selectedIdx === optIdx && optIdx !== q.correctIndex && (
                                                                        <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Giải thích sau khi nộp bài */}
                                                    {isEvaluated && q.explanation && (
                                                        <div className="p-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 leading-relaxed">
                                                            <span className="font-bold text-amber-900">Giải thích:</span> {q.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Nút nộp bài */}
                                    {!quizResult ? (
                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="button"
                                                onClick={handleSubmitQuiz}
                                                disabled={submittingQuiz}
                                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-900 to-amber-700 hover:from-red-800 hover:to-amber-600 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                            >
                                                {submittingQuiz ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Đang chấm điểm...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>Nộp Bài & Chấm Điểm</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                                                    ✓
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-emerald-950 text-sm">
                                                        Đã ghi nhận kết quả Ngày {selectedDayNumber} vào hồ sơ!
                                                    </h5>
                                                    <p className="text-xs text-emerald-800">
                                                        Tiến độ học tập và điểm số đã được đồng bộ với hành trình văn hóa của bạn.
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedDayNumber < path.totalDays && (
                                                <button
                                                    onClick={() => handleSelectDay(selectedDayNumber + 1)}
                                                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
                                                >
                                                    Sang Ngày {selectedDayNumber + 1}
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* THANH ĐIỀU HƯỚNG BÀI TRƯỚC / BÀI TIẾP THEO */}
                            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                                <button
                                    onClick={() => handleSelectDay(selectedDayNumber - 1)}
                                    disabled={selectedDayNumber <= 1}
                                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs sm:text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Ngày trước
                                </button>

                                {!currentDay.isCompleted && !quizResult && (
                                    <button
                                        onClick={handleCompleteDayOnly}
                                        className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                                    >
                                        <Check className="w-4 h-4" />
                                        Đánh dấu hoàn thành bài học
                                    </button>
                                )}

                                <button
                                    onClick={() => handleSelectDay(selectedDayNumber + 1)}
                                    disabled={selectedDayNumber >= path.totalDays}
                                    className="px-4 py-2.5 rounded-xl bg-red-900 hover:bg-red-800 text-white text-xs sm:text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                                >
                                    Ngày tiếp theo
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                        </div>
                    )}
                </div>

                {/* MODAL XEM CHI TIẾT TƯ LIỆU GỐC TRỰC TIẾP */}
                {activeModalWork && (
                    <WorkDetailModal
                        work={activeModalWork}
                        isOpen={!!activeModalWork}
                        onClose={() => setActiveModalWork(null)}
                    />
                )}

            </div>
        </div>
    );
};

export default LearningPathDetail;
