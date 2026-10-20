import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Send, 
    BookOpen, 
    ShieldCheck, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    FileText, 
    Loader2, 
    Sparkles, 
    AlertCircle, 
    History,
    Feather,
    Scroll,
    Compass,
    ExternalLink,
    HelpCircle,
    Info,
    RefreshCw
} from 'lucide-react';
import submissionService from '../services/submission.service';
import aiService from '../services/ai.service';
import DragonPhoenixHeritage from '../components/common/DragonPhoenixHeritage';

const SubmitContent = () => {
    const [activeTab, setActiveTab] = useState('new'); // 'new' | 'my'
    const [submitting, setSubmitting] = useState(false);
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [aiSuccessBadge, setAiSuccessBadge] = useState('');

    // Form fields
    const [formData, setFormData] = useState({
        title: '',
        category: 'ca-dao',
        topic: 'Lòng biết ơn',
        meaning: '',
        literalMeaning: '',
        figurativeMeaning: '',
        lesson: '',
        historicalContext: '',
        region: 'Toàn quốc',
        source: '',
    });

    // My submissions state
    const [mySubmissions, setMySubmissions] = useState([]);
    const [loadingMy, setLoadingMy] = useState(false);

    const loadMySubmissions = async () => {
        setLoadingMy(true);
        try {
            const data = await submissionService.getMySubmissions(1, 50);
            setMySubmissions(data.submissions || []);
        } catch (error) {
            console.error('Lỗi tải bài đóng góp của tôi:', error);
        } finally {
            setLoadingMy(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'my') {
            loadMySubmissions();
        }
    }, [activeTab]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setErrorMessage('');
    };

    // TÍNH NĂNG ĐỘT PHÁ: AI CO-PILOT TỰ ĐỘNG PHÂN TÍCH 4 TẦNG NGHĨA
    const handleAiAssist = async () => {
        if (!formData.title.trim()) {
            setErrorMessage('Vui lòng nhập câu ca dao, tục ngữ trước khi nhờ AI phân tích gợi ý.');
            return;
        }

        setAiAnalyzing(true);
        setErrorMessage('');
        setAiSuccessBadge('');

        try {
            const result = await aiService.draftSubmission({
                title: formData.title.trim(),
                category: formData.category,
            });

            if (result) {
                setFormData((prev) => ({
                    ...prev,
                    meaning: result.meaning || prev.meaning,
                    literalMeaning: result.literalMeaning || prev.literalMeaning,
                    figurativeMeaning: result.figurativeMeaning || prev.figurativeMeaning,
                    lesson: result.lesson || prev.lesson,
                    historicalContext: result.historicalContext || prev.historicalContext,
                    topic: result.topic || prev.topic,
                    region: result.region || prev.region,
                    source: result.source || prev.source,
                }));

                if (result.isExistingInDatabase) {
                    setAiSuccessBadge('💡 Câu này đã có trong kho tàng đối chiếu. AI đã tự động điền các tầng nghĩa học thuật chuẩn mực để bạn tham khảo hoặc bổ sung dị bản!');
                } else {
                    setAiSuccessBadge('✨ Trợ lý AI đã phân tích hoàn tất 4 tầng nghĩa và nguồn học thuật! Bạn hãy xem lại và chỉnh sửa theo ý mình trước khi gửi nhé.');
                }
            }
        } catch (err) {
            console.error('Lỗi AI hỗ trợ soạn thảo:', err);
            setErrorMessage(err.response?.data?.message || err.message || 'Chưa thể kết nối với Trợ lý AI lúc này.');
        } finally {
            setAiAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (!formData.title.trim() || formData.title.trim().length < 3) {
            setErrorMessage('Vui lòng nhập câu ca dao hoặc tục ngữ hợp lệ (tối thiểu 3 ký tự).');
            return;
        }

        if (!formData.meaning.trim() || formData.meaning.trim().length < 10) {
            setErrorMessage('Vui lòng giải thích ý nghĩa nội dung đóng góp (tối thiểu 10 ký tự). Bạn có thể bấm nút "Nhờ AI Trợ Lý Phân Tích" để được gợi ý nhanh!');
            return;
        }

        if (!formData.source.trim() || formData.source.trim().length < 5) {
            setErrorMessage('Vui lòng cung cấp nguồn tham khảo học thuật kiểm chứng (sách, tác giả, nhà xuất bản).');
            return;
        }

        setSubmitting(true);
        try {
            const res = await submissionService.createSubmission(formData);
            setSuccessMessage(res.message || 'Gửi đóng góp thành công! Ban Quản trị và Hội đồng Học thuật sẽ thẩm định và xuất bản sớm.');
            setFormData({
                title: '',
                category: 'ca-dao',
                topic: 'Lòng biết ơn',
                meaning: '',
                literalMeaning: '',
                figurativeMeaning: '',
                lesson: '',
                historicalContext: '',
                region: 'Toàn quốc',
                source: '',
            });
            setAiSuccessBadge('');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || 'Đã có lỗi xảy ra khi gửi đóng góp');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã Phê Duyệt & Xuất Bản
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
                        <XCircle className="w-4 h-4 text-rose-600" /> Cần Hoàn Thiện Lại
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                        <Clock className="w-4 h-4 text-amber-600" /> Đang Thẩm Định Học Thuật
                    </span>
                );
        }
    };

    return (
        <div className="space-y-12 pb-24 min-h-[90vh]">
            {/* 1. HERO HEADER: CỔ THIỆN THƯ PHÒNG & KHÍ CHẤT HOÀNG THÀNH */}
            <section className="relative overflow-hidden pt-12 pb-16 bg-gradient-to-b from-[#240606] via-[#160404] to-[#0e0202] text-amber-50 border-b-2 border-amber-500/30">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <DragonPhoenixHeritage variant="hero" />
                </div>

                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#450a0a]/80 text-[#fcd34d] text-xs font-semibold border border-amber-500/50 shadow-md shadow-red-950/40">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                        <span>❖ RỒNG BAY THĂNG LONG • GÓP NHẶT TINH HOA ❖</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heritage text-[#fffbeb] drop-shadow-md">
                        Chung Tay Dựng Xây{' '}
                        <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                            Bách Khoa Di Sản Văn Tộc
                        </span>
                    </h1>

                    <p className="max-w-3xl mx-auto text-sm sm:text-base text-amber-100/90 font-vietnam font-light leading-relaxed">
                        Mỗi câu ca dao, tục ngữ bạn hiến tặng là một viên gạch gìn giữ hồn thiêng sông núi cho muôn đời sau. Mọi nội dung đóng góp đều được thẩm định học thuật và vinh danh trang trọng trên kho tàng quốc gia.
                    </p>
                </div>
            </section>

            {/* 2. MAIN CONTAINER */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                {/* Navigation Tabs Cung Đình */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex p-1.5 bg-[#2c0808]/90 backdrop-blur-md rounded-2xl border border-amber-500/40 shadow-xl shadow-red-950/30">
                        <button
                            type="button"
                            onClick={() => setActiveTab('new')}
                            className={`py-2.5 px-6 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'new'
                                    ? 'bg-gradient-to-r from-[#991b1b] to-[#b45309] text-amber-100 shadow-md border border-amber-400/50'
                                    : 'text-amber-200/70 hover:text-amber-100'
                            }`}
                        >
                            <Feather className="w-4 h-4" />
                            <span>Soạn Thảo Đóng Góp</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('my')}
                            className={`py-2.5 px-6 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'my'
                                    ? 'bg-gradient-to-r from-[#991b1b] to-[#b45309] text-amber-100 shadow-md border border-amber-400/50'
                                    : 'text-amber-200/70 hover:text-amber-100'
                            }`}
                        >
                            <Scroll className="w-4 h-4" />
                            <span>Đóng Góp Của Tôi</span>
                            {mySubmissions.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-400 text-stone-950 font-black">
                                    {mySubmissions.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* TAB 1: FORM SOẠN THẢO CHIẾU CHỈ */}
                {activeTab === 'new' ? (
                    <div className="relative bg-[#fffdf9]/98 rounded-3xl border-2 border-amber-600/40 shadow-2xl shadow-red-950/40 p-6 sm:p-10 overflow-hidden">
                        {/* 4 họa tiết góc truyền thống ❖ */}
                        <span className="absolute -top-1.5 -left-1.5 text-amber-600 text-sm font-bold select-none">❖</span>
                        <span className="absolute -top-1.5 -right-1.5 text-amber-600 text-sm font-bold select-none">❖</span>
                        <span className="absolute -bottom-1.5 -left-1.5 text-amber-600 text-sm font-bold select-none">❖</span>
                        <span className="absolute -bottom-1.5 -right-1.5 text-amber-600 text-sm font-bold select-none">❖</span>

                        {/* Dải vân màu hoàng cung trên đỉnh */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-red-800 via-amber-500 to-red-800 absolute top-0 left-0"></div>

                        {/* Thông báo Thành công & Lỗi */}
                        {successMessage && (
                            <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-base font-heritage">Đã gửi đóng góp thành công!</p>
                                    <p className="text-sm text-emerald-900 mt-0.5">{successMessage}</p>
                                </div>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-300 text-red-950 flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
                                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm">Chưa thể gửi nội dung</p>
                                    <p className="text-sm text-red-800 mt-0.5">{errorMessage}</p>
                                </div>
                            </div>
                        )}

                        {aiSuccessBadge && (
                            <div className="mb-8 p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
                                <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm leading-relaxed font-medium">
                                    {aiSuccessBadge}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* KHỐI 1: CÂU CA DAO / TỤC NGỮ VÀ NÚT AI CO-PILOT */}
                            <div className="p-5 sm:p-6 rounded-2xl bg-[#faf6ed] border border-amber-300/80 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 font-vietnam">
                                        Câu Ca Dao / Tục Ngữ / Tích Xưa <span className="text-red-600">*</span>
                                    </label>

                                    {/* NÚT AI CO-PILOT */}
                                    <button
                                        type="button"
                                        onClick={handleAiAssist}
                                        disabled={aiAnalyzing}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 border border-amber-500/70 shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {aiAnalyzing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                                                <span>AI Đang Phân Tích & Đối Chiếu...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 text-amber-900" />
                                                <span>✨ Nhờ AI Trợ Lý Phân Tích Gợi Ý</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Bầu ơi thương lấy bí cùng / Tuy rằng khác giống nhưng chung một giàn"
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl border border-amber-300 focus:border-amber-600 focus:ring-4 focus:ring-amber-500/20 text-stone-900 text-base font-heritage font-semibold bg-white transition-all placeholder:text-stone-400"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                    {/* Loại nội dung */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5 font-vietnam">
                                            Loại nội dung
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:border-amber-600 text-stone-900 text-sm font-medium bg-white"
                                        >
                                            <option value="ca-dao">Ca dao Dân ca</option>
                                            <option value="tuc-ngu">Tục ngữ Việt Nam</option>
                                            <option value="co-tich">Truyện cổ tích</option>
                                            <option value="truyen-thuyet">Truyền thuyết</option>
                                            <option value="than-thoai">Thần thoại</option>
                                            <option value="khac">Khác</option>
                                        </select>
                                    </div>

                                    {/* Chủ đề */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5 font-vietnam">
                                            Chủ đề
                                        </label>
                                        <select
                                            name="topic"
                                            value={formData.topic}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:border-amber-600 text-stone-900 text-sm font-medium bg-white"
                                        >
                                            <option value="Lòng biết ơn">Lòng biết ơn</option>
                                            <option value="Tình cảm gia đình">Tình cảm gia đình</option>
                                            <option value="Đoàn kết - Nhân ái">Đoàn kết - Nhân ái</option>
                                            <option value="Ý chí - Nghị lực">Ý chí - Nghị lực</option>
                                            <option value="Kinh nghiệm sống - Đạo lý">Kinh nghiệm sống - Đạo lý</option>
                                            <option value="Tình yêu quê hương đất nước">Tình yêu quê hương đất nước</option>
                                            <option value="Hiếu học - Tri thức">Hiếu học - Tri thức</option>
                                        </select>
                                    </div>

                                    {/* Vùng miền */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5 font-vietnam">
                                            Vùng miền (nếu có)
                                        </label>
                                        <select
                                            name="region"
                                            value={formData.region}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:border-amber-600 text-stone-900 text-sm font-medium bg-white"
                                        >
                                            <option value="Toàn quốc">Toàn quốc (Phổ quát)</option>
                                            <option value="Bắc Bộ">Bắc Bộ (Đồng bằng sông Hồng / Kinh Bắc)</option>
                                            <option value="Trung Bộ">Trung Bộ (Xứ Nghệ / Huế / Nam Trung Bộ)</option>
                                            <option value="Nam Bộ">Nam Bộ (Tây Nam Bộ / Đông Nam Bộ)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* KHỐI 2: 4 TẦNG NGHĨA HỌC THUẬT */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-amber-900/10 pb-2">
                                    <BookOpen className="w-5 h-5 text-amber-800" />
                                    <h3 className="font-heritage text-lg font-bold text-stone-900">
                                        Chiêm Nghiệm 4 Tầng Nghĩa Văn Hóa
                                    </h3>
                                    <span className="text-xs text-stone-500 font-vietnam">
                                        (Tự nhập hoặc bấm nút AI gợi ý ở trên)
                                    </span>
                                </div>

                                {/* Ý nghĩa tổng quan */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-2 font-vietnam">
                                        Ý nghĩa tổng quát <span className="text-red-600">*</span>
                                    </label>
                                    <textarea
                                        name="meaning"
                                        rows={3}
                                        value={formData.meaning}
                                        onChange={handleChange}
                                        placeholder="Tóm tắt ý nghĩa triết lý cốt lõi của câu..."
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-amber-300/80 focus:border-amber-600 focus:ring-4 focus:ring-amber-500/20 text-stone-900 text-sm bg-[#faf6ed] focus:bg-white transition-all placeholder:text-stone-400"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Nghĩa đen */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5 font-vietnam">
                                            1. Nghĩa đen (Nghĩa thực tế sự vật)
                                        </label>
                                        <textarea
                                            name="literalMeaning"
                                            rows={3}
                                            value={formData.literalMeaning}
                                            onChange={handleChange}
                                            placeholder="Phân tích các hình tượng, sinh hoạt cụ thể..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-amber-300/80 focus:border-amber-600 focus:ring-4 focus:ring-amber-500/20 text-stone-900 text-sm bg-[#faf6ed] focus:bg-white transition-all placeholder:text-stone-400"
                                        />
                                    </div>

                                    {/* Nghĩa bóng */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5 font-vietnam">
                                            2. Nghĩa bóng (Ngụ ý & Ẩn dụ)
                                        </label>
                                        <textarea
                                            name="figurativeMeaning"
                                            rows={3}
                                            value={formData.figurativeMeaning}
                                            onChange={handleChange}
                                            placeholder="Ý nghĩa biểu tượng, ẩn dụ sâu xa..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-amber-300/80 focus:border-amber-600 focus:ring-4 focus:ring-amber-500/20 text-stone-900 text-sm bg-[#faf6ed] focus:bg-white transition-all placeholder:text-stone-400"
                                        />
                                    </div>

                                    {/* Bài học */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5 font-vietnam">
                                            3. Bài học nhân sinh
                                        </label>
                                        <textarea
                                            name="lesson"
                                            rows={3}
                                            value={formData.lesson}
                                            onChange={handleChange}
                                            placeholder="Lời răn dạy đối nhân xử thế cho thế hệ sau..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-amber-300/80 focus:border-amber-600 focus:ring-4 focus:ring-amber-500/20 text-stone-900 text-sm bg-[#faf6ed] focus:bg-white transition-all placeholder:text-stone-400"
                                        />
                                    </div>

                                    {/* Bối cảnh lịch sử */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5 font-vietnam">
                                            4. Bối cảnh văn hóa / lịch sử
                                        </label>
                                        <textarea
                                            name="historicalContext"
                                            rows={3}
                                            value={formData.historicalContext}
                                            onChange={handleChange}
                                            placeholder="Cội nguồn ra đời, tập tục dân gian liên quan..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-amber-300/80 focus:border-amber-600 focus:ring-4 focus:ring-amber-500/20 text-stone-900 text-sm bg-[#faf6ed] focus:bg-white transition-all placeholder:text-stone-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* KHỐI 3: NGUỒN TÀI LIỆU HỌC THUẬT KIỂM CHỨNG */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 font-vietnam">
                                    Nguồn tài liệu học thuật kiểm chứng <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan, NXB Văn học"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-amber-300/80 focus:border-amber-600 focus:ring-4 focus:ring-amber-500/20 text-stone-900 text-sm bg-[#faf6ed] focus:bg-white transition-all placeholder:text-stone-400"
                                />
                                <p className="text-xs text-stone-500 font-vietnam">
                                    💡 Để đảm bảo tính liêm chính học thuật, mọi câu ca dao tục ngữ được xuất bản đều cần có nguồn tài liệu sách/công trình nghiên cứu uy tín.
                                </p>
                            </div>

                            {/* NÚT GỬI ĐÓNG GÓP HOÀNG GIA */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 px-6 rounded-2xl font-bold text-base text-[#fef3c7] bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#b45309] hover:from-[#b91c1c] hover:to-[#d97706] border border-amber-400/50 shadow-xl shadow-red-950/40 hover:shadow-red-950/60 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer font-heritage"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Đang gửi bài đóng góp tới Hội đồng...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Hiến Tặng Ngữ Liệu Vào Kho Tàng</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    /* TAB 2: DANH SÁCH BÀI ĐÓNG GÓP CỦA TÔI */
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-[#fffdf9]/95 p-4 rounded-2xl border border-amber-600/30 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Scroll className="w-5 h-5 text-amber-800" />
                                <h3 className="font-heritage text-lg font-bold text-stone-900">
                                    Nhật Ký Cống Hiến Di Sản
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={loadMySubmissions}
                                disabled={loadingMy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all cursor-pointer"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loadingMy ? 'animate-spin' : ''}`} />
                                <span>Làm mới</span>
                            </button>
                        </div>

                        {loadingMy ? (
                            <div className="py-20 text-center space-y-3">
                                <Loader2 className="w-8 h-8 animate-spin text-amber-800 mx-auto" />
                                <p className="text-sm text-stone-600 font-vietnam">Đang tải lịch sử đóng góp của bạn...</p>
                            </div>
                        ) : mySubmissions.length === 0 ? (
                            <div className="py-16 text-center bg-[#fffdf9]/95 rounded-3xl border-2 border-dashed border-amber-300 p-8 space-y-4">
                                <Feather className="w-12 h-12 text-amber-800/40 mx-auto" />
                                <h4 className="font-heritage text-xl font-bold text-stone-800">
                                    Chưa Có Bản Ghi Đóng Góp Nào
                                </h4>
                                <p className="text-sm text-stone-600 max-w-md mx-auto">
                                    Bạn chưa gửi bài đóng góp nào vào kho tàng. Hãy bắt đầu chia sẻ những câu ca dao, tích xưa đặc sắc của quê hương bạn!
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('new')}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#fef3c7] bg-gradient-to-r from-[#991b1b] to-[#b45309] shadow-md hover:scale-105 transition-all cursor-pointer"
                                >
                                    <Feather className="w-4 h-4" />
                                    <span>Gửi câu đầu tiên ngay</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {mySubmissions.map((sub) => (
                                    <div
                                        key={sub._id}
                                        className="bg-[#fffdf9]/98 rounded-2xl border border-amber-600/30 p-6 shadow-md hover:shadow-lg transition-all space-y-4 relative overflow-hidden"
                                    >
                                        <div className="h-1 w-full bg-gradient-to-r from-red-800 via-amber-500 to-red-800 absolute top-0 left-0"></div>

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                        {sub.category === 'ca-dao' ? 'Ca dao' : sub.category === 'tuc-ngu' ? 'Tục ngữ' : sub.category}
                                                    </span>
                                                    <span className="text-xs text-stone-500">
                                                        {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <h4 className="font-heritage text-lg font-bold text-stone-900">
                                                    {sub.title}
                                                </h4>
                                            </div>
                                            <div>
                                                {getStatusBadge(sub.status)}
                                            </div>
                                        </div>

                                        {/* Ý nghĩa tóm tắt */}
                                        <p className="text-sm text-stone-700 font-vietnam leading-relaxed italic bg-[#faf6ed] p-3 rounded-xl border border-amber-200/60">
                                            "{sub.meaning}"
                                        </p>

                                        {/* Nguồn */}
                                        <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                                            <div>
                                                <span className="font-bold text-amber-950">Nguồn:</span> {sub.source}
                                            </div>

                                            {sub.status === 'approved' && sub.publishedWorkId && (
                                                <Link
                                                    to={`/kham-pha`}
                                                    className="inline-flex items-center gap-1 font-bold text-red-800 hover:text-amber-800"
                                                >
                                                    <span>Xem trên kho tàng</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            )}
                                        </div>

                                        {/* Nhận xét của Admin nếu có */}
                                        {sub.adminNote && (
                                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
                                                <span className="font-bold text-amber-900">Nhận xét từ Ban Quản Trị:</span>
                                                <p>{sub.adminNote}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmitContent;
