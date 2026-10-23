import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import literatureService from '../services/literature.service';
import favoriteService from '../services/favorite.service';
import WorkDetailModal from '../components/common/WorkDetailModal';
import PoemDisplay from '../components/common/PoemDisplay';
import GuestQuotaModal from '../components/common/GuestQuotaModal';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/ai.service';
import './Explore.css';
import {
    BookOpen,
    Sparkles,
    Search,
    Compass,
    MapPin,
    ArrowRight,
    CheckCircle2,
    Heart,
    Bot,
    Quote,
    X,
    Clock,
    Eye,
    ThumbsUp,
    SlidersHorizontal,
    Grid,
    List,
    ChevronRight,
    Flame,
    ShieldCheck,
    Layers,
    HelpCircle,
    Lock
} from 'lucide-react';
import { useAiChat } from '../context/AiChatContext';

const SEMANTIC_EXAMPLES = [
    'Tìm tục ngữ nói về lòng biết ơn những người đã giúp đỡ mình',
    'Ca dao khuyên răn con cái hiếu thảo với cha mẹ',
    'Tục ngữ đúc kết về ý chí kiên trì, vượt khó thành công',
    'Ca dao về tinh thần tương thân tương ái, đùm bọc đồng bào',
    'Ca dao dự báo thời tiết và kinh nghiệm mùa màng của nhà nông',
];

