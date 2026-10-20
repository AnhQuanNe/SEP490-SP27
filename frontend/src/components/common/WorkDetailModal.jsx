import { useState, useEffect } from 'react';
import {
    X,
    BookOpen,
    Sparkles,
    Heart,
    ExternalLink,
    Quote,
    MapPin,
    Calendar,
    Tag,
    Compass,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import literatureService from '../../services/literature.service';
import favoriteService from '../../services/favorite.service';
import PoemDisplay from './PoemDisplay';
import GuestQuotaModal from './GuestQuotaModal';

const WorkDetailModal = ({ work, isOpen, onClose, onWorkSelect }) => {
    const { isAuthenticated } = useAuth();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [showQuotaModal, setShowQuotaModal] = useState(false);

    // AI Explanation state (UC10)
    const [aiExplanation, setAiExplanation] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Related works (UC11)
    const [relatedWorks, setRelatedWorks] = useState([]);

    useEffect(() => {
        if (!isOpen || !work) {
            setDetail(null);
            setAiExplanation(null);
            setRelatedWorks([]);
            return;
        }

        const fetchDetailAndState = async () => {
            setLoading(true);
            try {
                // Tải chi tiết tác phẩm
                const data = await literatureService.getWorkBySlug(work.slug || work._id);
                setDetail(data || work);

                // Kiểm tra trạng thái yêu thích nếu đã đăng nhập (UC12)
                if (isAuthenticated && data?._id) {
                    const favorited = await favoriteService.checkFavorite(data._id);
                    setIsFavorited(favorited);
                }

                // Gợi ý nội dung liên quan (UC11)
                const related = await literatureService.getRelated(data?.slug || work.slug || work._id, 3);
                setRelatedWorks(related || []);
            } catch (err) {
                console.error('Lỗi tải chi tiết tác phẩm:', err);
                setDetail(work);
            } finally {
                setLoading(false);
            }
        };

        fetchDetailAndState();
    }, [isOpen, work, isAuthenticated]);

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để lưu tác phẩm vào danh sách yêu thích!');
            return;
        }
        if (!detail?._id) return;

        setFavoriteLoading(true);
        try {
            const res = await favoriteService.toggleFavorite(detail._id);
            setIsFavorited(res.isFavorited);
            if (detail) {
                setDetail({
                    ...detail,
                    likesCount: res.isFavorited ? (detail.likesCount || 0) + 1 : Math.max(0, (detail.likesCount || 1) - 1),
                });
            }
        } catch (err) {
            console.error('Lỗi toggle favorite:', err);
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleRequestAiExplain = async () => {
        if (!detail) return;
        setAiLoading(true);
        try {
            const res = await literatureService.explainWork({
                workId: detail._id,
                slug: detail.slug,
            });
            setAiExplanation(res.explanation);
        } catch (err) {
            console.error('Lỗi yêu cầu AI giải thích:', err);
            if (err.code === 'GUEST_QUOTA_EXCEEDED' || err.status === 429) {
                setShowQuotaModal(true);
                setAiExplanation('⚠️ Bạn đã sử dụng hết 5 lượt trải nghiệm AI miễn phí hôm nay. Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục!');
            } else {
                setAiExplanation('Rất tiếc, hiện tại không thể phân tích nội dung này. Vui lòng thử lại sau.');
            }
        } finally {
            setAiLoading(false);
        }
    };

    if (!isOpen || !work) return null;

    const current = detail || work;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/80 via-white to-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                                    {current.categoryName || (current.category === 'tuc-ngu' ? 'Tục ngữ Việt Nam' : 'Ca dao Dân ca')}
                                </span>
                                {current.topic && (
                                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        Chủ đề: {current.topic}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mt-1 line-clamp-1">
                                {current.title}
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Favorite button (UC12) */}
                        <button
                            type="button"
                            onClick={handleToggleFavorite}
                            disabled={favoriteLoading}
                            className={`p-2.5 rounded-xl border transition-all ${isFavorited
                                    ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                                }`}
                            title={isFavorited ? 'Bỏ lưu yêu thích' : 'Lưu vào mục yêu thích'}
                        >
                            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                    {loading ? (
                        <div className="py-16 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-2" />
                            <p className="text-sm text-slate-500">Đang tra cứu tư liệu văn hóa học thuật...</p>
                        </div>
                    ) : (
                        <>
                            {/* Câu nguyên văn nổi bật */}
                            {current.quote && (
                                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 relative">
                                    <Quote className="w-7 h-7 text-amber-300 absolute top-3 right-4 opacity-70" />
                                    <div className="pr-8">
                                        <PoemDisplay text={current.quote} size="lg" />
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-amber-800/80">
                                        {current.author && (
                                            <span>Tác giả: <strong>{current.author}</strong></span>
                                        )}
                                        {current.region && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" /> {current.region}
                                            </span>
                                        )}
                                        {current.period && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" /> {current.period}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Ý nghĩa chi tiết (Nghĩa đen & Nghĩa bóng - UC08) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        Nghĩa đen (Hiển ngôn)
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {current.literalMeaning || current.summary || 'Hình ảnh gắn liền với đời sống sinh hoạt, sản xuất mộc mạc của người xưa.'}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
                                        <Sparkles className="w-4 h-4 text-indigo-600" />
                                        Nghĩa bóng (Hàm ẩn)
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {current.figurativeMeaning || current.thematicMeaning || 'Gửi gắm triết lý sống, tư tưởng đạo đức và phẩm chất tốt đẹp của người Việt.'}
                                    </p>
                                </div>
                            </div>

                            {/* Bài học & Thông điệp giáo dục */}
                            {current.lesson && (
                                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        Bài học & Thông điệp nhân sinh
                                    </div>
                                    <p className="text-sm text-emerald-950 font-medium leading-relaxed">
                                        {current.lesson}
                                    </p>
                                </div>
                            )}

                            {/* Bối cảnh lịch sử & văn hóa */}
                            {current.historicalContext && (
                                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100">
                                    <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1.5">
                                        Bối cảnh văn hóa & Lịch sử
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {current.historicalContext}
                                    </p>
                                </div>
                            )}

                            {/* Nguồn tham khảo kiểm chứng học thuật (Bắt buộc) */}
                            <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200/80 flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <p className="font-bold text-slate-800 uppercase tracking-wide">
                                        Nguồn tham khảo học thuật kiểm chứng
                                    </p>
                                    <p className="text-slate-600 mt-1 font-heritage text-sm italic">
                                        {current.source || 'Kho tàng Ca dao Dân ca người Việt — GS. Vũ Ngọc Phan, NXB Văn học.'}
                                    </p>
                                </div>
                            </div>

                            {/* Khối AI Giải thích chi tiết (UC10) */}
                            <div className="border-t border-slate-200 pt-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">
                                                Trợ lý AI Phân tích chi tiết
                                            </h3>
                                            <p className="text-[11px] text-slate-500">
                                                Phân tích tầng nghĩa sâu, dẫn chứng học thuật và ứng dụng đời sống
                                            </p>
                                        </div>
                                    </div>
                                    {!aiExplanation && (
                                        <button
                                            type="button"
                                            onClick={handleRequestAiExplain}
                                            disabled={aiLoading}
                                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            {aiLoading ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    Đang phân tích...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                                                    Yêu cầu AI phân tích
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {aiExplanation && (
                                    <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50/60 to-slate-50 border border-indigo-100/80 animate-in fade-in duration-200">
                                        <div className="prose prose-sm max-w-none text-slate-800 space-y-2 whitespace-pre-line text-sm leading-relaxed">
                                            {aiExplanation}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-indigo-100/60 flex items-center justify-between text-xs text-indigo-700">
                                            <span className="flex items-center gap-1">
                                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                                Được kiểm chứng theo dữ liệu tác phẩm VietHeritage AI
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleRequestAiExplain}
                                                disabled={aiLoading}
                                                className="hover:underline font-semibold"
                                            >
                                                Phân tích lại
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Gợi ý nội dung liên quan (UC11) */}
                            {relatedWorks && relatedWorks.length > 0 && (
                                <div className="border-t border-slate-200 pt-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Compass className="w-4 h-4 text-amber-700" />
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Nội dung văn hóa liên quan
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {relatedWorks.map((rel) => (
                                            <div
                                                key={rel._id || rel.slug}
                                                onClick={() => {
                                                    if (onWorkSelect) onWorkSelect(rel);
                                                    else setDetail(rel);
                                                }}
                                                className="p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 cursor-pointer transition-all group"
                                            >
                                                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                                                    {rel.categoryName || rel.category}
                                                </span>
                                                <h4 className="text-xs font-bold text-slate-800 mt-1 group-hover:text-amber-800 line-clamp-1">
                                                    {rel.title}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                                                    {rel.summary || rel.literalMeaning}
                                                </p>
                                                <div className="mt-2 flex items-center text-[10px] font-semibold text-amber-700 group-hover:translate-x-0.5 transition-transform">
                                                    Xem chi tiết <ArrowRight className="w-3 h-3 ml-1" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        {current.viewsCount ? `${current.viewsCount} lượt xem` : ''} • {current.likesCount ? `${current.likesCount} yêu thích` : ''}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>

            {/* Modal thông báo hết quota giải thích AI cho Guest */}
            <GuestQuotaModal
                isOpen={showQuotaModal}
                onClose={() => setShowQuotaModal(false)}
                title="Hết Lượt Yêu Cầu AI Giải Thích"
                message="Bạn đã dùng hết 5 lượt trải nghiệm phân tích AI miễn phí hôm nay. Hãy đăng ký hoặc đăng nhập tài khoản để tiếp tục nhận phân tích chuyên sâu không giới hạn!"
            />
        </div>
    );
};

export default WorkDetailModal;
