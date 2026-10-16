import { useState, useEffect } from 'react';
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
    History 
} from 'lucide-react';
import submissionService from '../services/submission.service';

const SubmitContent = () => {
    const [activeTab, setActiveTab] = useState('new'); // 'new' | 'my'
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (!formData.title.trim() || formData.title.trim().length < 3) {
            setErrorMessage('Vui lòng nhập câu ca dao hoặc tục ngữ hợp lệ (tối thiểu 3 ký tự).');
            return;
        }

        if (!formData.meaning.trim() || formData.meaning.trim().length < 10) {
            setErrorMessage('Vui lòng giải thích ý nghĩa nội dung đóng góp (tối thiểu 10 ký tự).');
            return;
        }

        if (!formData.source.trim() || formData.source.trim().length < 5) {
            setErrorMessage('Vui lòng cung cấp nguồn tham khảo học thuật kiểm chứng (sách, tác giả, nhà xuất bản).');
            return;
        }

        setSubmitting(true);
        try {
            const res = await submissionService.createSubmission(formData);
            setSuccessMessage(res.message || 'Gửi đóng góp thành công! Nội dung đang chờ Ban Quản trị kiểm duyệt.');
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt & xuất bản
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                        <XCircle className="w-3.5 h-3.5" /> Từ chối
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5" /> Đang chờ duyệt
                    </span>
                );
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[75vh]">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-bold uppercase tracking-wider mb-2">
                    <BookOpen className="w-4 h-4" />
                    Đóng Góp Di Sản Văn Hóa Dân Gian
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heritage">
                    Góp Nhặt Hương Sắc Ca Dao & Tục Ngữ
                </h1>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                    Chung tay làm phong phú kho tàng tri thức dân tộc. Mọi nội dung đóng góp đều được thẩm định học thuật và kiểm duyệt trước khi chính thức xuất bản.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 mb-8">
                <button
                    type="button"
                    onClick={() => setActiveTab('new')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'new'
                            ? 'border-amber-600 text-amber-900 bg-amber-50/50 rounded-t-xl'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Send className="w-4 h-4" />
                    Gửi đóng góp mới
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('my')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'my'
                            ? 'border-amber-600 text-amber-900 bg-amber-50/50 rounded-t-xl'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    Đóng góp của tôi
                </button>
            </div>

            {activeTab === 'new' ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                    {successMessage && (
                        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm">Gửi thành công!</p>
                                <p className="text-xs text-emerald-800 mt-0.5">{successMessage}</p>
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm">Chưa thể gửi nội dung</p>
                                <p className="text-xs text-rose-800 mt-0.5">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title / Quote */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Câu Ca Dao / Tục Ngữ <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ví dụ: Ăn quả nhớ kẻ trồng cây"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 text-sm font-medium transition-all"
                            />
                        </div>

                        {/* Category & Topic */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Loại nội dung <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 text-sm font-medium transition-all bg-white"
                                >
                                    <option value="ca-dao">Ca dao Dân ca</option>
                                    <option value="tuc-ngu">Tục ngữ Việt Nam</option>
                                    <option value="co-tich">Truyện cổ tích</option>
                                    <option value="truyen-thuyet">Truyền thuyết</option>
                                    <option value="than-thoai">Thần thoại</option>
                                    <option value="khac">Khác</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Chủ đề / Bài học
                                </label>
                                <select
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 text-sm font-medium transition-all bg-white"
                                >
                                    <option value="Lòng biết ơn">Lòng biết ơn</option>
                                    <option value="Tình cảm gia đình">Tình cảm gia đình</option>
                                    <option value="Đoàn kết - Nhân ái">Đoàn kết - Nhân ái</option>
                                    <option value="Ý chí - Nghị lực">Ý chí - Nghị lực</option>
                                    <option value="Học tập - Tri thức">Học tập - Tri thức</option>
                                    <option value="Kinh nghiệm thời tiết - sản xuất">Kinh nghiệm thời tiết - sản xuất</option>
                                    <option value="Đạo đức & Lối sống">Đạo đức & Lối sống</option>
                                </select>
                            </div>
                        </div>

                        {/* Meaning Overview */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Ý nghĩa tổng quan / Tóm tắt <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                name="meaning"
                                rows="3"
                                value={formData.meaning}
                                onChange={handleChange}
                                placeholder="Tóm tắt ý nghĩa tổng thể mà câu ca dao / tục ngữ muốn gửi gắm..."
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 text-sm font-medium transition-all"
                            ></textarea>
                        </div>

                        {/* Literal and Figurative Meaning */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Nghĩa đen (Hình ảnh mộc mạc)
                                </label>
                                <textarea
                                    name="literalMeaning"
                                    rows="2"
                                    value={formData.literalMeaning}
                                    onChange={handleChange}
                                    placeholder="Giải thích nghĩa đen của các từ ngữ..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 text-sm font-medium transition-all"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Nghĩa bóng (Ý nghĩa ẩn dụ)
                                </label>
                                <textarea
                                    name="figurativeMeaning"
                                    rows="2"
                                    value={formData.figurativeMeaning}
                                    onChange={handleChange}
                                    placeholder="Giải thích tầng nghĩa ẩn dụ sâu xa..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 text-sm font-medium transition-all"
                                ></textarea>
                            </div>
                        </div>

                        {/* Lesson & Cultural context */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Bài học & Thông điệp giáo dục
                                </label>
                                <input
                                    type="text"
                                    name="lesson"
                                    value={formData.lesson}
                                    onChange={handleChange}
                                    placeholder="Lời răn dạy đối nhân xử thế cho thế hệ sau..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 text-sm font-medium transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Vùng miền phổ biến
                                </label>
                                <input
                                    type="text"
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Đồng bằng Bắc Bộ, Toàn quốc, Nam Bộ..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 text-sm font-medium transition-all"
                                />
                            </div>
                        </div>

                        {/* Source Citation - Mandatory */}
                        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-amber-700" />
                                Nguồn tham khảo học thuật kiểm chứng <span className="text-rose-500">*</span>
                            </label>
                            <p className="text-[11px] text-amber-800/80 mb-2">
                                Để đảm bảo tính trung thực học thuật của VietHeritage AI, vui lòng ghi rõ tên sách, tác giả hoặc nhà xuất bản. Tuyệt đối không bịa đặt nguồn.
                            </p>
                            <input
                                type="text"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                placeholder="Ví dụ: Từ điển Thành ngữ và Tục ngữ Việt Nam — GS. Nguyễn Lân, NXB Văn hóa Thông tin."
                                required
                                className="w-full px-4 py-3 rounded-xl border border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-slate-900 text-sm font-medium transition-all bg-white"
                            />
                        </div>

                        {/* Submit button */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang gửi bài...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Gửi nội dung để Ban Quản trị kiểm duyệt
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                /* My submissions tab */
                <div className="space-y-4">
                    {loadingMy ? (
                        <div className="py-24 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-3" />
                            <p className="text-sm text-slate-500 font-medium">Đang tải danh sách bài đã gửi...</p>
                        </div>
                    ) : mySubmissions.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-8">
                            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-slate-800 mb-1">
                                Bạn chưa gửi bài đóng góp nào
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Hãy chuyển sang tab "Gửi đóng góp mới" để chia sẻ những câu ca dao, tục ngữ tâm đắc!
                            </p>
                            <button
                                type="button"
                                onClick={() => setActiveTab('new')}
                                className="px-5 py-2 rounded-xl bg-amber-600 text-white font-semibold text-xs shadow-sm hover:bg-amber-700 transition-colors"
                            >
                                Gửi bài đầu tiên
                            </button>
                        </div>
                    ) : (
                        mySubmissions.map((sub) => (
                            <div
                                key={sub._id}
                                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="space-y-1.5 flex-grow">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                                            {sub.category === 'tuc-ngu' ? 'Tục ngữ' : 'Ca dao'}
                                        </span>
                                        <span className="text-xs text-slate-500">• Chủ đề: {sub.topic}</span>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 font-heritage">
                                        "{sub.title}"
                                    </h3>
                                    <p className="text-xs text-slate-600 line-clamp-2">
                                        {sub.meaning}
                                    </p>
                                    <p className="text-[11px] text-slate-400 italic">
                                        Nguồn kiểm chứng: {sub.source}
                                    </p>
                                    {sub.adminNote && (
                                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 mt-2">
                                            <strong>Ghi chú từ Quản trị viên:</strong> {sub.adminNote}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-shrink-0 self-start md:self-center flex flex-col items-end gap-1">
                                    {getStatusBadge(sub.status)}
                                    <span className="text-[11px] text-slate-400 mt-1">
                                        Gửi ngày: {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SubmitContent;