const Explore = () => {
    const { openAiChat } = useAiChat();
    const { isAuthenticated } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const resultsRef = useRef(null);

    // Data states
    const [works, setWorks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    const [guestQuota, setGuestQuota] = useState({ remaining: null, limit: 5 });

    // Search Mode: 'keyword' (UC07) | 'semantic' (UC09)
    const initialMode = searchParams.get('mode') === 'semantic' ? 'semantic' : 'keyword';
    const initialQuery = searchParams.get('q') || searchParams.get('query') || '';

    const [searchMode, setSearchMode] = useState(initialMode);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [activeSearchQuery, setActiveSearchQuery] = useState(initialQuery);
    const [semanticConcept, setSemanticConcept] = useState(null);
    const [conceptDescription, setConceptDescription] = useState(null);
    const [aiInsight, setAiInsight] = useState(null);

    // Filters and sorting
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid');

    // Modal state (UC08, UC10, UC11)
    const [activeModalWork, setActiveModalWork] = useState(null);
    const [favoriteWorkIds, setFavoriteWorkIds] = useState(new Set());

    // Notification toast
    const [toastMessage, setToastMessage] = useState('');
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Đồng bộ searchParams từ URL khi người dùng bấm menu Navbar hoặc Back/Forward
    useEffect(() => {
        const urlMode = searchParams.get('mode') === 'semantic' ? 'semantic' : 'keyword';
        const urlQuery = searchParams.get('q') || searchParams.get('query') || '';
        const urlSlug = searchParams.get('slug');

        setSearchMode(urlMode);
        if (urlQuery !== searchQuery) {
            setSearchQuery(urlQuery);
            setActiveSearchQuery(urlQuery);
            fetchWorks(urlQuery, urlMode);
        }
        if (urlMode === 'keyword') {
            setAiInsight(null);
            setSemanticConcept(null);
            setConceptDescription(null);
        }
        if (urlSlug) {
            literatureService.getWorkBySlug(urlSlug).then((w) => {
                if (w) setActiveModalWork(w);
            }).catch(() => {});
        }
    }, [searchParams]);

    // Load user favorites on mount
    useEffect(() => {
        const loadFavorites = async () => {
            if (!isAuthenticated) return;
            try {
                const data = await favoriteService.getFavorites(1, 100);
                const ids = new Set((data.works || []).map((w) => w._id));
                setFavoriteWorkIds(ids);
            } catch (err) {
                // Ignore
            }
        };
        loadFavorites();
    }, [isAuthenticated]);

    // Fetch categories and tags
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

    // Fetch quota for Guest
    useEffect(() => {
        if (!isAuthenticated) {
            aiService.getQuota()
                .then((res) => {
                    if (res && res.remaining !== undefined) {
                        setGuestQuota({ remaining: res.remaining, limit: res.limit || 5 });
                    }
                })
                .catch(() => {});
        }
    }, [isAuthenticated]);

    // Fetch works (Keyword search UC07 vs Semantic Search UC09)
    const fetchWorks = async (targetQuery = searchQuery, targetMode = searchMode) => {
        setIsLoading(true);
        try {
            if (targetMode === 'semantic' && targetQuery.trim() !== '') {
                try {
                    const data = await literatureService.semanticSearch({
                        query: targetQuery,
                        limit: 24,
                    });
                    setWorks(data.works || []);
                    setSemanticConcept(data.semanticConcept);
                    setConceptDescription(data.conceptDescription);
                    setAiInsight(data.aiInsight || null);
                    if (data.quota && data.quota.remaining !== undefined) {
                        setGuestQuota({ remaining: data.quota.remaining, limit: data.quota.limit || 5 });
                    }
                } catch (err) {
                    if (err.code === 'GUEST_QUOTA_EXCEEDED' || err.status === 429) {
                        setGuestQuota({ remaining: 0, limit: 5 });
                        setShowQuotaModal(true);
                        setWorks([]);
                        setSemanticConcept('Đã hết lượt trải nghiệm AI miễn phí');
                        setConceptDescription('Bạn đã sử dụng hết 5 lượt tìm kiếm AI miễn phí hôm nay. Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục không giới hạn!');
                    } else {
                        throw err;
                    }
                }
            } else {
                setSemanticConcept(null);
                setConceptDescription(null);
                setAiInsight(null);
                const data = await literatureService.searchWorks({
                    query: targetQuery,
                    category: selectedCategory,
                    region: selectedRegion === 'all' ? '' : selectedRegion,
                    limit: 24,
                });
                let resultList = data.works || [];

                if (sortBy === 'popular') {
                    resultList.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
                } else if (sortBy === 'latest') {
                    resultList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                } else if (sortBy === 'title') {
                    resultList.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
                }
                setWorks(resultList);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách tác phẩm:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorks(searchQuery, searchMode);
    }, [selectedCategory, selectedRegion, sortBy, searchMode]);

    // Chuyển đổi tab chế độ tìm kiếm và đồng bộ ngay với URL
    const handleSwitchMode = (newMode) => {
        if (newMode === searchMode) return;
        if (newMode === 'semantic' && !isAuthenticated && guestQuota.remaining === 0) {
            setShowQuotaModal(true);
            return;
        }
        setSearchMode(newMode);

        const nextParams = new URLSearchParams(searchParams);
        if (newMode === 'semantic') {
            nextParams.set('mode', 'semantic');
        } else {
            nextParams.delete('mode');
        }
        setSearchParams(nextParams, { replace: true });

        if (newMode === 'keyword') {
            setAiInsight(null);
            setSemanticConcept(null);
            setConceptDescription(null);
        }

        fetchWorks(searchQuery, newMode);
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setActiveSearchQuery(searchQuery);

        const nextParams = new URLSearchParams(searchParams);
        if (searchQuery.trim()) {
            nextParams.set('q', searchQuery.trim());
        } else {
            nextParams.delete('q');
        }
        if (searchMode === 'semantic') {
            nextParams.set('mode', 'semantic');
        } else {
            nextParams.delete('mode');
        }
        setSearchParams(nextParams, { replace: true });

        fetchWorks(searchQuery, searchMode);
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    };

    const handleTagClick = (tag) => {
        setSearchQuery(tag);
        setActiveSearchQuery(tag);
        setSearchMode('keyword');

        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('mode');
        nextParams.set('q', tag);
        setSearchParams(nextParams, { replace: true });

        setTimeout(() => {
            fetchWorks(tag, 'keyword');
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    const handleSemanticExampleClick = (example) => {
        setSearchQuery(example);
        setActiveSearchQuery(example);
        setSearchMode('semantic');

        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('mode', 'semantic');
        nextParams.set('q', example);
        setSearchParams(nextParams, { replace: true });

        setTimeout(() => {
            fetchWorks(example, 'semantic');
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setActiveSearchQuery('');
        setSearchMode('keyword');
        setSelectedCategory('all');
        setSelectedRegion('all');
        setSortBy('popular');
        setAiInsight(null);
        setSemanticConcept(null);
        setConceptDescription(null);

        const nextParams = new URLSearchParams();
        setSearchParams(nextParams, { replace: true });
        setTimeout(() => fetchWorks('', 'keyword'), 50);
    };

    const handleToggleFavorite = async (e, workId) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            showToast('Vui lòng đăng nhập để lưu tác phẩm vào danh sách yêu thích!');
            return;
        }

        try {
            const res = await favoriteService.toggleFavorite(workId);
            setFavoriteWorkIds((prev) => {
                const next = new Set(prev);
                if (res.isFavorited) next.add(workId);
                else next.delete(workId);
                return next;
            });
            showToast(res.message);
        } catch (err) {
            showToast('Lỗi khi cập nhật yêu thích');
        }
    };

    const getCategoryBadgeClass = (category) => {
        switch (category) {
            case 'tuc-ngu':
                return 'bg-amber-100 text-amber-900 border-amber-300';
            case 'ca-dao':
                return 'bg-sky-100 text-sky-900 border-sky-300';
            case 'co-tich':
                return 'bg-emerald-100 text-emerald-900 border-emerald-300';
            case 'truyen-thuyet':
                return 'bg-purple-100 text-purple-900 border-purple-300';
            case 'than-thoai':
                return 'bg-orange-100 text-orange-900 border-orange-300';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-300';
        }
    };

    return (
        <div className="explore-page">
            {/* Toast notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* 1. HERO HEADER BANNER */}
            <section className="explore-hero">
                <div className="explore-hero-aura"></div>
                <div className="explore-hero-aura-indigo"></div>

                <div className="explore-hero-container">
                    {/* Breadcrumb */}
                    <div className="explore-breadcrumb">
                        <Link to="/" className="explore-breadcrumb-link">Trang chủ</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="explore-breadcrumb-current">Khám phá Ca dao & Tục ngữ</span>
                    </div>

                    {/* Header Main Grid: Left Title / Right Stats Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-8 space-y-3.5">
                            <div className="explore-badge">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Thư Viện Số Ca Dao - Tục Ngữ Việt Nam</span>
                            </div>
                            <h1 className="explore-hero-title font-heritage">
                                Khám Phá & Tra Cứu Ý Nghĩa Ca Dao, Tục Ngữ
                            </h1>
                            <p className="explore-hero-desc">
                                Tra cứu theo từ khóa hoặc tìm kiếm theo ý nghĩa bằng ngôn ngữ tự nhiên. Xem tường tận nghĩa đen, nghĩa bóng, bài học đạo đức và nguồn học thuật kiểm chứng.
                            </p>
                        </div>

                        {/* Quick Stats Widget */}
                        <div className="lg:col-span-4 flex justify-start lg:justify-end">
                            <div className="explore-quick-stats">
                                <div className="px-3 py-1 flex flex-col items-center">
                                    <BookOpen className="w-4 h-4 text-amber-400 mb-1 opacity-90" />
                                    <p className="explore-stat-value text-amber-300">
                                        {categories.find((c) => c.id === 'all')?.count || works.length}+
                                    </p>
                                    <p className="explore-stat-label">Câu ca dao</p>
                                </div>
                                <div className="px-3 py-1 border-x border-white/15 flex flex-col items-center">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1 opacity-90" />
                                    <p className="explore-stat-value text-emerald-300">100%</p>
                                    <p className="explore-stat-label">Kiểm chứng</p>
                                </div>
                                <div className="px-3 py-1 flex flex-col items-center">
                                    <Sparkles className="w-4 h-4 text-indigo-400 mb-1 opacity-90" />
                                    <p className="explore-stat-value text-indigo-300">AI RAG</p>
                                    <p className="explore-stat-label">Giải nghĩa</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEARCH BOX WITH MODE TOGGLE (UC07 vs UC09) */}
                    <div className="explore-search-wrapper">
                        {/* Search Mode Tabs */}
                        <div className="explore-mode-toggle">
                            <button
                                type="button"
                                onClick={() => handleSwitchMode('keyword')}
                                className={`explore-mode-btn ${searchMode === 'keyword' ? 'active-keyword' : 'inactive'}`}
                            >
                                <Search className="w-4 h-4" />
                                <span>Tìm kiếm từ khóa</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSwitchMode('semantic')}
                                className={`explore-mode-btn ${searchMode === 'semantic' ? 'active-semantic' : 'inactive'}`}
                            >
                                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                                <span>Tìm kiếm theo ý nghĩa (AI Ngữ nghĩa)</span>
                                {!isAuthenticated && guestQuota.remaining !== null && (
                                    <span className="ml-1.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                                        <Lock className="w-2.5 h-2.5" />
                                        <span>{guestQuota.remaining}/5</span>
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Search Input Box */}
                        <form onSubmit={handleSearchSubmit} className="explore-search-box">
                            {searchMode === 'semantic' ? (
                                <Sparkles className="explore-search-icon text-amber-500" />
                            ) : (
                                <Search className="explore-search-icon text-slate-400" />
                            )}
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={
                                    searchMode === 'semantic'
                                        ? 'Nhập câu hỏi bằng văn nói (vd: "Tìm tục ngữ nói về lòng biết ơn những người đã giúp đỡ mình")...'
                                        : 'Tìm theo từ, cụm từ, câu ca dao hoặc tác giả (vd: nhớ nguồn, ăn quả, công cha, Thạch Sanh)...'
                                }
                                className="explore-search-input"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="explore-search-clear"
                                    title="Xóa ô tìm kiếm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="explore-search-btn"
                            >
                                {searchMode === 'semantic' ? <Sparkles className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                                <span>Tra cứu</span>
                            </button>
                        </form>

                        {/* Suggestion tags */}
                        {searchMode === 'semantic' ? (
                            <div className="explore-tags-container">
                                <span className="flex items-center gap-1.5 text-xs text-amber-300/90 font-medium mr-1">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                    Ví dụ tìm kiếm ý nghĩa:
                                </span>
                                {SEMANTIC_EXAMPLES.map((ex, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleSemanticExampleClick(ex)}
                                        className="explore-tag-pill semantic"
                                    >
                                        {ex}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            popularTags.length > 0 && (
                                <div className="explore-tags-container">
                                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mr-1">
                                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                                        Từ khóa gợi ý:
                                    </span>
                                    {popularTags.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleTagClick(tag)}
                                            className="explore-tag-pill keyword"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </section>

            {/* 2. FILTER & SORT TOOLBAR */}
            <section className="explore-filter-section">
                <div className="explore-filter-card">
                    {/* Categories Filter Tabs */}
                    <div className="explore-cat-tabs">
                        <span className="explore-cat-label">
                            Thể loại:
                        </span>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`explore-cat-btn ${selectedCategory === cat.id
                                        ? 'active'
                                        : 'inactive'
                                    }`}
                            >
                                <span>{cat.label}</span>
                                {cat.count !== undefined && (
                                    <span
                                        className={`explore-cat-badge ${selectedCategory === cat.id
                                                ? 'active'
                                                : 'inactive'
                                            }`}
                                    >
                                        {cat.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Secondary Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-500">Vùng miền:</span>
                                <select
                                    value={selectedRegion}
                                    onChange={(e) => setSelectedRegion(e.target.value)}
                                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                                >
                                    <option value="all">Toàn quốc & Vùng miền</option>
                                    <option value="Bắc">Miền Bắc</option>
                                    <option value="Trung">Miền Trung</option>
                                    <option value="Nam">Miền Nam</option>
                                </select>
                            </div>

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

                            {(searchQuery || selectedCategory !== 'all' || selectedRegion !== 'all') && (
                                <button
                                    onClick={handleClearFilters}
                                    className="text-amber-800 hover:text-amber-900 underline font-semibold text-xs ml-2"
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                title="Chế độ lưới"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                title="Chế độ danh sách"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. SEMANTIC RECOGNITION BANNER (UC09) */}
            {semanticConcept && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-transparent border border-amber-300/80 flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                                    Đã nhận diện ý nghĩa:
                                </span>
                                <span className="px-2.5 py-0.5 rounded-md bg-amber-200/80 text-amber-950 font-bold text-xs">
                                    {semanticConcept}
                                </span>
                            </div>
                            <p className="text-xs text-slate-700 mt-1">
                                {conceptDescription || 'Hệ thống đã phân tích ngữ nghĩa và xếp hạng các câu ca dao, tục ngữ phù hợp nhất với câu hỏi của bạn.'}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* 4. WORKS DISPLAY AREA */}
            <section ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {searchMode === 'semantic' && activeSearchQuery && (
                    <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-between text-xs text-amber-950 shadow-xs">
                        <div className="flex items-center gap-2.5">
                            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>
                                Đang hiển thị kết quả phân tích AI theo ý nghĩa: <strong>&ldquo;{activeSearchQuery}&rdquo;</strong> (Đã tinh lọc các tác phẩm chuẩn xác nhất)
                            </span>
                        </div>
                        <button
                            onClick={handleClearFilters}
                            className="text-amber-800 hover:text-amber-950 font-bold text-[11px] underline ml-3 flex-shrink-0"
                        >
                            Xem tất cả
                        </button>
                    </div>
                )}

                {/* AI Insight Box: Luận giải & Lời khuyên trực tiếp từ Trợ lý AI */}
                {searchMode === 'semantic' && aiInsight && (
                    <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-100/50 border border-amber-200/90 shadow-sm relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-600/20">
                                <Sparkles className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="flex-grow space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                            VietHeritage AI • Luận Giải & Lời Khuyên
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-900 border border-amber-300">
                                            {aiInsight.source === 'gemini_ai' ? 'Mô hình Gemini 2.5 Flash' : 'Động cơ Tri thức Học thuật'}
                                        </span>
                                    </div>
                                    {aiInsight.highlightWork && (
                                        <span className="text-xs font-semibold text-amber-800">
                                            Khuyên đọc: <strong className="underline cursor-pointer hover:text-amber-950" onClick={() => {
                                                const found = works.find(w => w.title === aiInsight.highlightWork);
                                                if (found) setActiveModalWork(found);
                                            }}>{aiInsight.highlightWork}</strong>
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                                    {aiInsight.insight}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 font-heritage">
                            {searchMode === 'semantic' ? 'Kết Quả Phân Tích Ý Nghĩa' : 'Kho Tàng Ca Dao & Tục Ngữ'}
                        </h2>
                        <p className="text-xs text-slate-500">
                            Hiển thị <strong>{works.length}</strong> câu ca dao, tục ngữ chuẩn học thuật
                        </p>
                    </div>

                    <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Nguồn học thuật kiểm chứng (GS. Vũ Ngọc Phan, Nguyễn Lân)</span>
                    </div>
                </div>

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
                            </div>
                        ))}
                    </div>
                ) : works.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-xl mx-auto space-y-4 my-8 shadow-sm">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                            <Search className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 font-heritage">
                            Chưa tìm thấy câu ca dao, tục ngữ phù hợp
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                            Thử tìm kiếm với cụm từ khác như "uống nước nhớ nguồn", "công cha", "đoàn kết" hoặc xóa bộ lọc để xem toàn bộ kho tàng.
                        </p>
                        <button
                            onClick={handleClearFilters}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                        >
                            Xem tất cả tác phẩm
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {works.map((work) => {
                            const isFavorited = favoriteWorkIds.has(work._id);
                            return (
                                <article
                                    key={work._id}
                                    onClick={() => setActiveModalWork(work)}
                                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer"
                                >
                                    <div className="p-6 space-y-3.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(
                                                    work.category
                                                )}`}
                                            >
                                                {work.categoryName || (work.category === 'tuc-ngu' ? 'Tục ngữ' : 'Ca dao')}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                {work._semanticScore !== undefined && searchMode === 'semantic' && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                        Khớp {work._semanticScore}đ
                                                    </span>
                                                )}
                                                {work.topic && (
                                                    <span className="text-[11px] text-slate-500 font-medium">
                                                        {work.topic}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 font-heritage group-hover:text-amber-800 transition-colors line-clamp-2">
                                            "{work.title}"
                                        </h3>

                                        {work.quote && (
                                            <div className="p-3 bg-amber-50/70 rounded-xl border-l-2 border-amber-500 text-amber-950 font-heritage italic text-xs leading-relaxed">
                                                <PoemDisplay text={work.quote} size="xs" showQuotes={true} />
                                            </div>
                                        )}

                                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                            {work.literalMeaning || work.summary}
                                        </p>

                                        <p className="text-[11px] text-slate-400 italic line-clamp-1">
                                            Nguồn: {work.source}
                                        </p>
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
                                            {/* Favorite toggle (UC12) */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleToggleFavorite(e, work._id)}
                                                className={`p-2 rounded-lg transition ${isFavorited
                                                        ? 'text-rose-600 bg-rose-50 font-bold'
                                                        : 'text-slate-400 hover:text-rose-600 hover:bg-white'
                                                    }`}
                                                title={isFavorited ? 'Bỏ lưu' : 'Lưu vào mục yêu thích'}
                                            >
                                                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                                            </button>

                                            {/* View detail button (UC08) */}
                                            <button
                                                type="button"
                                                onClick={() => setActiveModalWork(work)}
                                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                                            >
                                                <span>Chi tiết</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {works.map((work) => {
                            const isFavorited = favoriteWorkIds.has(work._id);
                            return (
                                <article
                                    key={work._id}
                                    onClick={() => setActiveModalWork(work)}
                                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group cursor-pointer"
                                >
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(
                                                    work.category
                                                )}`}
                                            >
                                                {work.categoryName || (work.category === 'tuc-ngu' ? 'Tục ngữ' : 'Ca dao')}
                                            </span>
                                            {work._semanticScore !== undefined && searchMode === 'semantic' && (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                    Khớp {work._semanticScore}đ
                                                </span>
                                            )}
                                            {work.topic && (
                                                <span className="text-xs text-slate-500">Chủ đề: {work.topic}</span>
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition font-heritage">
                                            "{work.title}"
                                        </h3>

                                        <p className="text-xs text-slate-600 line-clamp-2">
                                            {work.literalMeaning || work.summary}
                                        </p>

                                        <p className="text-[11px] text-slate-400 italic">
                                            Nguồn: {work.source}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        <button
                                            type="button"
                                            onClick={(e) => handleToggleFavorite(e, work._id)}
                                            className={`p-2 rounded-xl border ${isFavorited
                                                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-slate-200'
                                                }`}
                                        >
                                            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveModalWork(work)}
                                            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Modal xem chi tiết tác phẩm (UC08, UC10, UC11) */}
            <WorkDetailModal
                work={activeModalWork}
                isOpen={!!activeModalWork}
                onClose={() => setActiveModalWork(null)}
                onWorkSelect={(newWork) => setActiveModalWork(newWork)}
            />

            {/* Modal thông báo hết quota tìm kiếm ngữ nghĩa cho Guest */}
            <GuestQuotaModal
                isOpen={showQuotaModal}
                onClose={() => setShowQuotaModal(false)}
                title="Hết Lượt Tìm Kiếm Ngữ Nghĩa Hôm Nay"
                message="Bạn đã dùng hết 5 lượt tìm kiếm theo ý nghĩa miễn phí hôm nay. Hãy đăng ký hoặc đăng nhập tài khoản để tiếp tục tra cứu ngữ nghĩa không giới hạn!"
            />
        </div>
    );
};

export default Explore;
