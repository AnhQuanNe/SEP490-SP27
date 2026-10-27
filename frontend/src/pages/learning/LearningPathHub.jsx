import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Sparkles,
    Compass,
    Calendar,
    Clock,
    Target,
    Award,
    Trophy,
    Heart,
    Scroll,
    ArrowRight,
    Plus,
    Trash2,
    AlertCircle,
    Loader2,
    BookCheck,
    TrendingUp
} from 'lucide-react';
import learningPathService from '../../services/learningPath.service';
import './LearningPath.css';

const ICON_MAP = {
    BookOpen,
    Award,
    Heart,
    Sparkles,
    Trophy,
    Compass,
    Scroll,
};

const PRESET_GOALS = [
    'Thấu hiểu triết lý nhân sinh và đạo lý cội nguồn trong ca dao tục ngữ',
    'Khám phá vẻ đẹp nghệ thuật ẩn dụ và ngôn từ dân gian mộc mạc',
    'Học tập kinh nghiệm ứng xử, đối nhân xử thế từ lời răn của tiền nhân',
    'Rèn luyện phẩm chất kiên định, lòng hiếu thảo và tinh thần tương thân tương ái',
];

const DEFAULT_TOPICS = [
    {
        id: 'ca-dao-tuc-ngu',
        title: 'Ca dao & Tục ngữ Việt Nam',
        category: 'ca-dao',
        description: 'Khám phá triết lý dân gian, đạo lý sống, tình yêu quê hương và gia đình qua những câu đúc kết truyền đời.',
        worksCount: 21,
        icon: 'BookOpen',
    },
    {
        id: 'tuc-ngu',
        title: 'Tục ngữ & Tri thức Dân gian',
        category: 'tuc-ngu',
        description: 'Tập trung vào các câu tục ngữ đúc kết kinh nghiệm sống, đạo đức đối nhân xử thế và lao động.',
        worksCount: 8,
        icon: 'Award',
    },
    {
        id: 'long-biet-on',
        title: 'Chuyên đề: Lòng biết ơn & Cội nguồn',
        category: 'thematic',
        description: 'Chùm ca dao, tục ngữ răn dạy lòng hiếu kính cha mẹ, tri ân thầy cô và nhớ ơn tiên tổ.',
        worksCount: 8,
        icon: 'Heart',
    },
    {
        id: 'doan-ket-nhan-ai',
        title: 'Chuyên đề: Đoàn kết & Tương thân tương ái',
        category: 'thematic',
        description: 'Tôn vinh tinh thần lá lành đùm lá rách, tình đồng bào và tình cảm keo sơn gắn kết dân tộc.',
        worksCount: 7,
        icon: 'Sparkles',
    },
    {
        id: 'y-chi-nghi-luc',
        title: 'Chuyên đề: Ý chí & Rèn luyện nhân cách',
        category: 'thematic',
        description: 'Những lời răn về lòng kiên định vượt khó, học hỏi tri thức và hoàn thiện phẩm chất.',
        worksCount: 6,
        icon: 'Trophy',
    },
    {
        id: 'van-hoc-dan-gian',
        title: 'Toàn cảnh Di sản Dân gian Việt Nam',
        category: 'dan-gian',
        description: 'Hành trình kết hợp thần thoại, truyền thuyết, cổ tích và ca dao tục ngữ tiêu biểu.',
        worksCount: 25,
        icon: 'Compass',
    },
];

