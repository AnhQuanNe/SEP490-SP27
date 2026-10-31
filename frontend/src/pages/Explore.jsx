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
    MapPin,
    ArrowRight,
    CheckCircle2,
    Heart,
    Quote,
    X,
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
    Lock,
    RotateCcw,
    ArrowDown
} from 'lucide-react';
import { useAiChat } from '../context/AiChatContext';

const PAGE_SIZE = 12;

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
    const searchInputRef = useRef(null);

    // Data states
    const [works, setWorks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    const [guestQuota, setGuestQuota] = useState({ remaining: null, limit: 5 });

    // Pagination & Load More states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalWorks, setTotalWorks] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

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

    // Render huy hiệu đánh giá độ tương quan Cosine Vector (Google Text Embedding 768D)
    const renderSemanticBadge = (score) => {
        if (score === undefined || score === null) return null;
        let badgeClass = 'bg-blue-50 text-blue-900 border-blue-200';
        let label = 'Phù hợp';
        let dotColor = 'bg-blue-500';

        if (score >= 68) {
            badgeClass = 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-1 ring-emerald-400/30';
            label = 'Xuất sắc';
            dotColor = 'bg-emerald-500';
        } else if (score >= 62) {
            badgeClass = 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-400/20';
            label = 'Rất cao';
            dotColor = 'bg-amber-500';
        }

        return (
            <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border shadow-2xs ${badgeClass}`}
                title={`Độ tương đồng Cosine Similarity: ${score}% (Không gian vector 768 chiều)`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
                <span>Khớp {score}%</span>
                <span className="opacity-40">•</span>
                <span>{label}</span>
            </span>
        );
    };

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
                    setCurrentPage(1);
                    setTotalWorks(data.works?.length || 0);
                    setHasMore(false);
                    setSemanticConcept(data.semanticConcept);
                    setConceptDescription(data.conceptDescription);
                    setAiInsight(data.aiInsight || null);
                    if (data.quota && data.quota.remaining !== undefined) {
                        setGuestQuota({ remaining: data.quota.remaining, limit: data.quota.limit || 5 });
                    }
                } catch (err) {
                    if (err.code === 'GUEST_QUOTA_EXCEEDED' || err.status === 429) {
                        setShowQuotaModal(true);
                        setWorks([]);
                        setSemanticConcept(null);
                        setAiInsight(null);
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
                    page: 1,
                    limit: PAGE_SIZE,
                });
                let list = data.works || [];

                // Frontend sorting
                if (sortBy === 'popular') {
                    list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
                } else if (sortBy === 'latest') {
                    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                } else if (sortBy === 'title') {
                    list.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
                }
                setWorks(list);
                setCurrentPage(1);
                const total = data.pagination?.total || list.length;
                setTotalWorks(total);
                setHasMore(1 < (data.pagination?.totalPages || 1));
            }
        } catch (err) {
            console.error('Lỗi khi tải tác phẩm:', err);
            setWorks([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger fetch on filter change
    useEffect(() => {
        if (searchMode === 'keyword') {
            fetchWorks();
        }
    }, [selectedCategory, selectedRegion, sortBy]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setActiveSearchQuery(searchQuery);

        const nextParams = new URLSearchParams(searchParams);
        if (searchQuery.trim()) {
            nextParams.set('q', searchQuery.trim());
        } else {
            nextParams.delete('q');
            nextParams.delete('query');
        }
        nextParams.set('mode', searchMode);
        setSearchParams(nextParams, { replace: true });

        fetchWorks(searchQuery, searchMode);

        // Tự động cuộn mượt xuống khu vực kết quả sau khi bấm Tra cứu (Auto-scroll UX)
        setTimeout(() => {
            if (resultsRef.current) {
                resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 150);
    };

    // Tối ưu hành vi nút xóa nhanh X trong ô tìm kiếm
    const handleClearSearchInput = () => {
        setSearchQuery('');
        // Nếu có truy vấn đang chạy, xóa bỏ và tự động tải lại danh sách
        if (activeSearchQuery || searchParams.get('q') || searchParams.get('query')) {
            setActiveSearchQuery('');
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('q');
            nextParams.delete('query');
            setSearchParams(nextParams, { replace: true });

            if (searchMode === 'semantic') {
                setAiInsight(null);
                setSemanticConcept(null);
                setConceptDescription(null);
                fetchWorks('', 'keyword');
            } else {
                fetchWorks('', 'keyword');
            }
        }

        // Tự động focus lại vào ô input để người dùng sẵn sàng gõ tiếp
        setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, 50);
    };

    // Tải thêm tác phẩm (Load More)
    const handleLoadMore = async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const data = await literatureService.searchWorks({
                query: activeSearchQuery || searchQuery,
                category: selectedCategory,
                region: selectedRegion === 'all' ? '' : selectedRegion,
                page: nextPage,
                limit: PAGE_SIZE,
            });

            let nextWorks = data.works || [];
            if (sortBy === 'popular') {
                nextWorks.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
            } else if (sortBy === 'latest') {
                nextWorks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else if (sortBy === 'title') {
                nextWorks.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
            }

            setWorks((prev) => [...prev, ...nextWorks]);
            setCurrentPage(nextPage);
            const total = data.pagination?.total || (works.length + nextWorks.length);
            setTotalWorks(total);
            setHasMore(nextPage < (data.pagination?.totalPages || 1));
        } catch (err) {
            console.error('Lỗi khi tải thêm tác phẩm:', err);
            showToast('Không thể tải thêm tác phẩm lúc này');
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleSwitchMode = (newMode) => {
        if (newMode === searchMode) return;
        setSearchMode(newMode);

        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('mode', newMode);
        if (searchQuery.trim()) {
            nextParams.set('q', searchQuery.trim());
        }
        setSearchParams(nextParams, { replace: true });

        if (newMode === 'keyword') {
            setAiInsight(null);
            setSemanticConcept(null);
            setConceptDescription(null);
        }

        fetchWorks(searchQuery, newMode);
    };

    const handleTagClick = (tag) => {
        setSearchQuery(tag);
        setActiveSearchQuery(tag);
        setSearchMode('keyword');

        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('q', tag);
        nextParams.set('mode', 'keyword');
        setSearchParams(nextParams, { replace: true });

        setAiInsight(null);
        setSemanticConcept(null);
        setConceptDescription(null);
        fetchWorks(tag, 'keyword');
    };

    const handleSemanticExampleClick = (exampleQuery) => {
        setSearchQuery(exampleQuery);
        setActiveSearchQuery(exampleQuery);
        setSearchMode('semantic');

        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('q', exampleQuery);
        nextParams.set('mode', 'semantic');
        setSearchParams(nextParams, { replace: true });

        fetchWorks(exampleQuery, 'semantic');

        setTimeout(() => {
            if (resultsRef.current) {
                resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 150);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setActiveSearchQuery('');
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
                return 'bg-amber-50 text-amber-900 border-amber-200/90';
            case 'ca-dao':
                return 'bg-emerald-50 text-emerald-900 border-emerald-200/90';
            case 'co-tich':
                return 'bg-teal-50 text-teal-900 border-teal-200/90';
            case 'truyen-thuyet':
                return 'bg-indigo-50 text-indigo-900 border-indigo-200/90';
            case 'than-thoai':
                return 'bg-purple-50 text-purple-900 border-purple-200/90';
            default:
                return 'bg-stone-100 text-stone-800 border-stone-200/90';
        }
    };

    return (
        <div className="explore-page">
            {/* Toast notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-stone-900/95 backdrop-blur-md text-amber-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* 1. HERO HEADER BANNER (KHU VỰC KHÁM PHÁ HOÀNG GIA) */}
            <section className="explore-hero">
                <div className="explore-hero-glow-gold"></div>
                <div className="explore-hero-glow-crimson"></div>

                <div className="explore-hero-container">
                    {/* Breadcrumb */}
                    <div className="explore-breadcrumb">
                        <Link to="/" className="explore-breadcrumb-link">Trang chủ</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                        <span className="explore-breadcrumb-current">Khám phá Ca dao & Tục ngữ</span>
                    </div>

                    {/* Header Main Grid: Left Title / Right Stats Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
                        <div className="lg:col-span-8 space-y-3.5 text-left">
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

                        {/* Quick Stats Widget (Cột Phải Đúng Chuẩn Kỹ Thuật) */}
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
                                    <Sparkles className="w-4 h-4 text-indigo-300 mb-1 opacity-90" />
                                    <p className="explore-stat-value text-indigo-200">768D</p>
                                    <p className="explore-stat-label">Vector Embedding</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEARCH HUB WITH MODE TOGGLE (UC07 vs UC09) */}
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
                                    <span className="ml-1.5 text-[10px] font-semibold bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                                        <Lock className="w-2.5 h-2.5" />
                                        <span>{guestQuota.remaining}/5</span>
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Search Input Box */}
                        <form onSubmit={handleSearchSubmit} className="explore-search-box">
                            {searchMode === 'semantic' ? (
                                <Sparkles className="explore-search-icon text-amber-600" />
                            ) : (
                                <Search className="explore-search-icon text-stone-400" />
                            )}
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={
                                    searchMode === 'semantic'
                                        ? 'Nhập câu hỏi bằng văn nói (vd: "Tìm tục ngữ nói về lòng biết ơn những người đã giúp đỡ mình")...'
                                        : 'Tìm theo từ khóa, câu ca dao hoặc tác giả (vd: nhớ nguồn, ăn quả, công cha, Thạch Sanh)...'
                                }
                                className="explore-search-input"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClearSearchInput}
                                    className="explore-search-clear"
                                    title="Xóa ô tìm kiếm và tải lại"
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
                                <span className="flex items-center gap-1.5 text-xs text-amber-200/90 font-medium mr-1">
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
                                    <span className="flex items-center gap-1.5 text-xs text-stone-300 font-medium mr-1">
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

            {/* 2. FILTER & SORT TOOLBAR (HERITAGE CONTROL DECK) */}
            <section className="explore-filter-section">
                <div className="explore-filter-card">
                    {/* Categories Filter Tabs */}
                    <div className="explore-cat-tabs">
                        <span className="explore-cat-label">
                            <Layers className="w-3.5 h-3.5 text-amber-700" />
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
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-900/10 text-xs">
                        <div className="flex items-center gap-3.5 flex-wrap">
                            <div className="flex items-center gap-1.5 text-stone-700">
                                <MapPin className="w-4 h-4 text-amber-700" />
                                <span className="font-semibold text-stone-600">Vùng miền:</span>
                                <select
                                    value={selectedRegion}
                                    onChange={(e) => setSelectedRegion(e.target.value)}
                                    className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-medium outline-none focus:ring-1 focus:ring-amber-600 cursor-pointer"
                                >
                                    <option value="all">Toàn quốc & Vùng miền</option>
                                    <option value="Bắc">Miền Bắc</option>
                                    <option value="Trung">Miền Trung</option>
                                    <option value="Nam">Miền Nam</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1.5 text-stone-700">
                                <SlidersHorizontal className="w-4 h-4 text-amber-700" />
                                <span className="font-semibold text-stone-600">Sắp xếp:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-medium outline-none focus:ring-1 focus:ring-amber-600 cursor-pointer"
                                >
                                    <option value="popular">Xem nhiều nhất</option>
                                    <option value="latest">Mới cập nhật</option>
                                    <option value="title">Tên tiêu đề (A-Z)</option>
                                </select>
                            </div>

                            {(searchQuery || selectedCategory !== 'all' || selectedRegion !== 'all') && (
                                <button
                                    onClick={handleClearFilters}
                                    className="text-amber-800 hover:text-amber-950 font-bold text-xs ml-2 flex items-center gap-1 underline cursor-pointer"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Xóa bộ lọc</span>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/60">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'
                                    }`}
                                title="Chế độ lưới"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'
                                    }`}
                                title="Chế độ danh sách"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. WORKS DISPLAY AREA & UNIFIED AI INTELLIGENCE DASHBOARD */}
            <section ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* UNIFIED AI CULTURAL INTELLIGENCE PANEL (UC09) */}
                {searchMode === 'semantic' && (semanticConcept || aiInsight || activeSearchQuery) && (
                    <div className="explore-ai-panel mb-8">
                        {/* Panel Header */}
                        <div className="explore-ai-panel-header">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
                                    <Sparkles className="w-4 h-4 animate-pulse" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                                    Vector Semantic Search
                                </span>
                                {semanticConcept && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 font-bold text-xs border border-amber-300">
                                        Chủ đề: {semanticConcept}
                                    </span>
                                )}
                                {aiInsight?.source && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                                        {aiInsight.source?.includes('gemini') ? 'Mô hình Gemini Flash AI' : 'Động cơ Tri thức'}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                                {activeSearchQuery && (
                                    <span className="text-stone-600 hidden md:inline">
                                        Ý nghĩa: <strong className="text-stone-900 font-semibold">&ldquo;{activeSearchQuery}&rdquo;</strong>
                                    </span>
                                )}
                                <button
                                    onClick={handleClearFilters}
                                    className="text-amber-900 hover:text-amber-950 font-bold text-xs underline flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Xem tất cả tác phẩm</span>
                                </button>
                            </div>
                        </div>

                        {/* Panel Body: Gemini Flash Real-Time Insight */}
                        {aiInsight && (
                            <div className="explore-ai-panel-body">
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                            <Quote className="w-3.5 h-3.5 text-amber-600" />
                                            VietHeritage AI • Luận Giải Triết Lý & Đạo Đức
                                        </span>
                                        {aiInsight.highlightWork && (
                                            <span className="text-xs font-semibold text-amber-800">
                                                Tác phẩm tiêu biểu: <strong className="underline cursor-pointer hover:text-amber-950" onClick={() => {
                                                    const found = works.find(w => w.title === aiInsight.highlightWork);
                                                    if (found) setActiveModalWork(found);
                                                }}>{aiInsight.highlightWork}</strong>
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-[13.5px] text-stone-800 leading-relaxed font-medium">
                                        {aiInsight.insight}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Panel Footer: Cosine AI Scale Legend */}
                        <div className="explore-ai-panel-footer">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-stone-700">
                                <span className="font-bold text-amber-950 flex items-center gap-1">
                                    <HelpCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                                    Thang đo Cosine AI:
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <strong>&ge; 68%:</strong> Xuất sắc (Cùng ý nghĩa sâu xa)
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    <strong>62% - 67%:</strong> Rất cao (Tương đồng cao)
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <strong>60% - 61%:</strong> Phù hợp
                                </span>
                                <span className="text-stone-500 italic hidden sm:inline">
                                    (&lt; 60% được coi là nhiễu và AI đã tự động loại bỏ)
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-heritage tracking-tight">
                            {searchMode === 'semantic' ? 'Kết Quả Phân Tích Ý Nghĩa' : 'Kho Tàng Ca Dao & Tục Ngữ'}
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            {searchMode === 'semantic'
                                ? <>Hiển thị <strong>{works.length}</strong> câu ca dao, tục ngữ phù hợp nhất (Đã lọc theo độ tương quan)</>
                                : <>Đang hiển thị <strong>{works.length}</strong> / <strong>{totalWorks || works.length}</strong> câu ca dao, tục ngữ</>
                            }
                        </p>
                    </div>

                    <div className="text-xs text-stone-600 hidden sm:flex items-center gap-1.5 font-medium px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Nguồn kiểm chứng: GS. Vũ Ngọc Phan, GS. Nguyễn Lân</span>
                    </div>
                </div>

                {/* Work Cards Loading / Empty / Grid / List */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white/80 rounded-2xl p-6 border border-stone-200 animate-pulse space-y-4">
                                <div className="flex justify-between">
                                    <div className="h-5 bg-stone-200 rounded-md w-24"></div>
                                    <div className="h-5 bg-stone-200 rounded-md w-16"></div>
                                </div>
                                <div className="h-7 bg-stone-200 rounded-md w-3/4"></div>
                                <div className="h-16 bg-stone-100 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                ) : works.length === 0 ? (
                    <div className="bg-[#fffdfa] rounded-3xl p-12 text-center border border-amber-900/15 max-w-xl mx-auto space-y-4 my-8 shadow-sm">
                        <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-amber-200">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 font-heritage">
                            Chưa tìm thấy câu ca dao, tục ngữ phù hợp
                        </h3>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                            Thử tìm kiếm với cụm từ khác như "uống nước nhớ nguồn", "công cha", "đoàn kết" hoặc xóa bộ lọc để xem toàn bộ kho tàng.
                        </p>
                        <button
                            onClick={handleClearFilters}
                            className="px-5 py-2.5 bg-gradient-to-r from-amber-800 to-amber-950 text-amber-50 rounded-xl text-xs font-bold hover:shadow-md transition cursor-pointer"
                        >
                            Xem tất cả tác phẩm
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {works.map((work) => {
                            const isFavorited = favoriteWorkIds.has(work._id);
                            const cleanTitle = (work.title || '').replace(/^["“']|["”']$/g, '').trim();

                            return (
                                <article
                                    key={work._id}
                                    onClick={() => setActiveModalWork(work)}
                                    className="explore-card group"
                                >
                                    <div className="p-5 sm:p-6 space-y-3.5">
                                        {/* Top Badges */}
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(
                                                    work.category
                                                )}`}
                                            >
                                                {work.categoryName || (work.category === 'tuc-ngu' ? 'Tục ngữ Việt Nam' : 'Ca dao Dân ca')}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                {work._semanticScore !== undefined && searchMode === 'semantic' && renderSemanticBadge(work._semanticScore)}
                                                {work.topic && (
                                                    <span className="text-[11px] text-stone-500 font-medium px-2 py-0.5 rounded-md bg-stone-100/80">
                                                        {work.topic}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg font-bold text-stone-900 font-heritage group-hover:text-amber-800 transition-colors line-clamp-2">
                                            &ldquo;{cleanTitle}&rdquo;
                                        </h3>

                                        {/* Poetic Inscription Callout */}
                                        {work.quote && (
                                            <div className="explore-poem-box">
                                                <PoemDisplay text={work.quote} size="xs" showQuotes={false} />
                                            </div>
                                        )}

                                        {/* Meaning Excerpt */}
                                        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                                            {work.literalMeaning || work.summary}
                                        </p>

                                        {/* Academic Source */}
                                        <p className="text-[11px] text-stone-400 italic line-clamp-1 flex items-center gap-1">
                                            <BookOpen className="w-3 h-3 text-stone-400 flex-shrink-0" />
                                            <span>Nguồn: {work.source}</span>
                                        </p>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-5 sm:px-6 py-3.5 bg-stone-50/80 border-t border-amber-900/10 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3.5 text-stone-400 font-medium">
                                            <span className="flex items-center gap-1" title="Lượt xem">
                                                <Eye className="w-3.5 h-3.5 text-stone-400" />
                                                {work.viewsCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1" title="Lượt thích">
                                                <ThumbsUp className="w-3.5 h-3.5 text-stone-400" />
                                                {work.likesCount || 0}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Favorite toggle (UC12) */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleToggleFavorite(e, work._id)}
                                                className={`p-2 rounded-xl transition cursor-pointer ${isFavorited
                                                        ? 'text-rose-600 bg-rose-50 font-bold shadow-2xs'
                                                        : 'text-stone-400 hover:text-rose-600 hover:bg-stone-100'
                                                    }`}
                                                title={isFavorited ? 'Bỏ lưu' : 'Lưu vào mục yêu thích'}
                                            >
                                                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                                            </button>

                                            {/* View detail button (UC08) */}
                                            <button
                                                type="button"
                                                onClick={() => setActiveModalWork(work)}
                                                className="explore-detail-btn cursor-pointer"
                                            >
                                                <span>Chi tiết</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
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
                            const cleanTitle = (work.title || '').replace(/^["“']|["”']$/g, '').trim();

                            return (
                                <article
                                    key={work._id}
                                    onClick={() => setActiveModalWork(work)}
                                    className="bg-[#fffdfa] rounded-2xl border border-amber-900/15 p-5 shadow-sm hover:shadow-lg hover:border-amber-600/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group cursor-pointer"
                                >
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(
                                                    work.category
                                                )}`}
                                            >
                                                {work.categoryName || (work.category === 'tuc-ngu' ? 'Tục ngữ Việt Nam' : 'Ca dao Dân ca')}
                                            </span>
                                            {work._semanticScore !== undefined && searchMode === 'semantic' && renderSemanticBadge(work._semanticScore)}
                                            {work.topic && (
                                                <span className="text-xs text-stone-500 font-medium px-2 py-0.5 rounded-md bg-stone-100">
                                                    Chủ đề: {work.topic}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-800 transition font-heritage">
                                            &ldquo;{cleanTitle}&rdquo;
                                        </h3>

                                        <p className="text-xs text-stone-600 line-clamp-2">
                                            {work.literalMeaning || work.summary}
                                        </p>

                                        <p className="text-[11px] text-stone-400 italic flex items-center gap-1">
                                            <BookOpen className="w-3 h-3 text-stone-400 flex-shrink-0" />
                                            <span>Nguồn: {work.source}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        <button
                                            type="button"
                                            onClick={(e) => handleToggleFavorite(e, work._id)}
                                            className={`p-2.5 rounded-xl border transition cursor-pointer ${isFavorited
                                                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                                                    : 'bg-stone-50 hover:bg-stone-100 text-stone-400 border-stone-200'
                                                }`}
                                            title={isFavorited ? 'Bỏ lưu' : 'Lưu vào mục yêu thích'}
                                        >
                                            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveModalWork(work)}
                                            className="explore-detail-btn cursor-pointer py-2 px-4"
                                        >
                                            <span>Xem chi tiết</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* 5. LOAD MORE & PROGRESS CONTROLLER */}
                {!isLoading && works.length > 0 && searchMode === 'keyword' && (
                    <div className="mt-12 text-center max-w-md mx-auto space-y-4">
                        {/* Progress Bar & Counter */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
                                <span>Tiến trình khám phá</span>
                                <span>
                                    Đang xem <strong className="text-amber-950 font-bold">{works.length}</strong> / <strong>{totalWorks || works.length}</strong> tác phẩm
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-stone-200/80 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-800 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.round((works.length / Math.max(1, totalWorks || works.length)) * 100))}%` }}
                                />
                            </div>
                        </div>

                        {/* Button or Completion Notice */}
                        {hasMore ? (
                            <button
                                type="button"
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#220707] via-[#450a0a] to-[#78350f] hover:from-[#450a0a] hover:to-[#92400e] text-amber-100 border border-amber-500/40 font-bold text-xs shadow-md shadow-amber-950/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-60"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                                        <span>Đang tải thêm tác phẩm...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Xem thêm {Math.min(PAGE_SIZE, (totalWorks || works.length) - works.length)} tác phẩm tiếp theo</span>
                                        <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="py-3 px-6 rounded-2xl bg-amber-50/70 border border-amber-900/15 text-amber-950 text-xs font-serif italic flex items-center justify-center gap-2 shadow-2xs">
                                <span>❖ Bạn đã khám phá toàn bộ {totalWorks || works.length} tác phẩm trong kho tàng ❖</span>
                            </div>
                        )}
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
