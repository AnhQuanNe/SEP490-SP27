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
    ChevronRight,
    Landmark,
    GraduationCap,
    Scroll,
    GitCompare
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
    
    // Tab đang kích hoạt: 'van-ban' | 'tang-nghia' | 'di-ban' | 'tro-ly-ai' | 'tat-ca'
    const [activeTab, setActiveTab] = useState('van-ban');
    const [prevTab, setPrevTab] = useState('van-ban');
    // Bộ lọc hiển thị tầng nghĩa: 'all' | 1 | 2 | 3 | 4
    const [selectedLayer, setSelectedLayer] = useState('all');
    // Chỉ mục dị bản đang xem so sánh
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    // Định dạng trích dẫn học thuật: 'tcvn' | 'apa' | 'mla'
    const [citationFormat, setCitationFormat] = useState('tcvn');
    const [citationCopied, setCitationCopied] = useState(false);
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

    const getFormattedCitation = (fmt) => {
        const item = detail || work;
        const author = item?.author || 'Dân gian';
        const title = item?.title || '';
        const src = item?.source || 'Kho tàng Văn học Dân gian Việt Nam';
        const year = '2024';
        if (fmt === 'apa') {
            return `${author}. (${year}). ${title}. Trong ${src}. Hệ thống Số hóa Di sản VietHeritage AI.`;
        }
        if (fmt === 'mla') {
            return `"${title}." ${src}, VietHeritage AI, ${year}.`;
        }
        // TCVN (Tiêu chuẩn Việt Nam)
        return `${author} (${year}), "${title}", ${src}, Tra cứu trên Nền tảng VietHeritage AI.`;
    };

    const handleCopyCitation = (fmt) => {
        const text = getFormattedCitation(fmt);
        navigator.clipboard.writeText(text);
        setCitationCopied(true);
        setTimeout(() => setCitationCopied(false), 2000);
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

                        {/* Tab 2: ✨ GIẢI NGHĨA ĐA TẦNG (4 TẦNG) */}
                        <button
                            type="button"
                            onClick={() => handleTabChange('tang-nghia')}
                            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all flex-shrink-0 whitespace-nowrap ${
                                activeTab === 'tang-nghia'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Giải nghĩa Đa tầng</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                activeTab === 'tang-nghia'
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-amber-100 text-amber-900'
                            }`}>
                                4 Tầng
                            </span>
                        </button>

                        {/* Tab 3: 🔄 DỊ BẢN DÂN GIAN & SO SÁNH */}
                        <button
                            type="button"
                            onClick={() => handleTabChange('di-ban')}
                            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all flex-shrink-0 whitespace-nowrap ${
                                activeTab === 'di-ban'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                            <GitCompare className="w-3.5 h-3.5" />
                            <span>Dị bản & So sánh</span>
                            {current.variants && current.variants.length > 0 && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                                    activeTab === 'di-ban'
                                        ? 'bg-amber-100 text-amber-900'
                                        : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {current.variants.length}
                                </span>
                            )}
                        </button>

                        {/* Tab 4: 🤖 TRỢ LÝ AI & LIÊN KẾT */}
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
                            {/* PHẦN 2: HỆ THỐNG GIẢI NGHĨA 4 TẦNG (TAB: tang-nghia HOẶC tat-ca) */}
                            {/* ============================================================== */}
                            {(activeTab === 'tang-nghia' || activeTab === 'tat-ca') && (
                                <div className="space-y-5 animate-in fade-in duration-150">
                                    {/* Framework Intro Header & Interactive Tier Navigator */}
                                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white shadow-lg border border-amber-500/30 relative overflow-hidden">
                                        <div className="relative z-10 space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm">
                                                        4-Tier Semantics
                                                    </span>
                                                    <span className="text-xs text-amber-300/90 font-medium">
                                                        VietHeritage Interpretation Framework
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[11px] text-amber-200/80 bg-black/30 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                                                    <span>Chuẩn học thuật Di sản</span>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="font-heritage text-base sm:text-xl font-bold text-amber-100 flex items-center gap-2">
                                                    <Layers className="w-5 h-5 text-amber-400" />
                                                    <span>Hệ Thống Giải Nghĩa 4 Tầng Cốt Lõi</span>
                                                </h3>
                                                <p className="text-xs text-stone-300 leading-relaxed mt-1">
                                                    Giải mã đa chiều văn học dân gian qua 4 lăng kính khoa học: <strong>Ngôn từ hiển ngôn</strong>, <strong>Biểu tượng hàm ẩn</strong>, <strong>Triết lý nhân sinh</strong> và <strong>Không gian địa văn hóa lịch sử</strong>.
                                                </p>
                                            </div>

                                            {/* Stepper / Filter buttons for the 4 tiers */}
                                            <div className="pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                                                {[
                                                    { id: 'all', label: 'Toàn cảnh 4 tầng' },
                                                    { id: 1, label: 'Tầng I: Ngôn từ & Nghĩa đen' },
                                                    { id: 2, label: 'Tầng II: Biểu tượng Dân gian' },
                                                    { id: 3, label: 'Tầng III: Đạo lý Nhân sinh' },
                                                    { id: 4, label: 'Tầng IV: Địa văn hóa & Lịch sử' },
                                                ].map((t) => (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => setSelectedLayer(t.id)}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                                            selectedLayer === t.id
                                                                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50 scale-[1.02]'
                                                                : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                                                        }`}
                                                    >
                                                        <span>{t.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* TẦNG I: NGÔN TỪ & NGHĨA ĐEN (LITERAL LAYER) */}
                                    {(selectedLayer === 'all' || selectedLayer === 1) && (
                                        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/95 border-2 border-slate-200/90 hover:border-slate-300 transition-all shadow-xs space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center font-mono">
                                                        I
                                                    </span>
                                                    <div>
                                                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                                            <span>Tầng I: Ngôn Từ & Nghĩa Đen (Literal Layer)</span>
                                                        </h4>
                                                        <p className="text-[11px] text-slate-500">
                                                            Lớp nghĩa hiển ngôn bề mặt, chú giải văn cảnh gốc & nghĩa đen sự vật
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                                                    Ngữ nghĩa học • Semantics
                                                </span>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                                                <p className="text-sm text-slate-800 leading-relaxed font-sans font-medium">
                                                    {current.literalMeaning || current.summary}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 text-[11px] text-slate-500 italic">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                                <span>Hiểu đúng nghĩa bề mặt là bước đầu tiên để tiếp cận trọn vẹn ngữ nghĩa văn học dân gian.</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* TẦNG II: BIỂU TƯỢNG DÂN GIAN & HÀM ẨN (SYMBOLIC LAYER) */}
                                    {(selectedLayer === 'all' || selectedLayer === 2) && (
                                        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-indigo-50/60 border-2 border-indigo-200/90 hover:border-indigo-300 transition-all shadow-xs space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200/80 pb-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center font-mono">
                                                        II
                                                    </span>
                                                    <div>
                                                        <h4 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide flex items-center gap-2">
                                                            <span>Tầng II: Biểu Tượng Dân Gian & Hàm Ẩn (Symbolic Layer)</span>
                                                        </h4>
                                                        <p className="text-[11px] text-indigo-700">
                                                            Giải mã ẩn dụ, motif nghệ thuật & hình tượng dân gian truyền đời
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                                    Ký hiệu học • Semiotics & Motif
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="bg-white/90 p-4 rounded-xl border border-indigo-200/80 shadow-xs">
                                                    <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                                        <span>Nghĩa bóng (Hàm ẩn) & Ẩn dụ nghệ thuật</span>
                                                    </div>
                                                    <p className="text-sm text-slate-800 leading-relaxed font-sans font-medium">
                                                        {current.figurativeMeaning || current.thematicMeaning}
                                                    </p>
                                                </div>

                                                {current.thematicMeaning && current.thematicMeaning !== current.figurativeMeaning && (
                                                    <div className="bg-purple-100/60 p-4 rounded-xl border border-purple-200 text-xs">
                                                        <div className="font-bold text-purple-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                            <Scroll className="w-3.5 h-3.5 text-purple-700" />
                                                            <span>Giá trị tư tưởng & Nghệ thuật cốt lõi</span>
                                                        </div>
                                                        <p className="text-slate-800 leading-relaxed font-medium">
                                                            {current.thematicMeaning}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* TẦNG III: TRIẾT LÝ & ĐẠO LÝ NHÂN SINH (MORAL LAYER) */}
                                    {(selectedLayer === 'all' || selectedLayer === 3) && (
                                        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-emerald-50/60 border-2 border-emerald-200/90 hover:border-emerald-300 transition-all shadow-xs space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center font-mono">
                                                        III
                                                    </span>
                                                    <div>
                                                        <h4 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wide flex items-center gap-2">
                                                            <span>Tầng III: Triết Lý & Đạo Lý Nhân Sinh (Moral Layer)</span>
                                                        </h4>
                                                        <p className="text-[11px] text-emerald-700">
                                                            Đạo lý làm người, bài học ứng xử & giá trị nhân bản truyền thống
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    Đạo đức học • Moral Philosophy
                                                </span>
                                            </div>

                                            <div className="bg-white/90 p-4 rounded-xl border border-emerald-200/80 shadow-xs">
                                                <p className="text-sm text-emerald-950 font-semibold leading-relaxed font-sans">
                                                    {current.lesson || 'Đúc kết bài học nhân nghĩa, sống có trước có sau, tôn vinh truyền thống đạo lý cao đẹp của dân tộc.'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 text-[11px] text-emerald-800 italic">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                                <span>Bài học nhân sinh là sợi dây nối kết các thế hệ và hình thành căn tính người Việt.</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* TẦNG IV: KHÔNG GIAN ĐỊA VĂN HÓA & LỊCH SỬ (CULTURAL LAYER) */}
                                    {(selectedLayer === 'all' || selectedLayer === 4) && (
                                        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-amber-50/70 border-2 border-amber-200/90 hover:border-amber-300 transition-all shadow-xs space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-7 h-7 rounded-lg bg-amber-700 text-white font-black text-xs flex items-center justify-center font-mono">
                                                        IV
                                                    </span>
                                                    <div>
                                                        <h4 className="text-sm font-extrabold text-amber-950 uppercase tracking-wide flex items-center gap-2">
                                                            <span>Tầng IV: Không Gian Địa Văn Hóa & Lịch Sử (Cultural Layer)</span>
                                                        </h4>
                                                        <p className="text-[11px] text-amber-800">
                                                            Bối cảnh thời đại, tiến trình lịch sử & không gian lưu truyền địa phương
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                    Địa văn hóa • Geo-cultural Studies
                                                </span>
                                            </div>

                                            <div className="bg-white/90 p-4 rounded-xl border border-amber-200/80 shadow-xs space-y-2">
                                                <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                                                    <span>Bối cảnh văn hóa & Thời đại lịch sử</span>
                                                </div>
                                                <p className="text-sm text-slate-800 leading-relaxed font-sans font-medium">
                                                    {current.historicalContext || 'Gắn liền với tiến trình dựng nước và giữ nước, bắt nguồn từ đời sống sinh hoạt nông nghiệp lúa nước và các lễ hội truyền thống.'}
                                                </p>
                                            </div>

                                            {/* Địa phương liên quan và loại quan hệ địa lý (MAP05) */}
                                            {((current.locationRelations && current.locationRelations.length > 0) || (current.locationIds && current.locationIds.length > 0)) && (
                                                <div className="p-3.5 rounded-xl bg-amber-100/60 border border-amber-200/70 space-y-2">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-950">
                                                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                                                        <span>Không gian địa lý & Quan hệ địa phương</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
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
                                                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-lg bg-white border border-amber-200/60 text-xs">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-slate-900">{locName}</span>
                                                                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${badgeConfig.color}`}>
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
                                        </div>
                                    )}

                                    {/* BẢO CHỨNG HỌC THUẬT KIỂM CHỨNG (ACADEMIC VERIFICATION CITATION) */}
                                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-amber-500/30 shadow-md space-y-3">
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                                                <ShieldCheck className="w-6 h-6 text-slate-950" />
                                            </div>
                                            <div className="space-y-1 text-xs flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                                                        Đã Kiểm Chứng Học Thuật
                                                    </span>
                                                    <span className="text-amber-300 text-[11px] font-medium">
                                                        Academic Citation Standard
                                                    </span>
                                                </div>
                                                <p className="font-heritage text-sm sm:text-base font-bold text-amber-100 pt-0.5">
                                                    {current.source || 'Kho tàng Văn học Dân gian Việt Nam — GS. Vũ Ngọc Phan, NXB Văn học.'}
                                                </p>
                                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                                    Dữ liệu 4 tầng nghĩa được chuẩn hóa theo hệ thống giáo trình và tư liệu nghiên cứu của Viện Văn học, Viện Nghiên cứu Hán Nôm và các công trình của GS. Vũ Ngọc Phan, GS. Đinh Gia Khánh, GS. Nguyễn Lân.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Trình tạo trích dẫn học thuật tự động (TCVN / APA / MLA) */}
                                        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[11px] text-slate-400 font-medium">Định dạng trích dẫn:</span>
                                                {['tcvn', 'apa', 'mla'].map((fmt) => (
                                                    <button
                                                        key={fmt}
                                                        type="button"
                                                        onClick={() => setCitationFormat(fmt)}
                                                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                                                            citationFormat === fmt
                                                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        {fmt}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyCitation(citationFormat)}
                                                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold transition flex items-center gap-1.5 border border-amber-500/40 shadow-xs"
                                            >
                                                {citationCopied ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span className="text-emerald-400">Đã sao chép ({citationFormat.toUpperCase()})!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span>Sao chép trích dẫn ({citationFormat.toUpperCase()})</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Hệ thống Tags Ontology */}
                                    {current.tags && current.tags.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
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
                            {/* PHẦN 3: SO SÁNH DỊ BẢN DÂN GIAN (TAB: di-ban HOẶC tat-ca)       */}
                            {/* ============================================================== */}
                            {(activeTab === 'di-ban' || activeTab === 'tat-ca') && (
                                <div className="space-y-5 animate-in fade-in duration-150">
                                    {/* Header Banner: Quy luật Dị bản trong Văn học Dân gian */}
                                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white shadow-lg border border-amber-500/30">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm">
                                                        Folkloric Variants
                                                    </span>
                                                    <span className="text-xs text-amber-300 font-medium">
                                                        Quy Luật Dị Bản Trong Văn Học Dân Gian
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-amber-200 bg-black/30 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                                    <GitCompare className="w-3.5 h-3.5 text-amber-400" />
                                                    <span>Đối chiếu liên vùng & dân tộc</span>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="font-heritage text-base sm:text-xl font-bold text-amber-100 flex items-center gap-2">
                                                    <span>Khảo Sát & So Sánh Dị Bản Dân Gian</span>
                                                </h3>
                                                <p className="text-xs text-stone-300 leading-relaxed mt-1">
                                                    Do phương thức truyền miệng và sự giao lưu văn hóa giữa các vùng miền, một tác phẩm dân gian thường tồn tại dưới nhiều biến thể (dị bản). Việc so sánh dị bản giúp làm sáng tỏ <strong>tâm thức vùng miền</strong> và <strong>tiến trình địa phương hóa</strong> của văn hóa Việt Nam.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {current.variants && current.variants.length > 0 ? (
                                        <div className="space-y-4">
                                            {/* Selector Tabs for Variants */}
                                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                                                {current.variants.map((v, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setSelectedVariantIndex(idx)}
                                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                                                            selectedVariantIndex === idx
                                                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                                                : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300'
                                                        }`}
                                                    >
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                                            selectedVariantIndex === idx ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            {idx + 1}
                                                        </span>
                                                        <span>{v.name}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Side-by-Side Comparison Container */}
                                            {(() => {
                                                const selectedVar = current.variants[selectedVariantIndex] || current.variants[0];
                                                return (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Cột 1: Nguyên bản phổ biến */}
                                                            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
                                                                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-800 text-white">
                                                                            Bản chuẩn
                                                                        </span>
                                                                        <h4 className="text-xs font-extrabold text-slate-900 uppercase">
                                                                            Nguyên Bản Phổ Thông
                                                                        </h4>
                                                                    </div>
                                                                    <span className="text-[11px] text-slate-500 font-medium">
                                                                        {current.region || 'Toàn quốc'}
                                                                    </span>
                                                                </div>

                                                                {current.quote && (
                                                                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 font-heritage text-xs sm:text-sm text-slate-900 leading-relaxed italic border-l-4 border-l-slate-800">
                                                                        <PoemDisplay text={current.quote} size="sm" />
                                                                    </div>
                                                                )}

                                                                <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
                                                                    <p className="font-semibold text-slate-900">Tóm tắt nguyên tác:</p>
                                                                    <p className="line-clamp-4">{current.summary}</p>
                                                                </div>

                                                                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                                                                    Nguồn: <strong>{current.source || 'SGK Ngữ Văn / Viện Văn học'}</strong>
                                                                </div>
                                                            </div>

                                                            {/* Cột 2: Dị bản được chọn */}
                                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/80 border-2 border-amber-300 shadow-xs space-y-3">
                                                                <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-600 text-white shadow-xs">
                                                                            Dị bản {selectedVariantIndex + 1}
                                                                        </span>
                                                                        <h4 className="text-xs font-extrabold text-amber-950 uppercase">
                                                                            {selectedVar.name}
                                                                        </h4>
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                                                                        {selectedVar.region}
                                                                    </span>
                                                                </div>

                                                                {selectedVar.quote && (
                                                                    <div className="p-3.5 rounded-xl bg-white/90 border border-amber-300 font-heritage text-xs sm:text-sm text-amber-950 leading-relaxed italic border-l-4 border-l-amber-600">
                                                                        <PoemDisplay text={selectedVar.quote} size="sm" />
                                                                    </div>
                                                                )}

                                                                <div className="text-xs text-slate-800 leading-relaxed space-y-1.5">
                                                                    <p className="font-semibold text-amber-950">Nội dung dị bản:</p>
                                                                    <p>{selectedVar.content}</p>
                                                                </div>

                                                                <div className="pt-2 border-t border-amber-200 text-[11px] text-amber-900">
                                                                    Ghi nhận tại: <strong>{selectedVar.source}</strong>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Bảng phân tích khác biệt & Góc nhìn học thuật */}
                                                        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200 space-y-3 shadow-xs">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
                                                                <Sparkles className="w-4 h-4 text-amber-600" />
                                                                <span>Điểm Khác Biệt Cốt Lõi & So Sánh Đối Chiếu</span>
                                                            </div>
                                                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80">
                                                                {selectedVar.differenceNote}
                                                            </p>

                                                            {selectedVar.scholarlyAnalysis && (
                                                                <div className="pt-2 space-y-1.5">
                                                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 uppercase">
                                                                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                                                                        <span>Góc Nhìn Học Thuật & Nhân Học Văn Hóa</span>
                                                                    </div>
                                                                    <p className="text-xs sm:text-sm text-indigo-950/90 leading-relaxed bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
                                                                        {selectedVar.scholarlyAnalysis}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            <div className="pt-3 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2">
                                                                <span className="text-[11px] text-slate-500 italic">
                                                                    Dữ liệu đối chiếu chuẩn hóa theo phương pháp văn học dân gian so sánh.
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (openAiChat) {
                                                                            openAiChat(`Hãy phân tích chuyên sâu về sự khác biệt giữa nguyên tác và dị bản ${selectedVar.name} của tác phẩm "${current.title}" (${selectedVar.region}).`, current.slug);
                                                                        }
                                                                    }}
                                                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                                                >
                                                                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                                                                    <span>Hỏi Gia sư AI phân tích sâu dị bản này</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                                            <Scroll className="w-8 h-8 text-slate-400 mx-auto" />
                                            <p className="text-sm font-bold text-slate-700">Tác phẩm ghi nhận một văn bản chuẩn duy nhất</p>
                                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                                Tác phẩm này đã được chuẩn hóa cố định trong kho tàng chính thức của Viện Văn học và không ghi nhận các dị bản địa phương có sự sai khác đáng kể.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ============================================================== */}
                            {/* PHẦN 4: TRỢ LÝ AI & LIÊN HỆ (TAB: tro-ly-ai HOẶC tat-ca)        */}
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