const LearningPathHub = () => {
    const navigate = useNavigate();

    const [topics, setTopics] = useState(DEFAULT_TOPICS);
    const [userPaths, setUserPaths] = useState([]);
    const [activePath, setActivePath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Form inputs
    const [selectedTopic, setSelectedTopic] = useState('ca-dao-tuc-ngu');
    const [totalDays, setTotalDays] = useState(7);
    const [dailyMinutes, setDailyMinutes] = useState(15);
    const [goal, setGoal] = useState(PRESET_GOALS[0]);

    const loadAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [topicsRes, pathsRes, activeRes] = await Promise.all([
                learningPathService.getTopics().catch((e) => ({ success: false, error: e })),
                learningPathService.getUserPaths().catch((e) => ({ success: false, error: e })),
                learningPathService.getActivePath().catch(() => ({ data: null })),
            ]);

            if (topicsRes.success && Array.isArray(topicsRes.data) && topicsRes.data.length > 0) {
                setTopics(topicsRes.data);
            } else {
                setTopics(DEFAULT_TOPICS);
                if (topicsRes.error?.message?.includes('không tồn tại')) {
                    setError('Server backend chưa được khởi động lại để nhận diện các route Lộ trình học mới. Vui lòng khởi động lại backend (npm run dev trong thư mục backend) và bấm "Thử lại".');
                }
            }

            if (pathsRes.success) {
                setUserPaths(pathsRes.data || []);
            }
            if (activeRes?.success && activeRes.data) {
                setActivePath(activeRes.data);
            }
        } catch (err) {
            console.error('Lỗi nạp dữ liệu lộ trình:', err);
            setError(err.message || 'Không thể tải thông tin lộ trình học tập');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let ignore = false;
        const initFetch = async () => {
            try {
                const [topicsRes, pathsRes, activeRes] = await Promise.all([
                    learningPathService.getTopics().catch((e) => ({ success: false, error: e })),
                    learningPathService.getUserPaths().catch((e) => ({ success: false, error: e })),
                    learningPathService.getActivePath().catch(() => ({ data: null })),
                ]);

                if (!ignore) {
                    if (topicsRes.success && Array.isArray(topicsRes.data) && topicsRes.data.length > 0) {
                        setTopics(topicsRes.data);
                    } else {
                        setTopics(DEFAULT_TOPICS);
                        if (topicsRes.error?.message?.includes('không tồn tại')) {
                            setError('Server backend chưa được khởi động lại để nhận diện các route Lộ trình học mới. Vui lòng khởi động lại backend (npm run dev trong thư mục backend) và bấm "Thử lại".');
                        }
                    }

                    if (pathsRes.success) {
                        setUserPaths(pathsRes.data || []);
                    }
                    if (activeRes?.success && activeRes.data) {
                        setActivePath(activeRes.data);
                    }
                }
            } catch (err) {
                if (!ignore) {
                    console.error('Lỗi nạp dữ liệu lộ trình:', err);
                    setError(err.message || 'Không thể tải thông tin lộ trình học tập');
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        initFetch();
        return () => {
            ignore = true;
        };
    }, []);

    const handleCreatePath = async (e) => {
        e.preventDefault();
        if (!selectedTopic) {
            setError('Vui lòng chọn một chủ đề học tập');
            return;
        }

        setCreating(true);
        setError(null);
        try {
            const res = await learningPathService.createPath({
                topic: selectedTopic,
                goal,
                totalDays: Number(totalDays),
                dailyMinutes: Number(dailyMinutes),
            });

            if (res.success && res.data) {
                navigate(`/lo-trinh-hoc/${res.data._id}`);
            }
        } catch (err) {
            setError(err.message || 'Không thể tạo lộ trình học tập. Vui lòng thử lại!');
        } finally {
            setCreating(false);
        }
    };

    const handleDeletePath = async (e, pathId) => {
        e.stopPropagation();
        if (!window.confirm('Bạn có chắc chắn muốn xóa lộ trình học tập này không?')) return;

        try {
            await learningPathService.deletePath(pathId);
            setUserPaths((prev) => prev.filter((p) => p._id !== pathId));
            if (activePath?._id === pathId) {
                setActivePath(null);
            }
        } catch (err) {
            alert(err.message || 'Lỗi khi xóa lộ trình');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#fffdf9]">
                <Loader2 className="w-10 h-10 text-amber-700 animate-spin mb-4" />
                <p className="text-amber-950 font-medium">Đang tải thông tin lộ trình học tập cá nhân hóa...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fffdf9] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* HERO BANNER */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-red-900 to-amber-900 text-white p-6 sm:p-10 shadow-xl border border-amber-500/30">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold uppercase tracking-wider mb-4">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            Định hướng Sư phạm & AI Đồng hành
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-100 font-serif tracking-tight leading-tight mb-4">
                            Lộ Trình Học Văn Hóa Cá Nhân Hóa
                        </h1>
                        <p className="text-amber-200/90 text-sm sm:text-base leading-relaxed mb-6">
                            Khám phá tinh hoa ca dao, tục ngữ và văn học dân gian Việt Nam theo lộ trình khoa học từ cơ bản đến nâng cao.
                            100% dựa trên dữ liệu văn hóa có thật trong hệ thống, kết hợp phân tích sư phạm và bài tập thực hành hằng ngày.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-red-950 font-bold shadow-lg shadow-amber-950/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                            >
                                <Plus className="w-5 h-5" />
                                Thiết kế Lộ trình mới
                            </button>
                            {activePath && (
                                <button
                                    onClick={() => navigate(`/lo-trinh-hoc/${activePath._id}`)}
                                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 border border-amber-300/30 font-semibold backdrop-blur-sm flex items-center gap-2 transition-all cursor-pointer"
                                >
                                    Tiếp tục bài học hiện tại
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* THÔNG BÁO LỖI NẾU CÓ */}
                {error && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium leading-relaxed">{error}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={loadAllData}
                                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={() => setError(null)}
                                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}

                {/* THẺ LỘ TRÌNH ĐANG HỌC GẦN NHẤT (NẾU CÓ) */}
                {activePath && (
                    <div className="bg-white rounded-2xl border-2 border-amber-500/40 p-6 sm:p-8 shadow-md relative overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-3 max-w-2xl">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-900 rounded-md">
                                        {activePath.topicLabel || 'Ca dao & Tục ngữ'}
                                    </span>
                                    <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md flex items-center gap-1">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        {activePath.status === 'completed' ? 'Đã hoàn thành' : 'Đang học'}
                                    </span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-red-950 font-serif">
                                    {activePath.title}
                                </h3>
                                <p className="text-stone-600 text-sm line-clamp-2">
                                    Mục tiêu: {activePath.goal}
                                </p>
                                {/* Thanh tiến độ */}
                                <div className="space-y-1.5 pt-2">
                                    <div className="flex justify-between text-xs font-medium text-stone-600">
                                        <span>Đã học {activePath.progress?.completedDays || 0}/{activePath.totalDays} ngày</span>
                                        <span className="font-bold text-amber-800">{activePath.progress?.percent || 0}% hoàn thành</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-amber-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-500"
                                            style={{ width: `${activePath.progress?.percent || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-shrink-0 flex items-center gap-3">
                                <button
                                    onClick={() => navigate(`/lo-trinh-hoc/${activePath._id}`)}
                                    className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-red-900 hover:bg-red-800 text-amber-100 font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                                >
                                    <span>Học tiếp Ngày {activePath.progress?.currentDay || 1}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL / FORM THIẾT KẾ LỘ TRÌNH MỚI */}
                {showCreateForm && (
                    <div className="bg-white rounded-3xl border border-amber-900/20 p-6 sm:p-10 shadow-lg space-y-8 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                            <div>
                                <h2 className="text-2xl font-black text-red-950 font-serif">
                                    Thiết Kế Lộ Trình Học Văn Hóa
                                </h2>
                                <p className="text-sm text-stone-600 mt-1">
                                    Chọn chủ đề, số ngày và thời lượng phù hợp với thời gian biểu của bạn.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="text-stone-400 hover:text-stone-700 text-sm font-semibold p-2 cursor-pointer"
                            >
                                Đóng lại
                            </button>
                        </div>

                        <form onSubmit={handleCreatePath} className="space-y-8">
                            {/* BƯỚC 1: CHỌN CHỦ ĐỀ */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-stone-900 uppercase tracking-wide">
                                    1. Chọn Chủ Đề Học Tập
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {topics.map((t) => {
                                        const IconComp = ICON_MAP[t.icon] || BookOpen;
                                        const isSelected = selectedTopic === t.id;
                                        return (
                                            <div
                                                key={t.id}
                                                onClick={() => setSelectedTopic(t.id)}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected
                                                        ? 'border-amber-600 bg-amber-50/70 shadow-md ring-2 ring-amber-500/20'
                                                        : 'border-stone-200 hover:border-amber-300 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                                                        <IconComp className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                                                        {t.worksCount} tác phẩm
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-stone-900 text-base mb-1">{t.title}</h4>
                                                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{t.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* BƯỚC 2: THỜI LƯỢNG & THỜI GIAN MỖI NGÀY */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-stone-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-amber-700" />
                                        2. Số Ngày Muốn Học:
                                        <span className="text-amber-800 font-extrabold">{totalDays} ngày</span>
                                    </label>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {[3, 5, 7, 10, 14, 21].map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setTotalDays(d)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${totalDays === d
                                                        ? 'bg-amber-700 text-white shadow-sm'
                                                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                                    }`}
                                            >
                                                {d} ngày
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-stone-900 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-700" />
                                        3. Thời Gian Học Mỗi Ngày:
                                        <span className="text-amber-800 font-extrabold">{dailyMinutes} phút</span>
                                    </label>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {[5, 10, 15, 20, 30].map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setDailyMinutes(m)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${dailyMinutes === m
                                                        ? 'bg-amber-700 text-white shadow-sm'
                                                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                                    }`}
                                            >
                                                {m} phút
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* BƯỚC 3: MỤC TIÊU HỌC TẬP */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-stone-900 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-amber-700" />
                                    4. Mục Tiêu Cá Nhân Của Bạn:
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {PRESET_GOALS.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setGoal(preset)}
                                            className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${goal === preset
                                                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                                                    : 'border-stone-200 hover:border-amber-400 text-stone-600'
                                                }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-stone-900"
                                    placeholder="Ví dụ: Tôi muốn học ca dao, tục ngữ Việt Nam trong 14 ngày, mỗi ngày dành khoảng 10 phút để hiểu rõ hơn về văn hóa tổ tiên..."
                                    required
                                />
                            </div>

                            {/* NÚT TẠO LỘ TRÌNH */}
                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-stone-200">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-6 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-sm font-semibold cursor-pointer"
                                    disabled={creating}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-900 to-amber-700 hover:from-red-800 hover:to-amber-600 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Đang xây dựng lộ trình cá nhân hóa...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 text-amber-300" />
                                            <span>Bắt Đầu Lộ Trình</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* DANH SÁCH CÁC LỘ TRÌNH ĐÃ TẠO */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl sm:text-2xl font-bold text-red-950 font-serif flex items-center gap-2">
                            <BookCheck className="w-6 h-6 text-amber-700" />
                            Lộ Trình Của Bạn ({userPaths.length})
                        </h2>
                    </div>

                    {userPaths.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-900">
                                Bạn chưa có lộ trình học văn hóa nào
                            </h3>
                            <p className="text-sm text-stone-600 max-w-md mx-auto">
                                Hãy tạo một lộ trình cá nhân hóa theo chủ đề bạn yêu thích để bắt đầu hành trình khám phá di sản mỗi ngày!
                            </p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold shadow cursor-pointer inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo Lộ Trình Đầu Tiên
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userPaths.map((p) => {
                                const isDone = p.status === 'completed';
                                return (
                                    <div
                                        key={p._id}
                                        onClick={() => navigate(`/lo-trinh-hoc/${p._id}`)}
                                        className="bg-white rounded-2xl border border-amber-900/15 p-6 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="px-2.5 py-1 text-xs font-bold rounded bg-amber-100 text-amber-900">
                                                    {p.topicLabel || 'Văn hóa Dân gian'}
                                                </span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                                                    }`}>
                                                    {isDone ? 'Đã xong' : `${p.progress?.completedDays || 0}/${p.totalDays} ngày`}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-red-950 font-serif text-lg group-hover:text-amber-800 transition-colors line-clamp-2">
                                                {p.title}
                                            </h3>

                                            <p className="text-xs text-stone-600 line-clamp-2">
                                                {p.goal}
                                            </p>

                                            {/* Progress Bar */}
                                            <div className="space-y-1 pt-2">
                                                <div className="flex justify-between text-xs text-stone-500 font-medium">
                                                    <span>Tiến độ</span>
                                                    <span className="font-bold text-amber-800">{p.progress?.percent || 0}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-amber-600 rounded-full"
                                                        style={{ width: `${p.progress?.percent || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                                            <span>Mỗi ngày {p.dailyMinutes || 15} phút</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => handleDeletePath(e, p._id)}
                                                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                    title="Xóa lộ trình"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <span className="text-amber-800 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                                    Vào học <ArrowRight className="w-3.5 h-3.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LearningPathHub;
