import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import literatureService from '../services/literature.service';
import PoemDisplay from '../components/common/PoemDisplay';
import WorkDetailModal from '../components/common/WorkDetailModal';
import {
    Sparkles,
    Search,
    Compass,
    MapPin,
    ArrowRight,
    CheckCircle2,
    Bookmark,
    Bot,
    Feather,
    Scroll,
    Flame,
    ChevronRight,
    X,
    Eye,
    ThumbsUp,
    RefreshCw,
    Trophy,
    GraduationCap
} from 'lucide-react';
import { useAiChat } from '../context/AiChatContext';
import DragonPhoenixHeritage from '../components/common/DragonPhoenixHeritage';
import './Home.css';

const Home = () => {
    const { user, isAuthenticated, getAvatarUrl } = useAuth();
    const { openAiChat } = useAiChat();
    const avatarSrc = user ? getAvatarUrl(user.avatar) : null;

    // Database states
    const [featuredWorks, setFeaturedWorks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Search and filter states (UC06 & UC07)
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Detail modal state (UC08)
    const [activeModalWork, setActiveModalWork] = useState(null);

    // Fetch initial data from MongoDB
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const [featured, cats, tags] = await Promise.all([
                    literatureService.getFeaturedWorks(6),
                    literatureService.getCategories(),
                    literatureService.getPopularTags(8),
                ]);
                setFeaturedWorks(featured);
                setCategories(cats);
                setPopularTags(tags);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu từ server:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Handle search action (UC07)
    const handleSearch = async (query = searchQuery, category = selectedCategory) => {
        try {
            setIsSearching(true);
            const data = await literatureService.searchWorks({
                query,
                category,
                limit: 12,
            });
            setSearchResults(data.works);

            setTimeout(() => {
                const resultsEl = document.getElementById('dan-gian');
                if (resultsEl) {
                    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 80);
        } catch (error) {
            console.error('Lỗi khi tìm kiếm tác phẩm:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCategoryClick = (catId) => {
        setSelectedCategory(catId);
        if (catId === 'all' && !searchQuery.trim()) {
            setSearchResults(null);
        } else {
            handleSearch(searchQuery, catId);
        }
    };

    const handleTagClick = (tag) => {
        setSearchQuery(tag);
        handleSearch(tag, selectedCategory);
    };

    const handleResetFilter = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSearchResults(null);
    };

    const displayWorks = searchResults !== null ? searchResults : featuredWorks;

    return (
        <div className="space-y-20 pb-20">
            {/* 1. HERO SECTION: RỒNG BAY PHƯỢNG MÚA & HỒN THIÊNG SÔNG NÚI */}
            <section className="home-hero">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <DragonPhoenixHeritage variant="hero" />
                </div>

                <div className="home-hero-glow-1"></div>
                <div className="home-hero-glow-2"></div>

                <div className="home-hero-container">
                    {/* Top Pill Announcement */}
                    <div className="flex justify-center mb-6">
                        <div className="home-pill-announcement">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                            <span>❖ RỒNG BAY THĂNG LONG • PHƯỢNG MÚA HOÀNG THÀNH ❖</span>
                        </div>
                    </div>

                    {/* Main Headline */}
                    <div className="text-center max-w-4xl mx-auto space-y-6">
                        <h1 className="home-hero-title font-heritage drop-shadow-md">
                            Gìn Giữ Hồn Thiêng Sông Núi Qua{' '}
                            <span className="home-title-highlight drop-shadow-sm">
                                Trí Tuệ Nhân Tạo
                            </span>
                        </h1>
                        <p className="home-hero-desc font-vietnam drop-shadow-xs">
                            Khám phá tinh hoa ngàn năm văn hiến: Ca dao, Tục ngữ, Thần thoại và Truyền thuyết dân tộc Việt Nam qua hệ thống RAG đối chiếu tư liệu học thuật chuẩn mực.
                        </p>
                    </div>

                    {/* SEARCH BOX (Core feature for UC06/UC07) */}
                    <div className="mt-10 max-w-3xl mx-auto">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSearch();
                            }}
                            className="home-search-form"
                        >
                            <span className="home-corner-decor -top-1.5 -left-1.5">❖</span>
                            <span className="home-corner-decor -top-1.5 -right-1.5">❖</span>
                            <span className="home-corner-decor -bottom-1.5 -left-1.5">❖</span>
                            <span className="home-corner-decor -bottom-1.5 -right-1.5">❖</span>

                            {/* Category Filter Tabs */}
                            <div className="home-category-tabs">
                                {categories.map((cat) => {
                                    const isActive = selectedCategory === cat.id;
                                    return (
                                        <button
                                            type="button"
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className={`home-category-btn ${isActive ? 'home-category-btn-active' : 'home-category-btn-inactive'}`}
                                        >
                                            <span>{cat.label}</span>
                                            {cat.count !== undefined && (
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-red-950 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-stone-700'}`}>
                                                    {cat.count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Input Form */}
                            <div className="flex items-center gap-2 mt-1">
                                <div className="relative flex-1">
                                    <Search className="w-5 h-5 text-amber-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Tra cứu ca dao, tục ngữ, tích truyện dân gian (vd: Uống nước nhớ nguồn, Thạch Sanh)..."
                                        className="home-search-input"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="home-search-submit-btn"
                                >
                                    {isSearching ? (
                                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                                    ) : (
                                        <>
                                            <span>Tra Cứu</span>
                                            <ArrowRight className="w-4 h-4 text-amber-300" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Active Search Notification */}
                        {searchResults !== null && (
                            <div className="mt-3 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center justify-between backdrop-blur-sm animate-in fade-in">
                                <span>
                                    ✨ Đã tìm thấy <strong>{displayWorks.length}</strong> tác phẩm {searchQuery ? `cho từ khóa "${searchQuery}"` : 'theo bộ lọc'}.
                                </span>
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="text-amber-300 hover:text-white underline font-semibold ml-2"
                                >
                                    Xem tất cả tác phẩm
                                </button>
                            </div>
                        )}

                        {/* Popular Tags */}
                        <div className="flex items-center justify-center flex-wrap gap-2 mt-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1 font-medium text-slate-400">
                                <Flame className="w-3.5 h-3.5 text-amber-400" />
                                Từ khóa gợi ý:
                            </span>
                            {popularTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. USER STATUS BANNER (If Logged In) */}
            {isAuthenticated && (
                <section className="home-user-banner-container">
                    <div className="home-user-card">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500 bg-amber-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    {avatarSrc ? (
                                        <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-amber-800 font-heritage">
                                            {user?.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <h2 className="text-xl font-bold text-slate-900 font-heritage">
                                            Chào mừng trở lại, {user?.name}!
                                        </h2>
                                        {user?.isVerified && (
                                            <span title="Tài khoản đã xác thực">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">{user?.email}</p>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70 capitalize">
                                            Vai trò: {user?.role || 'Độc giả'}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            Hội viên VietHeritage
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                                <Link
                                    to="/profile"
                                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                                >
                                    Quản lý Hồ sơ
                                </Link>
                                <Link
                                    to="/van-hoc-dan-gian"
                                    className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition flex items-center gap-1.5"
                                >
                                    <span>Vào Khám Phá</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. FOUR CORE PILLARS (UC06 - UC14) */}
            <section id="kham-pha" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-3 mb-12">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Trải Nghiệm Toàn Diện</p>
                    <h2 className="text-3xl font-extrabold text-slate-900 font-heritage">
                        Bốn Trụ Cột Tri Thức Của VietHeritage AI
                    </h2>
                    <p className="text-sm text-slate-600 max-w-xl mx-auto">
                        Mỗi phân hệ được thiết kế chặt chẽ nhằm mang lại hành trình tiếp cận văn học: Tìm kiếm → Thấu hiểu → Khám phá → Trao đổi.
                    </p>
                </div>

                <div className="home-pillars-grid">
                    {/* Pillar 1 */}
                    <Link to="/kham-pha" className="home-pillar-box group block">
                        <span className="absolute top-2 right-2 text-[10px] text-amber-600 font-bold">❖</span>
                        <div className="home-pillar-icon bg-amber-100/80 text-red-900 border border-amber-300/60 shadow-xs">
                            <Scroll className="w-6 h-6 text-amber-800" />
                        </div>
                        <h3 className="text-base font-bold text-red-950 mb-2 font-heritage">
                            Kho Tri Thức Chuẩn Hóa
                        </h3>
                        <p className="text-xs text-stone-600 leading-relaxed mb-4">
                            Tuyển tập các tác phẩm thần thoại, truyền thuyết, ca dao và kiệt tác văn học trung - hiện đại với nguồn trích dẫn học thuật minh bạch.
                        </p>
                        <span className="text-xs font-semibold text-amber-800 inline-flex items-center gap-1 group-hover:text-red-800 transition-colors">
                            Khám phá thư viện <ArrowRight className="w-3 h-3" />
                        </span>
                    </Link>

                    {/* Pillar 2 */}
                    <div className="home-pillar-box group">
                        <span className="absolute top-2 right-2 text-[10px] text-amber-600 font-bold">❖</span>
                        <div className="home-pillar-icon bg-red-100/70 text-red-900 border border-red-300/50 shadow-xs">
                            <Bot className="w-6 h-6 text-red-800" />
                        </div>
                        <h3 className="text-base font-bold text-red-950 mb-2 font-heritage">
                            Trợ Lý AI Văn Học
                        </h3>
                        <p className="text-xs text-stone-600 leading-relaxed mb-4">
                            Giải nghĩa từ cổ, điển tích điển cố, tóm tắt tác phẩm và hỗ trợ người học cảm thụ các tầng nghĩa biểu tượng một cách khoa học.
                        </p>
                        <span className="text-xs font-semibold text-red-800 inline-flex items-center gap-1 cursor-pointer" onClick={() => openAiChat()}>
                            Thử nghiệm AI <ArrowRight className="w-3 h-3" />
                        </span>
                    </div>

                    {/* Pillar 3 */}
                    <Link to="/kham-pha" className="home-pillar-box group block">
                        <span className="absolute top-2 right-2 text-[10px] text-amber-600 font-bold">❖</span>
                        <div className="home-pillar-icon bg-emerald-100/70 text-emerald-900 border border-emerald-300/50 shadow-xs">
                            <Compass className="w-6 h-6 text-emerald-800" />
                        </div>
                        <h3 className="text-base font-bold text-red-950 mb-2 font-heritage">
                            Không Gian Di Sản 3 Miền
                        </h3>
                        <p className="text-xs text-stone-600 leading-relaxed mb-4">
                            Gắn kết tác phẩm và tác giả với địa danh văn hóa thực địa: từ non thiêng Ba Vì, sông Bạch Đằng đến đất học Thừa Thiên và miệt vườn Cửu Long.
                        </p>
                        <span className="text-xs font-semibold text-emerald-800 inline-flex items-center gap-1">
                            Khám phá ngay <ArrowRight className="w-3 h-3" />
                        </span>
                    </Link>

                    {/* Pillar 4 */}
                    <div className="home-pillar-box group">
                        <span className="absolute top-2 right-2 text-[10px] text-amber-600 font-bold">❖</span>
                        <div className="home-pillar-icon bg-amber-100/70 text-amber-900 border border-amber-300/60 shadow-xs">
                            <Feather className="w-6 h-6 text-amber-800" />
                        </div>
                        <h3 className="text-base font-bold text-red-950 mb-2 font-heritage">
                            Cộng Đồng & Đánh Giá Thơ
                        </h3>
                        <p className="text-xs text-stone-600 leading-relaxed mb-4">
                            Diễn đàn học thuật dành cho người yêu văn học trao đổi góc nhìn; tính năng AI Poetry Review giúp người sáng tác trau dồi thi luật.
                        </p>
                        <span className="text-xs font-semibold text-amber-800 inline-flex items-center gap-1">
                            Gia nhập nhóm <ArrowRight className="w-3 h-3" />
                        </span>
                    </div>
                </div>
            </section>

            {/* 3.5. PERSONALIZED LEARNING PATH BANNER */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 p-8 sm:p-10 border border-amber-500/30 shadow-xl text-white">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-3 max-w-2xl text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
                                <Sparkles className="w-3.5 h-3.5" />
                                Tính Năng Nổi Bật Mới
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black font-heritage text-amber-100">
                                Lộ Trình Học Văn Hóa Cá Nhân Hóa
                            </h2>
                            <p className="text-sm text-stone-300 leading-relaxed">
                                Bạn muốn học ca dao, tục ngữ trong 7 hay 14 ngày, mỗi ngày 10 phút? Hệ thống kết nối kho tàng tác phẩm thật trong cơ sở dữ liệu với phân tích AI để xây dựng lộ trình từ cơ bản đến nâng cao, đi kèm câu hỏi luyện tập và gợi ý ôn tập thông minh!
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <Link
                                to="/lo-trinh-hoc"
                                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-red-950 font-bold shadow-lg shadow-amber-950/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm whitespace-nowrap"
                            >
                                <GraduationCap className="w-5 h-5" />
                                <span>Khám Phá Lộ Trình Ngay</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. DYNAMIC LITERATURE SECTION LOADED FROM MONGODB (UC06, UC07, UC08) */}
            <section id="dan-gian" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 border-b border-slate-200 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                                {searchResults !== null ? 'Kết quả tìm kiếm tư liệu' : 'Kho Tác Phẩm Nổi Bật Từ Cơ Sở Dữ Liệu'}
                            </span>
                            {searchResults !== null && (
                                <button
                                    onClick={handleResetFilter}
                                    className="text-xs text-indigo-700 hover:underline font-semibold"
                                >
                                    (Xem tất cả)
                                </button>
                            )}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heritage mt-1">
                            {searchResults !== null
                                ? `Tìm thấy ${displayWorks.length} tác phẩm phù hợp`
                                : 'Văn Học Dân Gian & Danh Tác Việt Nam'}
                        </h2>
                    </div>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Đồng bộ dữ liệu thời gian thực</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-16 bg-slate-100 rounded"></div>
                                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : displayWorks.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 font-heritage">
                            Không tìm thấy tác phẩm nào phù hợp
                        </h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để duyệt toàn bộ danh mục văn học trong cơ sở dữ liệu.
                        </p>
                        <button
                            onClick={handleResetFilter}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                        >
                            Xem lại danh sách nổi bật
                        </button>
                    </div>
                ) : (
                    <div className="home-works-grid">
                        {displayWorks.map((work) => (
                            <div key={work._id || work.slug} className="home-work-card group">
                                <span className="absolute top-2 right-2 text-[9px] text-amber-600 font-bold">❖</span>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100/80 text-red-950 border border-amber-300/80">
                                            {work.categoryName || work.category}
                                        </span>
                                        <span className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                                            <MapPin className="w-3 h-3 text-amber-700" />
                                            {work.region || 'Toàn quốc'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-red-950 font-heritage group-hover:text-amber-700 transition-colors">
                                        {work.title}
                                    </h3>

                                    {work.quote && (
                                        <div className="home-work-quote-box font-heritage">
                                            <PoemDisplay text={work.quote} size="xs" showQuotes={true} />
                                        </div>
                                    )}

                                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                                        {work.summary}
                                    </p>
                                </div>

                                <div className="mt-5 pt-4 border-t border-amber-200/60 flex items-center justify-between">
                                    <span className="text-[11px] text-stone-500 truncate max-w-[200px]" title={work.source}>
                                        <span className="text-amber-700 font-bold">Nguồn:</span> {work.source}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            title="Lưu vào bộ sưu tập cá nhân"
                                            className="p-2 rounded-lg text-stone-400 hover:text-red-700 hover:bg-amber-100/50 transition cursor-pointer"
                                        >
                                            <Bookmark className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setActiveModalWork(work)}
                                            className="px-4 py-1.5 bg-gradient-to-r from-red-900 to-amber-800 hover:from-red-800 hover:to-amber-700 text-amber-100 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-xs border border-amber-400/40 cursor-pointer"
                                        >
                                            <span>Xem chi tiết</span>
                                            <ArrowRight className="w-3 h-3 text-amber-300" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 5. INTERACTIVE AI ASSISTANT DEMO SPOTLIGHT */}
            <section id="tro-ly-ai" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="home-ai-banner">
                    <div className="max-w-2xl space-y-4 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                            <Bot className="w-3.5 h-3.5" />
                            <span>Trợ Lý AI Học Thuật & Nghiên Cứu</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold font-heritage leading-snug">
                            Hỏi Đáp & Giải Nghĩa Tác Phẩm Cùng AI
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                            Khác với chatbot thông thường, VietHeritage AI ưu tiên trích xuất và đối chiếu trực tiếp từ kho tư liệu văn học chuẩn mực của hệ thống, đảm bảo câu trả lời luôn có nguồn dẫn chứng tin cậy.
                        </p>
                    </div>

                    <div className="home-ai-chat-bubble">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                Bạn
                            </div>
                            <div className="bg-slate-900/90 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-200 border border-slate-700/50">
                                &quot;Ý nghĩa hình tượng tiếng đàn và niêu cơm thần trong truyện cổ tích Thạch Sanh là gì?&quot;
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-indigo-950/70 rounded-2xl rounded-tl-none p-4 text-xs text-slate-200 border border-indigo-800/40 space-y-2">
                                <p className="leading-relaxed">
                                    <strong className="text-amber-300">1. Tiếng đàn thần:</strong> Là biểu tượng của công lý và sức mạnh nghệ thuật chân chính. Tiếng đàn vạch mặt Lý Thông, giải oan cho Thạch Sanh và thức tỉnh binh lính 18 nước chư hầu mà không cần đổ máu.
                                </p>
                                <p className="leading-relaxed">
                                    <strong className="text-amber-300">2. Niêu cơm thần:</strong> Ăn mãi không bao giờ hết, tượng trưng cho tình nhân ái bao la, lòng hiếu khách và khát vọng thái bình muôn thuở của nhân dân lao động Việt Nam.
                                </p>
                                <div className="pt-2 border-t border-indigo-900/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Nguồn đối chiếu: Kho tàng truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi.</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[11px] text-slate-400">
                                Bạn có câu hỏi riêng? Hãy thử ngay với Trợ lý AI hoặc tham gia đố vui:
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openAiChat()}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Bot className="w-3.5 h-3.5" />
                                    <span>Hỏi Trợ lý AI ngay</span>
                                </button>
                                <Link
                                    to="/do-vui"
                                    className="px-4 py-2 bg-indigo-900/80 hover:bg-indigo-800 border border-indigo-700/60 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                                >
                                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Thử tài Đố vui</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. TRUST & METRICS BANNER */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                    <div className="home-metrics-grid">
                        <div className="space-y-1">
                            <p className="text-3xl font-extrabold text-slate-900 font-heritage">
                                {categories.find((c) => c.id === 'all')?.count || 8}+
                            </p>
                            <p className="text-xs text-slate-500 font-medium">Tác phẩm đã được số hóa</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-extrabold text-amber-700 font-heritage">54</p>
                            <p className="text-xs text-slate-500 font-medium">Bản sắc Văn hóa Dân tộc</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-extrabold text-indigo-900 font-heritage">100%</p>
                            <p className="text-xs text-slate-500 font-medium">Nguồn kiểm chứng học thuật</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-extrabold text-emerald-700 font-heritage">24/7</p>
                            <p className="text-xs text-slate-500 font-medium">Trợ lý AI đồng hành</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal xem chi tiết tác phẩm đồng bộ cùng Khám phá (UC08, UC10, UC11) */}
            <WorkDetailModal
                work={activeModalWork}
                isOpen={Boolean(activeModalWork)}
                onClose={() => setActiveModalWork(null)}
                onWorkSelect={(newWork) => setActiveModalWork(newWork)}
            />
        </div>
    );
};

export default Home;
