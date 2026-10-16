import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    Quote,
    X,
    Clock,
    Eye,
    ThumbsUp,
    RefreshCw,
    SlidersHorizontal,
    Grid,
    List,
    ChevronRight,
    Share2,
    Calendar,
    Award
} from 'lucide-react';

const Explore = () => {
    // Data states
    const [works, setWorks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'latest' | 'title'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    // Modal state for detailed viewing
    const [activeModalWork, setActiveModalWork] = useState(null);
    const [savedWorkIds, setSavedWorkIds] = useState(new Set());

    // Notification toast
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Fetch initial data & categories
    useEffect(() => {
        const fetchInitialMeta = async () => {
            try {
                const [cats, tags] = await Promise.all([
                    literatureService.getCategories(),
                    literatureService.getPopularTags(10),
                ]);
                setCategories(cats);
                setPopularTags(tags);
            } catch (err) {
                console.error('Lỗi tải danh mục khám phá:', err);
            }
        };
        fetchInitialMeta();
    }, []);

    // Fetch works whenever category, region or search triggers
    const fetchWorks = async () => {
        try {
            setIsLoading(true);
            const data = await literatureService.searchWorks({
                query: searchQuery,
                category: selectedCategory,
                region: selectedRegion === 'all' ? '' : selectedRegion,
                limit: 24,
            });
            let resultList = data.works || [];

            // Sort logic
            if (sortBy === 'popular') {
                resultList.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
            } else if (sortBy === 'latest') {
                resultList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            } else if (sortBy === 'title') {
                resultList.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
            }

            setWorks(resultList);
        } catch (error) {
            console.error('Lỗi khi tải danh sách tác phẩm:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorks();
    }, [selectedCategory, selectedRegion, sortBy]);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        fetchWorks();
    };

    const handleTagClick = (tag) => {
        setSearchQuery(tag);
        // Trigger search immediately with new tag
        setTimeout(() => {
            fetchWorks();
        }, 50);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedRegion('all');
        setSortBy('popular');
        setTimeout(() => {
            fetchWorks();
        }, 50);
    };

    const toggleSaveWork = (workId) => {
        setSavedWorkIds((prev) => {
            const next = new Set(prev);
            if (next.has(workId)) {
                next.delete(workId);
                showToast('Đã bỏ lưu tác phẩm khỏi bộ sưu tập');
            } else {
                next.add(workId);
                showToast('Đã lưu tác phẩm vào sổ tay di sản của bạn!');
            }
            return next;
        });
    };

    // Category badge color helper
    const getCategoryBadgeClass = (category) => {
        switch (category) {
            case 'than-thoai':
                return 'bg-amber-100 text-amber-900 border-amber-300';
            case 'truyen-thuyet':
                return 'bg-purple-100 text-purple-900 border-purple-300';
            case 'co-tich':
                return 'bg-emerald-100 text-emerald-900 border-emerald-300';
            case 'ca-dao':
            case 'tuc-ngu':
                return 'bg-sky-100 text-sky-900 border-sky-300';
            case 'trung-dai':
                return 'bg-rose-100 text-rose-900 border-rose-300';
            case 'hien-dai':
                return 'bg-indigo-100 text-indigo-900 border-indigo-300';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-300';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/60 pb-24">
            {/* TOAST NOTIFICATION */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* 1. HERO HEADER BANNER */}
            <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-10 pb-16 relative overflow-hidden">
                {/* Ambient glow backgrounds */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
                        <Link to="/" className="hover:text-amber-400 transition">Trang chủ</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-amber-300 font-semibold">Khám phá Tri thức</span>
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
                        <div className="max-w-3xl space-y-4">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Thư Viện Số Di Sản Văn Học Việt Nam</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heritage tracking-tight leading-tight">
                                Khám Phá Kho Tàng Tri Thức Văn Học
                            </h1>
                            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                                Không gian tra cứu, đối chiếu và thưởng thức các thần thoại, truyền thuyết, thi ca và danh tác Việt Nam. Tất cả tác phẩm được chọn lọc theo chuẩn học thuật và lưu trữ tập trung.
                            </p>
                        </div>

                        {/* Quick Stats Widget */}
                        <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 w-full lg:w-auto text-center">
                            <div className="px-3 py-1">
                                <p className="text-2xl font-bold font-heritage text-amber-300">
                                    {categories.find((c) => c.id === 'all')?.count || works.length}+
                                </p>
                                <p className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Tác phẩm</p>
                            </div>
                            <div className="px-3 py-1 border-x border-white/15">
                                <p className="text-2xl font-bold font-heritage text-emerald-300">6+</p>
                                <p className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Thể loại</p>
                            </div>
                            <div className="px-3 py-1">
                                <p className="text-2xl font-bold font-heritage text-indigo-300">100%</p>
                                <p className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Học thuật</p>
                            </div>
                        </div>
                    </div>

                    {/* SEARCH INPUT BOX */}
                    <div className="mt-8 max-w-4xl">
                        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm theo tên truyện, tác giả, câu thơ, nhân vật hoặc địa danh (vd: Thánh Gióng, Thạch Sanh, Lạc Long Quân)..."
                                className="w-full pl-12 pr-32 py-3.5 bg-white text-slate-900 rounded-2xl outline-none text-sm placeholder:text-slate-400 shadow-xl focus:ring-2 focus:ring-amber-500 font-medium"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-28 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                            >
                                <Search className="w-3.5 h-3.5" />
                                <span>Tìm kiếm</span>
                            </button>
                        </form>

                        {/* Popular Tags */}
                        {popularTags.length > 0 && (
                            <div className="flex items-center gap-2 mt-3 flex-wrap text-xs text-slate-300">
                                <span className="flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                                    Gợi ý tìm nhanh:
                                </span>
                                {popularTags.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleTagClick(tag)}
                                        className="px-2.5 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] transition"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 2. FILTER & SORT TOOLBAR */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/90 p-4 sm:p-5 space-y-4">
                    {/* Categories Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1 hidden sm:inline">
                            Thể loại:
                        </span>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                    selectedCategory === cat.id
                                        ? 'bg-slate-900 text-white shadow-sm scale-105'
                                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                                }`}
                            >
                                <span>{cat.label}</span>
                                {cat.count !== undefined && (
                                    <span
                                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                            selectedCategory === cat.id
                                                ? 'bg-slate-800 text-amber-300'
                                                : 'bg-slate-200 text-slate-600'
                                        }`}
                                    >
                                        {cat.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Secondary Filters: Region, Sort, View Toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Region Filter */}
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-500">Vùng miền:</span>
                                <select
                                    value={selectedRegion}
                                    onChange={(e) => setSelectedRegion(e.target.value)}
                                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                                >
                                    <option value="all">Tất cả vùng miền</option>
                                    <option value="Bắc">Miền Bắc</option>
                                    <option value="Trung">Miền Trung</option>
                                    <option value="Nam">Miền Nam</option>
                                    <option value="Toàn quốc">Toàn quốc / Dân gian</option>
                                </select>
                            </div>

                            {/* Sort Filter */}
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-500">Sắp xếp:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                                >
                                    <option value="popular">Xem nhiều nhất</option>
                                    <option value="latest">Mới cập nhật</option>
                                    <option value="title">Tên tiêu đề (A-Z)</option>
                                </select>
                            </div>

                            {/* Clear Filter button if any is active */}
                            {(searchQuery || selectedCategory !== 'all' || selectedRegion !== 'all') && (
                                <button
                                    onClick={handleClearFilters}
                                    className="text-amber-800 hover:text-amber-900 underline font-semibold text-xs ml-2"
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition ${
                                    viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Chế độ xem dạng lưới"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-lg transition ${
                                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Chế độ xem dạng danh sách"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. WORKS DISPLAY AREA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 font-heritage">
                            Kết Quả Tư Liệu & Tác Phẩm
                        </h2>
                        <p className="text-xs text-slate-500">
                            Hiển thị <strong>{works.length}</strong> tác phẩm được chọn lọc trong kho tàng
                        </p>
                    </div>

                    <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Nguồn tư liệu có bản quyền & học thuật</span>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                                <div className="flex justify-between">
                                    <div className="h-5 bg-slate-200 rounded-md w-24"></div>
                                    <div className="h-5 bg-slate-200 rounded-md w-16"></div>
                                </div>
                                <div className="h-7 bg-slate-200 rounded-md w-3/4"></div>
                                <div className="h-16 bg-slate-100 rounded-xl"></div>
                                <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : works.length === 0 ? (
                    /* Empty state */
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-xl mx-auto space-y-4 my-8 shadow-sm">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                            <Search className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 font-heritage">
                            Chưa tìm thấy tác phẩm phù hợp
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                            Thử tìm kiếm với từ khóa khác như "Thánh Gióng", "Thạch Sanh", "Truyện Kiều" hoặc xóa bộ lọc để xem toàn bộ kho tàng.
                        </p>
                        <button
                            onClick={handleClearFilters}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                        >
                            Xem tất cả tác phẩm
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* GRID VIEW */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {works.map((work) => {
                            const isSaved = savedWorkIds.has(work._id);
                            return (
                                <article
                                    key={work._id}
                                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                                >
                                    <div className="p-6 space-y-3.5">
                                        {/* Top Tags */}
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(
                                                    work.category
                                                )}`}
                                            >
                                                {work.categoryName || work.category}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                {work.region || 'Toàn quốc'}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg font-bold text-slate-900 font-heritage group-hover:text-amber-800 transition-colors line-clamp-1">
                                            {work.title}
                                        </h3>

                                        {/* Author & Period */}
                                        <p className="text-xs text-slate-500 font-medium">
                                            {work.author || 'Dân gian'} • <span className="text-slate-400">{work.period}</span>
                                        </p>

                                        {/* Quote excerpt */}
                                        {work.quote && (
                                            <div className="p-3 bg-amber-50/70 rounded-xl border-l-2 border-amber-500 text-amber-950 font-heritage italic text-xs leading-relaxed line-clamp-2">
                                                &ldquo;{work.quote}&rdquo;
                                            </div>
                                        )}

                                        {/* Summary text */}
                                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                            {work.summary}
                                        </p>

                                        {/* Tags */}
                                        {work.tags && work.tags.length > 0 && (
                                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                {work.tags.slice(0, 3).map((t) => (
                                                    <span
                                                        key={t}
                                                        onClick={() => handleTagClick(t)}
                                                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium cursor-pointer transition"
                                                    >
                                                        #{t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3 text-slate-400 font-medium">
                                            <span className="flex items-center gap-1" title="Lượt xem">
                                                <Eye className="w-3.5 h-3.5" />
                                                {work.viewsCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1" title="Lượt thích">
                                                <ThumbsUp className="w-3.5 h-3.5" />
                                                {work.likesCount || 0}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleSaveWork(work._id)}
                                                className={`p-2 rounded-lg transition ${
                                                    isSaved
                                                        ? 'text-amber-600 bg-amber-100 font-bold'
                                                        : 'text-slate-400 hover:text-amber-600 hover:bg-white'
                                                }`}
                                                title={isSaved ? 'Đã lưu' : 'Lưu tác phẩm'}
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
                ) : (
                    /* LIST VIEW */
                    <div className="space-y-4">
                        {works.map((work) => {
                            const isSaved = savedWorkIds.has(work._id);
                            return (
                                <article
                                    key={work._id}
                                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
                                >
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(
                                                    work.category
                                                )}`}
                                            >
                                                {work.categoryName || work.category}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {work.region || 'Toàn quốc'} • {work.period}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 font-heritage group-hover:text-amber-800 transition-colors">
                                            {work.title}
                                        </h3>
                                        <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">
                                            {work.summary}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                                        <button
                                            onClick={() => toggleSaveWork(work._id)}
                                            className={`p-2.5 rounded-xl border border-slate-200 transition ${
                                                isSaved ? 'text-amber-600 bg-amber-50 border-amber-300' : 'text-slate-400 hover:text-amber-600'
                                            }`}
                                        >
                                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => setActiveModalWork(work)}
                                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                                        >
                                            <span>Khám phá toàn văn</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* 4. CALL TO ACTION: TRỢ LÝ AI & BẢN ĐỒ VĂN HỌC */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
                            <Bot className="w-3.5 h-3.5 text-amber-400" />
                            <span>Trợ Lý Trí Tuệ Nhân Tạo</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold font-heritage">
                            Cần tra cứu điển tích hoặc phân tích hình tượng văn học?
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                            Hỏi đáp trực tiếp cùng Trợ lý AI VietHeritage với kho kiến thức văn hóa dân tộc được kiểm duyệt học thuật.
                        </p>
                    </div>
                    <Link
                        to="/#tro-ly-ai"
                        className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-2xl text-xs transition shadow-lg whitespace-nowrap flex items-center gap-2"
                    >
                        <span>Trò chuyện cùng AI</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* 5. MODAL CHI TIẾT TÁC PHẨM (UC08 View Details) */}
            {activeModalWork && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 bg-slate-950 text-white flex items-start justify-between border-b border-slate-800">
                            <div className="space-y-1.5 pr-6">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        {activeModalWork.categoryName || activeModalWork.category}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        Thời kỳ: <strong>{activeModalWork.period}</strong>
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold font-heritage text-white">
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

                        {/* Body */}
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
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                                    <Scroll className="w-4 h-4 text-amber-600" />
                                    Tóm tắt tác phẩm
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                    {activeModalWork.summary}
                                </p>
                            </div>

                            {/* Content */}
                            {activeModalWork.content && (
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4 text-indigo-600" />
                                        Nội dung tác phẩm
                                    </h4>
                                    <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-700 leading-relaxed whitespace-pre-line border border-slate-200 max-h-72 overflow-y-auto font-sans">
                                        {activeModalWork.content}
                                    </div>
                                </div>
                            )}

                            {/* Context & Meaning */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {activeModalWork.historicalContext && (
                                    <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                                        <h5 className="text-[11px] font-bold text-indigo-900 uppercase">Bối cảnh lịch sử</h5>
                                        <p className="text-xs text-indigo-950/80 leading-relaxed">
                                            {activeModalWork.historicalContext}
                                        </p>
                                    </div>
                                )}
                                {activeModalWork.thematicMeaning && (
                                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1">
                                        <h5 className="text-[11px] font-bold text-emerald-900 uppercase">Ý nghĩa biểu tượng</h5>
                                        <p className="text-xs text-emerald-950/80 leading-relaxed">
                                            {activeModalWork.thematicMeaning}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Academic Source */}
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

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <button
                                onClick={() => toggleSaveWork(activeModalWork._id)}
                                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition flex items-center gap-1.5"
                            >
                                <Bookmark className={`w-3.5 h-3.5 ${savedWorkIds.has(activeModalWork._id) ? 'fill-amber-600 text-amber-600' : ''}`} />
                                <span>{savedWorkIds.has(activeModalWork._id) ? 'Đã lưu' : 'Lưu tác phẩm'}</span>
                            </button>
                            <button
                                onClick={() => setActiveModalWork(null)}
                                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                            >
                                Đóng lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Explore;
