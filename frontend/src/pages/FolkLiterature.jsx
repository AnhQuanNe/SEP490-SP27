import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import literatureService from '../services/literature.service';
import PoemDisplay from '../components/common/PoemDisplay';
import WorkDetailModal from '../components/common/WorkDetailModal';
import './FolkLiterature.css';
import {
    BookOpen,
    Sparkles,
    Search,
    Compass,
    MapPin,
    ArrowRight,
    CheckCircle2,
    Bookmark,
    Scroll,
    Flame,
    Quote,
    X,
    Eye,
    ThumbsUp,
    ChevronRight,
    RefreshCw,
    Feather,
    Heart,
    Share2,
    SlidersHorizontal,
    Music,
    ShieldCheck,
    Bot
} from 'lucide-react';
import { useAiChat } from '../context/AiChatContext';

const FolkLiterature = () => {
    const { openAiChat } = useAiChat();
    const [works, setWorks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subCategory, setSubCategory] = useState('all'); // 'all' | 'than-thoai' | 'truyen-thuyet' | 'co-tich' | 'ca-dao' | 'tuc-ngu'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [activeModalWork, setActiveModalWork] = useState(null);
    const [savedWorkIds, setSavedWorkIds] = useState(new Set());
    const [toastMessage, setToastMessage] = useState('');

    // Danh ngôn / Câu ca dao ngẫu nhiên hôm nay
    const folkQuotes = [
        {
            quote: 'Công cha như núi Thái Sơn,\nNghĩa mẹ như nước trong nguồn chảy ra.',
            theme: 'Đạo hiếu & Tình cảm gia đình',
            origin: 'Ca dao dân gian Việt Nam'
        },
        {
            quote: 'Bầu ơi thương lấy bí cùng,\nTuy rằng khác giống nhưng chung một giàn.',
            theme: 'Tinh thần tương thân tương ái',
            origin: 'Ca dao dân gian Việt Nam'
        },
        {
            quote: 'Nhiễu điều phủ lấy giá gương,\nNgười trong một nước phải thương nhau cùng.',
            theme: 'Đoàn kết dân tộc',
            origin: 'Ca dao truyền khẩu'
        },
        {
            quote: 'Gió đưa cành trúc la đà,\nTiếng chuông Trấn Vũ, canh gà Thọ Xương.',
            theme: 'Bản sắc Thăng Long - Hà Nội xưa',
            origin: 'Ca dao xứ Bắc'
        }
    ];

    const [randomQuoteIndex, setRandomQuoteIndex] = useState(0);

    const changeQuote = () => {
        setRandomQuoteIndex((prev) => (prev + 1) % folkQuotes.length);
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const folkGenres = [
        { id: 'all', label: 'Tất cả dân gian', desc: 'Toàn bộ kho tàng truyện kể & thi ca dân gian' },
        { id: 'than-thoai', label: 'Thần thoại', desc: 'Nguồn gốc vũ trụ, loài người và muôn loài' },
        { id: 'truyen-thuyet', label: 'Truyền thuyết', desc: 'Dựng nước, giữ nước & các vị anh hùng dân tộc' },
        { id: 'co-tich', label: 'Cổ tích', desc: 'Số phận con người, khát vọng công lý & cái thiện' },
        { id: 'ca-dao', label: 'Ca dao - Dân ca', desc: 'Tâm hồn, tình yêu quê hương & lao động sản xuất' },
        { id: 'tuc-ngu', label: 'Tục ngữ', desc: 'Túi khôn kinh nghiệm đời sống của ông cha' },
    ];

    const fetchFolkWorks = async () => {
        try {
            setIsLoading(true);
            const categoryFilter = subCategory === 'all' ? 'dan-gian' : subCategory;
            const data = await literatureService.searchWorks({
                query: searchQuery,
                category: categoryFilter,
                region: selectedRegion === 'all' ? '' : selectedRegion,
                limit: 30,
            });
            setWorks(data.works || []);
        } catch (error) {
            console.error('Lỗi tải tác phẩm văn học dân gian:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFolkWorks();
    }, [subCategory, selectedRegion]);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        fetchFolkWorks();
    };

    const toggleSave = (id) => {
        setSavedWorkIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                showToast('Đã xóa khỏi danh sách lưu');
            } else {
                next.add(id);
                showToast('Đã lưu vào bộ sưu tập cá nhân!');
            }
            return next;
        });
    };

    const currentQuote = folkQuotes[randomQuoteIndex];

    return (
        <div className="folk-page">
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* 1. HERO HEADER BANNER */}
            <section className="folk-hero">
                <div className="folk-hero-aura"></div>
                <div className="folk-hero-aura-amber"></div>

                <div className="folk-hero-container">
                    {/* Breadcrumb */}
                    <div className="folk-breadcrumb">
                        <Link to="/" className="folk-breadcrumb-link">Trang chủ</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="folk-breadcrumb-current">Văn học Dân gian</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7 space-y-4">
                            <div className="folk-badge">
                                <Scroll className="w-3.5 h-3.5 text-amber-400" />
                                <span>Kho Tàng Văn Học Dân Gian Việt Nam</span>
                            </div>
                            <h1 className="folk-hero-title font-heritage">
                                Hồn Thiêng Dân Tộc & Lời Răn Tiền Nhân
                            </h1>
                            <p className="folk-hero-desc">
                                Nơi lưu giữ tiếng nói nghìn đời của cha ông qua những câu chuyện thần thoại mở cõi, truyền thuyết quật cường, cổ tích thấm đẫm tình người cùng ngàn câu ca dao tục ngữ mộc mạc mà thâm sâu.
                            </p>

                            {/* Search bar */}
                            <form onSubmit={handleSearchSubmit} className="pt-2 relative max-w-xl">
                                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tra cứu tích xưa, truyện cổ tích, câu tục ngữ, ca dao..."
                                    className="w-full pl-12 pr-28 py-3.5 bg-white text-slate-900 rounded-2xl outline-none text-sm placeholder:text-slate-400 shadow-xl focus:ring-2 focus:ring-amber-500 font-medium"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-24 text-slate-400 hover:text-slate-600 top-1/2 -translate-y-1/2 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl transition"
                                >
                                    Tra cứu
                                </button>
                            </form>
                        </div>

                        {/* Interactive Folk Wisdom Card */}
                        <div className="lg:col-span-5 folk-wisdom-card">
                            <div className="folk-wisdom-header">
                                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Quote className="w-4 h-4 text-amber-400" />
                                    Túi Khôn Dân Gian
                                </span>
                                <button
                                    onClick={changeQuote}
                                    className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg transition"
                                    title="Đổi câu khác"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Câu khác</span>
                                </button>
                            </div>

                            <div className="py-6 space-y-3">
                                <p className="folk-wisdom-quote font-heritage">
                                    &ldquo;{currentQuote.quote}&rdquo;
                                </p>
                                <div className="pt-2">
                                    <p className="text-xs font-semibold text-amber-400">{currentQuote.theme}</p>
                                    <p className="text-[11px] text-slate-400">{currentQuote.origin}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                                <span>Được truyền tụng qua nhiều thế hệ</span>
                                <span className="text-amber-300/80 font-medium">Di sản văn hóa phi vật thể</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. GENRE SELECTION PILLS */}
            <section className="folk-genre-section">
                <div className="folk-genre-card">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                        {folkGenres.map((genre) => (
                            <button
                                key={genre.id}
                                onClick={() => setSubCategory(genre.id)}
                                className={`folk-genre-btn ${
                                    subCategory === genre.id
                                        ? 'active'
                                        : 'inactive'
                                }`}
                            >
                                <span className="text-xs font-bold block">{genre.label}</span>
                                <span className={`text-[10px] line-clamp-1 mt-1 ${subCategory === genre.id ? 'text-amber-100' : 'text-slate-400'}`}>
                                    {genre.desc}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Secondary region filter */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>Vùng miền xuất xứ:</span>
                            <div className="flex items-center gap-1.5">
                                {[
                                    { id: 'all', label: 'Tất cả' },
                                    { id: 'Bắc', label: 'Bắc Bộ' },
                                    { id: 'Trung', label: 'Trung Bộ' },
                                    { id: 'Nam', label: 'Nam Bộ' },
                                ].map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelectedRegion(r.id)}
                                        className={`px-3 py-1 rounded-lg font-medium transition ${
                                            selectedRegion === r.id
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className="text-slate-500">
                            Tìm thấy <strong>{works.length}</strong> tác phẩm dân gian
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. FOLK WORKS GRID */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                                <div className="h-7 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-20 bg-slate-100 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                ) : works.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-3">
                        <Search className="w-10 h-10 text-amber-500 mx-auto" />
                        <h3 className="text-base font-bold text-slate-900 font-heritage">
                            Không tìm thấy tác phẩm dân gian phù hợp
                        </h3>
                        <p className="text-xs text-slate-500">
                            Thử chọn thể loại khác hoặc xóa từ khóa tìm kiếm.
                        </p>
                        <button
                            onClick={() => {
                                setSubCategory('all');
                                setSelectedRegion('all');
                                setSearchQuery('');
                            }}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                        >
                            Xem tất cả tác phẩm dân gian
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {works.map((work) => {
                            const isSaved = savedWorkIds.has(work._id);
                            return (
                                <article
                                    key={work._id}
                                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden group"
                                >
                                    <div className="p-6 space-y-3.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                                {work.categoryName || work.category}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                {work.region || 'Toàn quốc'}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 font-heritage group-hover:text-amber-800 transition-colors">
                                            {work.title}
                                        </h3>

                                        <p className="text-xs text-slate-500 font-medium">
                                            Lưu truyền: <span className="text-amber-800 font-semibold">{work.period}</span>
                                        </p>

                                        {work.quote && (
                                            <div className="p-3 bg-amber-50/70 rounded-xl border-l-2 border-amber-500 text-amber-950 font-heritage italic text-xs leading-relaxed">
                                                <PoemDisplay text={work.quote} size="xs" showQuotes={true} />
                                            </div>
                                        )}

                                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                            {work.summary}
                                        </p>
                                    </div>

                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3 text-slate-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3.5 h-3.5" />
                                                {work.viewsCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp className="w-3.5 h-3.5" />
                                                {work.likesCount || 0}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleSave(work._id)}
                                                className={`p-2 rounded-lg transition ${
                                                    isSaved ? 'text-amber-600 bg-amber-100' : 'text-slate-400 hover:text-amber-600'
                                                }`}
                                                title="Lưu vào sổ tay"
                                            >
                                                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
                                            </button>
                                            <button
                                                onClick={() => setActiveModalWork(work)}
                                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                                            >
                                                <span>Xem chi tiết</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* 4. MODAL CHI TIẾT CHUẨN HÓA 4 TẦNG NGHĨA */}
            <WorkDetailModal
                work={activeModalWork}
                isOpen={!!activeModalWork}
                onClose={() => setActiveModalWork(null)}
            />
        </div>
    );
};

export default FolkLiterature;
