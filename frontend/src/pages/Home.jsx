import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import literatureService from '../services/literature.service';
import {
    BookOpen,
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
    Quote,
    X,
    Clock,
    Eye,
    ThumbsUp,
    RefreshCw
} from 'lucide-react';

const Home = () => {
    const { user, isAuthenticated, getAvatarUrl } = useAuth();
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

            // Tự động cuộn mượt xuống phần danh sách kết quả (UC06 / UC07)
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

    // Filter by category click
    const handleCategoryClick = (catId) => {
        setSelectedCategory(catId);
        if (catId === 'all' && !searchQuery.trim()) {
            setSearchResults(null);
        } else {
            handleSearch(searchQuery, catId);
        }
    };

    // Quick tag click
    const handleTagClick = (tag) => {
        setSearchQuery(tag);
        handleSearch(tag, selectedCategory);
    };

    // Reset search filter
    const handleResetFilter = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSearchResults(null);
    };

    const displayWorks = searchResults !== null ? searchResults : featuredWorks;

    return (
        <div className="space-y-20 pb-20">
            {/* 1. HERO SECTION */}
            <section className="relative overflow-hidden pt-12 pb-24 lg:pt-16 lg:pb-32 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
                {/* Background artistic glow & pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500 blur-3xl"></div>
                    <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-indigo-600 blur-3xl"></div>
                </div>

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Top Pill Announcement */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Di Sản Văn Học Việt Nam • Trí Tuệ Nhân Tạo Thế Hệ Mới</span>
                        </div>
                    </div>

                    {/* Main Headline */}
                    <div className="text-center max-w-4xl mx-auto space-y-6">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heritage leading-tight sm:leading-tight">
                            Gìn Giữ Hồn Việt Qua Lăng Kính{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                                Trí Tuệ Nhân Tạo
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
                            Khám phá chiều sâu kho tàng thần thoại, truyền thuyết, ca dao tục ngữ và kiệt tác văn học nước nhà. Dữ liệu được số hóa chuẩn mực, kết nối với trợ lý AI phân tích ngữ cảnh.
                        </p>
                    </div>

                    {/* SEARCH BOX (Core feature for UC06/UC07) */}
                    <div className="mt-10 max-w-3xl mx-auto">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSearch();
                            }}
                            className="bg-white/95 rounded-2xl p-2 sm:p-3 shadow-2xl shadow-indigo-950/50 border border-slate-200 backdrop-blur-md"
                        >
                            {/* Category Filter Tabs with dynamic counts from Database */}
                            <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-2 scrollbar-none px-1 text-slate-600">
                                {categories.map((cat) => (
                                    <button
                                        type="button"
                                        key={cat.id}
                                        onClick={() => handleCategoryClick(cat.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                            selectedCategory === cat.id
                                                ? 'bg-slate-900 text-white shadow-sm'
                                                : 'hover:bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        <span>{cat.label}</span>
                                        {cat.count !== undefined && (
                                            <span
                                                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                                    selectedCategory === cat.id
                                                        ? 'bg-slate-800 text-amber-300'
                                                        : 'bg-slate-200 text-slate-700'
                                                }`}
                                            >
                                                {cat.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Input Form */}
                            <div className="flex items-center gap-2 mt-1">
                                <div className="relative flex-1">
                                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Tra cứu tác phẩm, truyện dân gian, câu ca dao, địa danh (vd: Thạch Sanh, Thánh Gióng)..."
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-xl outline-none focus:ring-2 focus:ring-amber-500/50 transition-all border border-slate-200"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-70"
                                >
                                    {isSearching ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Tra Cứu</span>
                                            <ArrowRight className="w-4 h-4" />
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

                        {/* Popular Tags from Database */}
                        <div className="flex items-center justify-center flex-wrap gap-2 mt-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1 font-medium text-slate-400">
                                <Flame className="w-3.5 h-3.5 text-amber-400" />
                                Từ khóa gợi ý:
                            </span>
                            {popularTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-colors"
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
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                    <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-200/80">
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

                            {/* Action shortcuts */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Pillar 1 */}
                    <Link
                        to="/kham-pha"
                        className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group block text-left"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <Scroll className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-2 font-heritage">
                            Kho Tri Thức Chuẩn Hóa
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            Tuyển tập các tác phẩm thần thoại, truyền thuyết, ca dao và kiệt tác văn học trung - hiện đại với nguồn trích dẫn học thuật minh bạch.
                        </p>
                        <span className="text-xs font-semibold text-amber-700 inline-flex items-center gap-1">
                            Khám phá thư viện <ArrowRight className="w-3 h-3" />
                        </span>
                    </Link>

                    {/* Pillar 2 */}
                    <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <Bot className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-2 font-heritage">
                            Trợ Lý AI Văn Học
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            Giải nghĩa từ cổ, điển tích điển cố, tóm tắt tác phẩm và hỗ trợ người học cảm thụ các tầng nghĩa biểu tượng một cách khoa học.
                        </p>
                        <span className="text-xs font-semibold text-indigo-700 inline-flex items-center gap-1">
                            Thử nghiệm AI <ArrowRight className="w-3 h-3" />
                        </span>
                    </div>

                    {/* Pillar 3 */}
                    <Link
                        to="/ban-do"
                        className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group block text-left"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <Compass className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-2 font-heritage">
                            Bản Đồ Văn Học 3 Miền
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            Gắn kết tác phẩm và tác giả với địa danh văn hóa thực địa: từ non thiêng Ba Vì, sông Bạch Đằng đến đất học Thừa Thiên và miệt vườn Cửu Long.
                        </p>
                        <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                            Mở bản đồ <ArrowRight className="w-3 h-3" />
                        </span>
                    </Link>

                    {/* Pillar 4 */}
                    <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <Feather className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-2 font-heritage">
                            Cộng Đồng & Đánh Giá Thơ
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            Diễn đàn học thuật dành cho người yêu văn học trao đổi góc nhìn; tính năng AI Poetry Review giúp người sáng tác trau dồi thi luật.
                        </p>
                        <span className="text-xs font-semibold text-rose-700 inline-flex items-center gap-1">
                            Gia nhập nhóm <ArrowRight className="w-3 h-3" />
                        </span>
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

                {/* Loading Shimmer Skeleton */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {displayWorks.map((work) => (
                            <div
                                key={work._id || work.slug}
                                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/50">
                                            {work.categoryName || work.category}
                                        </span>
                                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            {work.region || 'Toàn quốc'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 font-heritage group-hover:text-amber-800 transition-colors">
                                        {work.title}
                                    </h3>

                                    {work.quote && (
                                        <div className="p-3 bg-slate-50 rounded-xl border-l-4 border-amber-600 text-xs text-slate-700 italic">
                                            <Quote className="w-3.5 h-3.5 text-amber-600 mb-1 inline mr-1" />
                                            {work.quote}
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                        {work.summary}
                                    </p>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={work.source}>
                                        {work.source}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            title="Lưu vào bộ sưu tập cá nhân"
                                            className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                                        >
                                            <Bookmark className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setActiveModalWork(work)}
                                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                                        >
                                            <span>Xem chi tiết</span>
                                            <ArrowRight className="w-3 h-3" />
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
                <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
                    <div className="max-w-2xl space-y-4 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                            <Bot className="w-3.5 h-3.5" />
                            <span>Mô Phỏng Trợ Lý AI Học Thuật (UC09)</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold font-heritage leading-snug">
                            Hỏi Đáp & Giải Nghĩa Tác Phẩm Cùng AI
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                            Khác với chatbot thông thường, VietHeritage AI ưu tiên trích xuất và đối chiếu trực tiếp từ kho tư liệu văn học chuẩn mực của hệ thống, đảm bảo câu trả lời luôn có nguồn dẫn chứng tin cậy.
                        </p>
                    </div>

                    {/* Interactive chat mockup card */}
                    <div className="mt-8 bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 max-w-3xl space-y-4">
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
                                    <span>Nguồn đối chiếu: Giáo trình Văn học Dân gian Việt Nam (ĐH Sư Phạm) & GS. Nguyễn Đổng Chi.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. TRUST & METRICS BANNER */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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

            {/* 7. MODAL CHI TIẾT TÁC PHẨM TỪ DATABASE (UC08 - View Content Details) */}
            {activeModalWork && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
                            <div className="space-y-1 pr-6">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        {activeModalWork.categoryName}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {activeModalWork.period}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold font-heritage text-white pt-1">
                                    {activeModalWork.title}
                                </h2>
                                <p className="text-xs text-slate-300">
                                    Tác giả: <strong>{activeModalWork.author || 'Dân gian'}</strong> • Xuất xứ: <strong>{activeModalWork.region}</strong>
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveModalWork(null)}
                                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
                            {/* Quote */}
                            {activeModalWork.quote && (
                                <div className="p-4 bg-amber-50 rounded-2xl border-l-4 border-amber-600 text-amber-950 font-heritage italic text-xs leading-relaxed">
                                    <Quote className="w-4 h-4 text-amber-600 mb-1 inline mr-1" />
                                    {activeModalWork.quote}
                                </div>
                            )}

                            {/* Summary */}
                            <div className="space-y-1.5">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                    Tóm tắt cốt truyện
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    {activeModalWork.summary}
                                </p>
                            </div>

                            {/* Full Content */}
                            {activeModalWork.content && (
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                        Nội dung tác phẩm
                                    </h4>
                                    <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-700 leading-relaxed whitespace-pre-line border border-slate-200">
                                        {activeModalWork.content}
                                    </div>
                                </div>
                            )}

                            {/* Thematic & Historical Context */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {activeModalWork.historicalContext && (
                                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-1">
                                        <h5 className="text-[11px] font-bold text-indigo-900 uppercase">Bối cảnh lịch sử</h5>
                                        <p className="text-xs text-indigo-950/80 leading-relaxed">
                                            {activeModalWork.historicalContext}
                                        </p>
                                    </div>
                                )}
                                {activeModalWork.thematicMeaning && (
                                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
                                        <h5 className="text-[11px] font-bold text-emerald-900 uppercase">Ý nghĩa biểu tượng</h5>
                                        <p className="text-xs text-emerald-950/80 leading-relaxed">
                                            {activeModalWork.thematicMeaning}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Reference Source */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Nguồn học thuật: <strong>{activeModalWork.source}</strong></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" />
                                        {activeModalWork.viewsCount || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        {activeModalWork.likesCount || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={() => setActiveModalWork(null)}
                                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
