import { useState, useEffect, useRef } from 'react';
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
    ArrowRight,
    FileText,
    Layers,
    BookMarked,
    Copy,
    Check,
    Volume2,
    VolumeX,
    Clock,
    ShieldAlert,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import literatureService from '../../services/literature.service';
import favoriteService from '../../services/favorite.service';
import PoemDisplay from './PoemDisplay';
import GuestQuotaModal from './GuestQuotaModal';
import SmartTextSelectionToolbar from './SmartTextSelectionToolbar';
import { useAiChat } from '../../context/AiChatContext';

const WorkDetailModal = ({ work, isOpen, onClose, onWorkSelect }) => {
    const { isAuthenticated } = useAuth();
    const { openAiChat } = useAiChat();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    
    // Tab đang kích hoạt: 'van-ban' | 'tang-nghia' | 'tro-ly-ai' | 'tat-ca'
    const [activeTab, setActiveTab] = useState('van-ban');
    const [prevTab, setPrevTab] = useState('van-ban');
    const [copied, setCopied] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const modalContentRef = useRef(null);

    const handleTabChange = (newTab) => {
        if (newTab !== 'tat-ca') {
            setPrevTab(newTab);
        }
        setActiveTab(newTab);
    };

    const handleToggleAllView = () => {
        if (activeTab === 'tat-ca') {
            setActiveTab(prevTab || 'van-ban');
        } else {
            setPrevTab(activeTab);
            setActiveTab('tat-ca');
        }
    };

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
            setActiveTab('van-ban');
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const fetchDetailAndState = async () => {
            setLoading(true);
            try {
                // Tải chi tiết tác phẩm từ backend
                const data = await literatureService.getWorkBySlug(work.slug || work._id);
                setDetail(data || work);
                setActiveTab('van-ban');

                // Kiểm tra trạng thái yêu thích nếu đã đăng nhập (UC12)
                if (isAuthenticated && (data?._id || work?._id)) {
                    const favorited = await favoriteService.checkFavorite(data?._id || work._id);
                    setIsFavorited(favorited);
                }

                // Gợi ý nội dung liên quan (UC11)
                const related = await literatureService.getRelated(data?.slug || work.slug || work._id, 3);
                setRelatedWorks(related || []);
            } catch (err) {
                console.error('Lỗi tải chi tiết tác phẩm:', err);
                setDetail(work);
                setActiveTab('van-ban');
            } finally {
                setLoading(false);
            }
        };

        fetchDetailAndState();

        return () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
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

    const handleCopyQuote = () => {
        const textToCopy = detail?.quote || detail?.title;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleToggleSpeech = () => {
        if (!('speechSynthesis' in window)) {
            alert('Trình duyệt của bạn không hỗ trợ tính năng đọc văn bản.');
            return;
        }
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const textToRead = detail?.quote || detail?.content || detail?.summary || '';
            const cleanText = textToRead.replace(/[/]/g, ' ');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'vi-VN';
            utterance.rate = 0.9;
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-amber-900/10 transition-all">
                
                {/* 1. Header Đậm Chất Di Sản */}
                <div className="px-5 sm:px-7 py-3.5 sm:py-4.5 border-b border-amber-100 flex items-center justify-between bg-gradient-to-r from-amber-50/90 via-amber-50/40 to-white">
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-600/20 flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-amber-100" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300/80">
                                    {current.categoryName || (current.category === 'tuc-ngu' ? 'Tục ngữ Việt Nam' : 'Ca dao Dân ca')}
                                </span>
                                {current.topic && (
                                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 hidden sm:inline-block">
                                        Chủ đề: {current.topic}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 mt-0.5 truncate tracking-tight font-heritage">
                                {current.title}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        {/* Audio Voiceover button */}
                        <button
                            type="button"
                            onClick={handleToggleSpeech}
                            className={`p-2.5 rounded-xl border transition-all ${isSpeaking
                                    ? 'bg-amber-500 border-amber-600 text-white animate-pulse'
                                    : 'bg-white hover:bg-amber-50 border-slate-200 text-slate-600'
                                }`}
                            title={isSpeaking ? 'Dừng đọc giọng AI' : 'Nghe giọng đọc ngâm câu thơ'}
                        >
                            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        {/* Copy quote button */}
                        <button
                            type="button"
                            onClick={handleCopyQuote}
                            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-all"
                            title="Sao chép trích đoạn"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {/* Favorite button (UC12) */}
                        <button
                            type="button"
                            onClick={handleToggleFavorite}
                            disabled={favoriteLoading}
                            className={`p-2.5 rounded-xl border transition-all ${isFavorited
                                    ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                                }`}
                            title={isFavorited ? 'Bỏ lưu yêu thích' : 'Lưu vào mục yêu thích'}
                        >
                            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
                        </button>

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                {/* 2. Navigation Tabs & Chế độ xem */}
                <div className="px-4 sm:px-7 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-xs flex items-center justify-between gap-2.5 py-2">
                    {/* Danh sách tab chính */}
                    <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth min-w-0 flex-1 py-0.5">
                        {/* Tab 1: 📜 VĂN BẢN & NGUYÊN TÁC */}
                        <button
                            type="button"
                            onClick={() => handleTabChange('van-ban')}
                            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all flex-shrink-0 whitespace-nowrap ${
                                activeTab === 'van-ban'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Văn bản & Nguyên tác</span>
                        </button>

                        {/* Tab 2: ✨ TẦNG NGHĨA & BỐI CẢNH */}
                        <button
                            type="button"
                            onClick={() => handleTabChange('tang-nghia')}
                            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all flex-shrink-0 whitespace-nowrap ${
                                activeTab === 'tang-nghia'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Tầng nghĩa & Bối cảnh</span>
                        </button>

                        {/* Tab 3: 🤖 TRỢ LÝ AI & LIÊN KẾT */}
                        <button
                            type="button"
                            onClick={() => handleTabChange('tro-ly-ai')}
                            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all flex-shrink-0 whitespace-nowrap ${
                                activeTab === 'tro-ly-ai'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Trợ lý AI & Liên kết</span>
                        </button>
                    </div>

                    {/* Right: Nút Xem Toàn Bộ / Phân Tab */}
                    <div className="flex items-center flex-shrink-0 pl-2 sm:pl-3 border-l border-slate-200">
                        <button
                            type="button"
                            onClick={handleToggleAllView}
                            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 whitespace-nowrap shadow-xs ${
                                activeTab === 'tat-ca'
                                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm shadow-amber-900/15 ring-2 ring-amber-500/25'
                                    : 'bg-white hover:bg-amber-50/80 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300'
                            }`}
                            title={activeTab === 'tat-ca' ? 'Quay lại xem theo từng tab riêng biệt' : 'Cuộn xem tất cả nội dung trên một trang'}
                        >
                            <Layers className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 ${
                                activeTab === 'tat-ca' ? 'text-white' : 'text-amber-600'
                            }`} />
                            <span className="hidden sm:inline">
                                {activeTab === 'tat-ca' ? 'Chế độ phân tab' : 'Xem toàn bộ'}
                            </span>
                            <span className="sm:hidden">
                                {activeTab === 'tat-ca' ? 'Phân tab' : 'Tất cả'}
                            </span>
                            {activeTab === 'tat-ca' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* 3. Body Content Đa Dạng */}
                <div ref={modalContentRef} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-grow custom-scrollbar relative">
                    {/* Smart Text Selection Floating Toolbar Engine */}
                    <SmartTextSelectionToolbar containerRef={modalContentRef} currentWork={current} />

                    {/* Banner hướng dẫn tương tác Smart Text Selection */}
                    <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-500/10 border border-amber-500/20 text-slate-700 text-xs shadow-sm">
                        <span className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 animate-pulse" />
                            <span>
                                <strong>Tính năng Thông Minh:</strong> Bôi đen bất kỳ từ hoặc câu thơ nào để tra cứu <strong>👤 Nhân vật</strong>, <strong>📍 Địa danh</strong>, <strong>📖 Giải nghĩa từ</strong> hoặc <strong>🤖 Hỏi AI</strong> tức thì!
                            </span>
                        </span>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-9 h-9 animate-spin mx-auto text-amber-600 mb-3" />
                            <p className="text-sm font-medium text-slate-600">Đang tra cứu tư liệu văn hóa học thuật chuẩn mực...</p>
                        </div>
                    ) : (
                        <>
                            {/* ============================================================== */}
                            {/* PHẦN 1: NGUYÊN TÁC & TOÀN VĂN (TAB: van-ban HOẶC tat-ca) */}
                            {/* ============================================================== */}
                            {(activeTab === 'van-ban' || activeTab === 'tat-ca') && (
                                <div className="space-y-5 animate-in fade-in duration-150">
                                    {/* Trích đoạn tiêu biểu */}
                                    {current.quote && (
                                        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-orange-50/30 border border-amber-200/90 relative shadow-sm">
                                            <Quote className="w-8 h-8 text-amber-300 absolute top-4 right-5 opacity-60" />
                                            <div className="pr-8">
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800/80 mb-2 flex items-center gap-1.5">
                                                    <BookMarked className="w-3.5 h-3.5 text-amber-700" />
                                                    Trích đoạn đắt giá / Điểm nhấn tác phẩm
                                                </div>
                                                <PoemDisplay text={current.quote} size="lg" />
                                            </div>

                                            {/* Metadata chips */}
                                            <div className="mt-4 pt-3.5 border-t border-amber-200/60 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-amber-900/90">
                                                {current.author && (
                                                    <span className="bg-amber-100/80 px-2.5 py-1 rounded-md">
                                                        Tác giả: <strong>{current.author}</strong>
                                                    </span>
                                                )}
                                                {current.region && (
                                                    <span className="flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-md border border-amber-200/60">
                                                        <MapPin className="w-3.5 h-3.5 text-amber-700" /> {current.region}
                                                    </span>
                                                )}
                                                {current.period && (
                                                    <span className="flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-md border border-amber-200/60">
                                                        <Calendar className="w-3.5 h-3.5 text-amber-700" /> {current.period}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Toàn văn tác phẩm / Văn bản / Đoạn trích mở rộng */}
                                    {current.content && (
                                        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200">
                                            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-amber-700" />
                                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                                        Toàn văn tác phẩm & Bản thẩm bình
                                                    </h3>
                                                </div>
                                                <span className="text-xs text-slate-500 font-medium">
                                                    {current.readTime || '5 phút đọc'}
                                                </span>
                                            </div>

                                            <div className="prose prose-slate max-w-none text-slate-800 font-heritage text-sm sm:text-base leading-relaxed whitespace-pre-line bg-white p-4 sm:p-5 rounded-xl border border-slate-200/70 shadow-inner">
                                                {current.content}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ============================================================== */}
                            {/* PHẦN 2: TẦNG NGHĨA & BỐI CẢNH (TAB: tang-nghia HOẶC tat-ca) */}
                            {/* ============================================================== */}
                            {(activeTab === 'tang-nghia' || activeTab === 'tat-ca') && (
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    {/* Ý nghĩa chi tiết: Nghĩa đen & Nghĩa bóng */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-all">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                Nghĩa đen (Hiển ngôn)
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed font-sans">
                                                {current.literalMeaning || current.summary}
                                            </p>
                                        </div>

                                        <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 hover:border-indigo-200 transition-all">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-800 mb-2.5">
                                                <Sparkles className="w-4 h-4 text-indigo-600" />
                                                Nghĩa bóng (Hàm ẩn)
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed font-sans">
                                                {current.figurativeMeaning || current.thematicMeaning}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Giá trị tư tưởng & Nghệ thuật cốt lõi (thematicMeaning) */}
                                    {current.thematicMeaning && (
                                        <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200/80">
                                            <div className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2 flex items-center gap-1.5">
                                                <Sparkles className="w-4 h-4 text-purple-600" />
                                                Giá trị tư tưởng & Nghệ thuật cốt lõi
                                            </div>
                                            <p className="text-sm text-purple-950 leading-relaxed font-sans font-medium">
                                                {current.thematicMeaning}
                                            </p>
                                        </div>
                                    )}

                                    {/* Bài học & Thông điệp nhân sinh */}
                                    {current.lesson && (
                                        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                Bài học nhân sinh & Giá trị đạo đức
                                            </div>
                                            <p className="text-sm text-emerald-950 font-medium leading-relaxed font-sans">
                                                {current.lesson}
                                            </p>
                                        </div>
                                    )}

                                    {/* Bối cảnh lịch sử & Văn hóa */}
                                    {current.historicalContext && (
                                        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/70">
                                            <div className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-amber-700" />
                                                Bối cảnh văn hóa & Lịch sử
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed font-sans">
                                                {current.historicalContext}
                                            </p>
                                        </div>
                                    )}

                                    {/* Địa phương liên quan và loại quan hệ địa lý (MAP05) */}
                                    {((current.locationRelations && current.locationRelations.length > 0) || (current.locationIds && current.locationIds.length > 0)) && (
                                        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2.5">
                                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                                                <MapPin className="w-4 h-4 text-amber-600" />
                                                Địa phương liên quan & Không gian văn hóa
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {(current.locationRelations && current.locationRelations.length > 0
                                                    ? current.locationRelations
                                                    : (current.locationIds || []).map((loc) => ({ locationId: loc, relationType: 'unknown', notes: '' }))
                                                ).map((rel, idx) => {
                                                    const locName = rel.locationId?.name || rel.name || (typeof rel.locationId === 'string' ? rel.locationId : 'Địa phương');
                                                    const relType = rel.relationType || 'unknown';
                                                    const badgeConfig = {
                                                        origin: { label: 'Nơi khởi nguồn', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                                                        associated: { label: 'Gắn liền địa danh', color: 'bg-amber-100 text-amber-900 border-amber-300' },
                                                        circulation: { label: 'Vùng lưu truyền', color: 'bg-blue-100 text-blue-900 border-blue-300' },
                                                        unknown: { label: 'Chưa rõ', color: 'bg-slate-100 text-slate-800 border-slate-300' },
                                                    }[relType] || { label: 'Liên quan', color: 'bg-slate-100 text-slate-800 border-slate-300' };

                                                    return (
                                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2.5 rounded-xl bg-white border border-amber-200/50 text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-900">{locName}</span>
                                                                <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${badgeConfig.color}`}>
                                                                    {badgeConfig.label}
                                                                </span>
                                                            </div>
                                                            {rel.notes && (
                                                                <span className="text-slate-500 text-[11px] italic">
                                                                    {rel.notes}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nguồn tham khảo học thuật kiểm chứng */}
                                    <div className="p-4 rounded-2xl bg-slate-100/90 border border-slate-200 flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-xs">
                                            <p className="font-bold text-slate-800 uppercase tracking-wide">
                                                Nguồn tham khảo học thuật kiểm chứng
                                            </p>
                                            <p className="text-slate-600 mt-1 font-heritage text-sm italic">
                                                {current.source || 'Kho tàng Văn học Dân gian Việt Nam — GS. Vũ Ngọc Phan, NXB Văn học.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Hệ thống Tags Ontology */}
                                    {current.tags && current.tags.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 pt-2">
                                            <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
                                            {current.tags.map((tg, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80 font-medium"
                                                >
                                                    #{tg}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ============================================================== */}
                            {/* PHẦN 3: TRỢ LÝ AI & LIÊN HỆ (TAB: tro-ly-ai HOẶC tat-ca)        */}
                            {/* ============================================================== */}
                            {(activeTab === 'tro-ly-ai' || activeTab === 'tat-ca') && (
                                <div className="space-y-6 animate-in fade-in duration-150">
                                    {/* Khối AI Giải thích chi tiết (UC10) */}
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/30 to-amber-50/30 border border-indigo-200/80">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center justify-center">
                                                    <Sparkles className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900">
                                                        Yêu cầu Trợ lý AI Phân tích Chuyên sâu (4 Tầng nghĩa)
                                                    </h3>
                                                    <p className="text-xs text-slate-500">
                                                        Phân tích tự động nghĩa đen, nghĩa bóng, bối cảnh văn hóa và bài học nhân sinh
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleRequestAiExplain}
                                                disabled={aiLoading}
                                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0"
                                            >
                                                {aiLoading ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        <span>AI đang đối chiếu dữ liệu...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        <span>{aiExplanation ? 'Phân tích lại' : 'Yêu cầu AI Phân Tích'}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Kết quả phân tích AI */}
                                        {aiExplanation && (
                                            <div className="mt-4 p-4 rounded-xl bg-white/80 border border-indigo-100 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2 whitespace-pre-line font-sans shadow-sm animate-in fade-in">
                                                {aiExplanation}
                                                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span>Phân tích được kiểm chứng dựa trên nguồn học thuật chính thức</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Gợi ý nội dung liên quan (UC11) */}
                                    {relatedWorks && relatedWorks.length > 0 && (
                                        <div className="border-t border-slate-200 pt-5">
                                            <div className="flex items-center gap-2 mb-3.5">
                                                <Compass className="w-4 h-4 text-amber-700" />
                                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                                    Mạng lưới tác phẩm văn hóa liên quan
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {relatedWorks.map((rel) => (
                                                    <div
                                                        key={rel._id || rel.slug}
                                                        onClick={() => {
                                                            if (onWorkSelect) onWorkSelect(rel);
                                                            else setDetail(rel);
                                                            setActiveTab('van-ban');
                                                        }}
                                                        className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 cursor-pointer transition-all group bg-white shadow-sm hover:shadow"
                                                    >
                                                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                                                            {rel.categoryName || rel.category}
                                                        </span>
                                                        <h4 className="text-xs font-bold text-slate-800 mt-2 group-hover:text-amber-800 line-clamp-1 font-heritage">
                                                            {rel.title}
                                                        </h4>
                                                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                                                            {rel.summary || rel.literalMeaning}
                                                        </p>
                                                        <div className="mt-2.5 flex items-center text-[11px] font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">
                                                            Khám phá <ArrowRight className="w-3 h-3 ml-1" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 4. Footer Tinh Gọn */}
                <div className="px-5 sm:px-7 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="text-xs text-slate-500 font-medium">
                        {current.viewsCount ? `${current.viewsCount.toLocaleString()} lượt xem` : ''} 
                        {current.likesCount ? ` • ${current.likesCount.toLocaleString()} yêu thích` : ''}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-xs sm:text-sm font-bold rounded-xl bg-slate-800 hover:bg-slate-900 text-white transition-all shadow-sm"
                        >
                            Đóng
                        </button>
                    </div>
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
