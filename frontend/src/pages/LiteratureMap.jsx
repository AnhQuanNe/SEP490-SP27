import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import locationService from '../services/location.service';
import CulturalMap from '../components/map/CulturalMap';
import WorkDetailModal from '../components/common/WorkDetailModal';
import {
    MapPin,
    Compass,
    BookOpen,
    Filter,
    ShieldCheck,
    ChevronRight,
    X,
    Info,
    FileText,
    Landmark,
    Sparkles,
    Search,
    Loader2,
    Maximize2,
} from 'lucide-react';

const CATEGORY_FILTERS = [
    { id: 'all', label: 'Tất cả thể loại' },
    { id: 'ca-dao', label: 'Ca dao Dân ca' },
    { id: 'tuc-ngu', label: 'Tục ngữ Việt Nam' },
    { id: 'truyen-thuyet', label: 'Truyền thuyết' },
    { id: 'co-tich', label: 'Cổ tích' },
    { id: 'trung-dai', label: 'Văn học Trung đại' },
];

const REGION_FILTERS = [
    { id: 'all', label: 'Toàn quốc' },
    { id: 'Bắc', label: 'Miền Bắc' },
    { id: 'Trung', label: 'Miền Trung & Biển đảo' },
    { id: 'Nam', label: 'Miền Nam' },
];

const LiteratureMap = () => {
    // 2 Chế độ hiển thị: 'places' (Địa phương) | 'ancient' (Cổ danh & Cửa ải)
    const [mapMode, setMapMode] = useState('places');

    // =========================================================================
    // 1. STATE BẢN ĐỒ ĐỊA PHƯƠNG (PLACES MODE)
    // =========================================================================
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [locations, setLocations] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationWorks, setLocationWorks] = useState([]);
    const [isLoadingWorks, setIsLoadingWorks] = useState(false);
    const [workTotal, setWorkTotal] = useState(0);

    // =========================================================================
    // 2. STATE CỔ DANH & CỬA ẢI LỊCH SỬ (ANCIENT MODE)
    // =========================================================================
    const [ancientLandmarks, setAncientLandmarks] = useState([]);
    const [selectedAncientLandmark, setSelectedAncientLandmark] = useState(null);
    const [ancientSearchQuery, setAncientSearchQuery] = useState('');
    const [isResolvingAncient, setIsResolvingAncient] = useState(false);
    const [ancientResolveNotice, setAncientResolveNotice] = useState(null);
    const [ancientResolveError, setAncientResolveError] = useState(null);
    const [ancientNotFoundData, setAncientNotFoundData] = useState(null);
    const [ancientImageViewMode, setAncientImageViewMode] = useState('split'); // 'split' | 'ancient' | 'modern'
    const [activeLightboxImage, setActiveLightboxImage] = useState(null);

    // Modal xem chi tiết tác phẩm
    const [activeModalWork, setActiveModalWork] = useState(null);
    // Mobile drawer state
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    // Tải danh sách markers địa phương khi vào trang hoặc đổi bộ lọc
    useEffect(() => {
        let isMounted = true;
        const fetchMapData = async () => {
            try {
                setIsLoadingLocations(true);
                const data = await locationService.getMapWorks({
                    category: selectedCategory,
                    region: selectedRegion,
                });
                if (!isMounted) return;
                setLocations(data?.markers || []);
            } catch (err) {
                console.error('Lỗi tải dữ liệu bản đồ văn hóa:', err);
            } finally {
                if (isMounted) setIsLoadingLocations(false);
            }
        };

        fetchMapData();
        return () => {
            isMounted = false;
        };
    }, [selectedCategory, selectedRegion]);

    // Tải dữ liệu ban đầu cho Cổ danh & Cửa ải Lịch sử
    useEffect(() => {
        let isMounted = true;
        const fetchInitialAiMapData = async () => {
            try {
                const ancientRes = await locationService.getAncientLandmarks();
                if (!isMounted) return;

                const ancientList = Array.isArray(ancientRes) ? ancientRes : ancientRes?.data || [];

                if (ancientList.length > 0) {
                    setAncientLandmarks(ancientList);
                    setSelectedAncientLandmark(ancientList[0]);
                }
            } catch (err) {
                console.error('Lỗi khởi tạo dữ liệu Cổ danh & Cửa ải:', err);
            }
        };

        fetchInitialAiMapData();
        return () => {
            isMounted = false;
        };
    }, []);

    // Tải danh sách tác phẩm khi chọn địa phương
    const selectedLocationId = selectedLocation?._id || selectedLocation?.slug || null;
    useEffect(() => {
        if (!selectedLocationId || mapMode !== 'places') return;

        let isMounted = true;
        const fetchWorksForLocation = async () => {
            try {
                setIsLoadingWorks(true);
                const res = await locationService.getLocationWorks(selectedLocationId, {
                    category: selectedCategory,
                    limit: 20,
                });
                if (!isMounted) return;
                setLocationWorks(res?.works || []);
                setWorkTotal(res?.pagination?.total || 0);
            } catch (err) {
                console.error('Lỗi tải tác phẩm của địa phương:', err);
                if (isMounted) {
                    setLocationWorks([]);
                    setWorkTotal(0);
                }
            } finally {
                if (isMounted) setIsLoadingWorks(false);
            }
        };

        fetchWorksForLocation();
        return () => {
            isMounted = false;
        };
    }, [selectedLocationId, selectedCategory, mapMode]);

    // Tra cứu / Giải mã Cổ danh sang GPS
    const handleResolveAncientLandmark = async (searchTarget = ancientSearchQuery) => {
        const queryClean = (searchTarget || ancientSearchQuery || '').trim();
        if (!queryClean) return;

        try {
            setIsResolvingAncient(true);
            setAncientResolveNotice(null);
            setAncientResolveError(null);
            setAncientNotFoundData(null);

            const res = await locationService.resolveAncientLandmark(queryClean);
            const resolvedLandmark = res?.landmark || res?.data?.landmark;

            // Nếu backend báo không tìm thấy hoặc người dùng nhập điểm không hợp lệ
            if (res?.found === false || !resolvedLandmark) {
                // Thử tìm kiếm mờ trong danh sách lưu sẵn
                const cleanLower = queryClean.toLowerCase();
                const normClean = cleanLower
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd');

                const localMatch = ancientLandmarks.find((item) => {
                    const normName = (item.ancientName || '')
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/đ/g, 'd');
                    const normSlug = (item.slug || '').replace(/-/g, ' ');
                    return (
                        item.ancientName?.toLowerCase().includes(cleanLower) ||
                        normName.includes(normClean) ||
                        normSlug.includes(normClean) ||
                        normClean.includes(normSlug) ||
                        item.tags?.some((t) => t.toLowerCase().includes(cleanLower)) ||
                        item.historicalEvent?.toLowerCase().includes(cleanLower)
                    );
                });

                if (localMatch) {
                    setSelectedAncientLandmark(localMatch);
                    setAncientResolveNotice(`Đã tìm thấy "${localMatch.ancientName}" từ kho di tích có sẵn.`);
                    setIsMobileDrawerOpen(true);
                    return;
                }

                // Nếu không khớp di tích nào -> hiển thị hộp gợi ý thông minh
                setAncientNotFoundData({
                    query: queryClean,
                    message: res?.message || `Không tìm thấy di tích hoặc địa danh lịch sử nào phù hợp với "${queryClean}".`,
                    suggestions: res?.suggestions || ancientLandmarks.slice(0, 6),
                });
                return;
            }

            setSelectedAncientLandmark(resolvedLandmark);
            if (res?.message) {
                setAncientResolveNotice(res.message);
            }
            setIsMobileDrawerOpen(true);
        } catch (err) {
            console.warn('Lỗi kết nối tra cứu trực tuyến, kích hoạt tìm kiếm ngoại tuyến:', err);

            // Tự động tìm kiếm ngoại tuyến (offline fallback) trong kho di tích đã nạp sẵn
            const cleanLower = queryClean.toLowerCase();
            const normClean = cleanLower
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd');

            const localMatch = ancientLandmarks.find((item) => {
                const normName = (item.ancientName || '')
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd');
                const normSlug = (item.slug || '').replace(/-/g, ' ');
                return (
                    item.ancientName?.toLowerCase().includes(cleanLower) ||
                    normName.includes(normClean) ||
                    normSlug.includes(normClean) ||
                    normClean.includes(normSlug) ||
                    item.tags?.some((t) => t.toLowerCase().includes(cleanLower)) ||
                    item.historicalEvent?.toLowerCase().includes(cleanLower)
                );
            });

            if (localMatch) {
                setSelectedAncientLandmark(localMatch);
                setAncientResolveNotice(`Đã tìm thấy "${localMatch.ancientName}" từ kho lưu trữ di tích văn hóa sẵn có.`);
                setIsMobileDrawerOpen(true);
            } else {
                setAncientNotFoundData({
                    query: queryClean,
                    message: `Không tìm thấy di tích lịch sử nào phù hợp với từ khóa "${queryClean}".`,
                    suggestions: ancientLandmarks.slice(0, 6),
                });
            }
        } finally {
            setIsResolvingAncient(false);
        }
    };

    // Xử lý chọn địa phương
    const handleSelectLocation = (loc) => {
        if (!loc) return;
        setSelectedLocation(loc);
        setIsMobileDrawerOpen(true);
    };

    // Xử lý chọn địa danh cổ
    const handleSelectAncientLandmark = (item) => {
        if (!item) return;
        setSelectedAncientLandmark(item);
        setAncientResolveNotice(null);
        setIsMobileDrawerOpen(true);
    };

    // Tổng số tác phẩm trên toàn bản đồ
    const totalWorksCount = useMemo(() => {
        return locations.reduce((acc, loc) => acc + (loc.totalWorks || loc.worksCount || 0), 0);
    }, [locations]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-vietnam">
            {/* 1. HERO HEADER */}
            <header className="bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-8 pb-10 relative overflow-hidden border-b border-indigo-950">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
                        <Link to="/" className="hover:text-amber-400 transition">
                            Trang chủ
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-amber-300 font-semibold">Bản đồ tác phẩm & Cổ danh AI</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="max-w-2xl space-y-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                                <Compass className="w-3.5 h-3.5 text-amber-400" />
                                <span>Bản Đồ Số GIS & Trí Tuệ Nhân Tạo Không Gian</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heritage tracking-tight leading-tight">
                                Không Gian Văn Hóa & Cổ Danh Lịch Sử Việt Nam
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                                Khám phá ca dao, tích truyện dân gian gắn liền với các vùng đất trên dải đất hình chữ S, 
                                đồng thời tra cứu và giải mã các địa danh cổ, cửa ải lịch sử sang tọa độ thực tế ngày nay.
                            </p>
                        </div>

                        {/* Thống kê nhanh */}
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-amber-400" />
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Địa phương văn hóa</span>
                                    <span className="text-lg font-bold text-white font-heritage">{locations.length}</span>
                                </div>
                            </div>
                            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-amber-400" />
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Tác phẩm kết nối</span>
                                    <span className="text-lg font-bold text-white font-heritage">{totalWorksCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. CHỌN CHẾ ĐỘ BẢN ĐỒ & THANH CÔNG CỤ (2 MODES) */}
            <section className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
                    {/* HÀNG 1: TAB CHUYỂN ĐỔI 2 CHẾ ĐỘ THÔNG MINH */}
                    <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                            {/* Tab 1: Địa phương */}
                            <button
                                type="button"
                                onClick={() => setMapMode('places')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                    mapMode === 'places'
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                <span>Bản đồ Địa phương</span>
                            </button>

                            {/* Tab 2: Cổ danh & Cửa ải Lịch sử */}
                            <button
                                type="button"
                                onClick={() => setMapMode('ancient')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                    mapMode === 'ancient'
                                        ? 'bg-slate-900 text-amber-300 shadow-sm border border-slate-950'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Landmark className="w-3.5 h-3.5 text-amber-400" />
                                <span>Cổ Danh & Cửa Ải Lịch Sử</span>
                                <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-600 border border-amber-500/30 text-[9px] font-extrabold tracking-wider">
                                    GPS AI
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* HÀNG 2: THANH ĐIỀU KHIỂN CHI TIẾT TÙY THEO CHẾ ĐỘ ĐANG CHỌN */}

                    {/* --- 2A. CHẾ ĐỘ PLACES: BỘ LỌC THỂ LOẠI & VÙNG MIỀN --- */}
                    {mapMode === 'places' && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-150">
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 flex-shrink-0 mr-1">
                                    <Filter className="w-3.5 h-3.5 text-amber-600" />
                                    Thể loại:
                                </span>
                                {CATEGORY_FILTERS.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                                            selectedCategory === cat.id
                                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                                    {REGION_FILTERS.map((reg) => (
                                        <button
                                            key={reg.id}
                                            type="button"
                                            onClick={() => setSelectedRegion(reg.id)}
                                            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                                                selectedRegion === reg.id
                                                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            {reg.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative min-w-[170px]">
                                    <select
                                        value={selectedLocation?._id || ''}
                                        onChange={(e) => {
                                            const loc = locations.find((l) => l._id === e.target.value);
                                            if (loc) handleSelectLocation(loc);
                                        }}
                                        className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                                    >
                                        <option value="">Nhảy tới địa phương...</option>
                                        {locations.map((loc) => (
                                            <option key={loc._id} value={loc._id}>
                                                {loc.name} ({loc.totalWorks || loc.worksCount || 0} tác phẩm)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- 2B. CHẾ ĐỘ ANCIENT: THANH TÌM KIẾM CỔ DANH & GỢI Ý --- */}
                    {mapMode === 'ancient' && (
                        <div className="space-y-2 animate-in fade-in duration-150">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleResolveAncientLandmark();
                                }}
                                className="flex items-center gap-2"
                            >
                                <div className="relative flex-grow">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={ancientSearchQuery}
                                        onChange={(e) => {
                                            setAncientSearchQuery(e.target.value);
                                            if (ancientNotFoundData) setAncientNotFoundData(null);
                                            if (ancientResolveError) setAncientResolveError(null);
                                        }}
                                        placeholder="Tra cứu địa danh cổ bất kỳ (vd: Bến Chương Dương, Cửa Hàm Tử, Sông Như Nguyệt, Đầm Dạ Trạch, Đèo Ba Dội, Sông Bạch Đằng...)"
                                        className="w-full text-xs bg-slate-100/80 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isResolvingAncient || !ancientSearchQuery.trim()}
                                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm flex-shrink-0 cursor-pointer"
                                >
                                    {isResolvingAncient ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                                    ) : (
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                    )}
                                    <span>AI Định Vị GPS</span>
                                </button>
                            </form>

                            {/* Hộp thông báo khi người dùng nhập điểm không đúng hoặc không có trong sử liệu */}
                            {ancientNotFoundData && (
                                <div className="p-3.5 bg-amber-50/90 border border-amber-300/90 rounded-2xl text-xs text-amber-950 shadow-sm animate-in fade-in duration-200 space-y-2.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                            <span className="text-base leading-none">🧭</span>
                                            <div>
                                                <p className="font-bold text-amber-900 text-xs">
                                                    Không tìm thấy địa danh: "{ancientNotFoundData.query}"
                                                </p>
                                                <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                                                    {ancientNotFoundData.message}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAncientNotFoundData(null)}
                                            className="text-amber-700 hover:text-amber-950 p-1 cursor-pointer"
                                            title="Đóng thông báo"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Danh sách gợi ý địa danh tiêu biểu 1-click */}
                                    <div className="pt-2 border-t border-amber-200/80">
                                        <p className="text-[11px] font-bold text-amber-900 mb-1.5 flex items-center gap-1">
                                            <span>💡</span> Gợi ý di tích lịch sử nổi tiếng bạn có thể tra cứu:
                                        </p>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {ancientNotFoundData.suggestions?.map((sug) => {
                                                const matchInAll = ancientLandmarks.find(
                                                    (l) => l.id === sug.id || l.slug === sug.slug
                                                );
                                                const displayName = sug.ancientName || sug.name;
                                                return (
                                                    <button
                                                        key={sug.id || displayName}
                                                        type="button"
                                                        onClick={() => {
                                                            setAncientSearchQuery(displayName);
                                                            setAncientNotFoundData(null);
                                                            if (matchInAll) {
                                                                handleSelectAncientLandmark(matchInAll);
                                                            } else {
                                                                handleResolveAncientLandmark(displayName);
                                                            }
                                                        }}
                                                        className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-lg text-[11px] font-medium transition cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center gap-1"
                                                    >
                                                        <span>🏯</span>
                                                        <span>{displayName}</span>
                                                        {sug.period && (
                                                            <span className="text-[10px] text-amber-700 opacity-75">
                                                                ({sug.period})
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Thông báo lỗi tra cứu nếu có */}
                            {ancientResolveError && (
                                <div className="p-2.5 bg-red-50 border border-red-200/90 rounded-xl text-xs text-red-900 flex items-center justify-between animate-in fade-in">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">⚠️</span>
                                        <span>{ancientResolveError}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAncientResolveError(null)}
                                        className="text-red-500 hover:text-red-800 p-1 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {/* Danh sách địa danh cổ tiêu biểu bấm nhanh */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500 scrollbar-none">
                                <span className="font-bold text-slate-700 flex-shrink-0">Gợi ý cửa ải lịch sử:</span>
                                {ancientLandmarks.slice(0, 8).map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleSelectAncientLandmark(item)}
                                        className={`px-2.5 py-0.5 rounded-lg border text-xs whitespace-nowrap transition cursor-pointer ${
                                            selectedAncientLandmark?.id === item.id
                                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                        }`}
                                    >
                                        {item.ancientName.split('(')[0].trim()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 3. MAIN MAP WORKSPACE */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* KHU VỰC BẢN ĐỒ CHÍNH (7 hoặc 8 cột) */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
                        <div className="h-[560px] lg:h-[680px] w-full">
                            <CulturalMap
                                locations={locations}
                                selectedLocation={selectedLocation}
                                onSelectLocation={handleSelectLocation}
                                isLoading={isLoadingLocations}
                                mapMode={mapMode}
                                ancientLandmarks={ancientLandmarks}
                                selectedAncientLandmark={selectedAncientLandmark}
                                onSelectAncientLandmark={handleSelectAncientLandmark}
                            />
                        </div>

                        {/* Banner giải thích khoa học dưới bản đồ */}
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
                            <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-bold">
                                    {mapMode === 'places' && 'Lưu ý khoa học về địa lý văn hóa dân gian:'}
                                    {mapMode === 'ancient' && 'Cơ sở học thuật định vị Cổ danh sang GPS:'}
                                </p>
                                <p className="text-slate-600 leading-relaxed text-[11px]">
                                    {mapMode === 'places' &&
                                        'Ca dao và tục ngữ là sản phẩm truyền khẩu dân gian. Hệ thống phân định rõ Nơi khởi nguồn, Địa danh gắn liền và Vùng lưu truyền, tôn trọng chủ quyền toàn vẹn lãnh thổ Việt Nam.'}
                                    {mapMode === 'ancient' &&
                                        'Các địa danh cổ (Bến Chương Dương, Cửa Hàm Tử, Đầm Dạ Trạch, Sông Như Nguyệt...) được đối chiếu từ Đại Việt Sử Ký Toàn Thư và Đại Nam Nhất Thống Chí để giải mã chính xác địa chỉ hành chính và tọa độ GPS ngày nay.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SIDE PANEL / DRAWER BÊN PHẢI (5 hoặc 4 cột) TÙY THEO MODE */}
                    <aside
                        className={`lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${
                            isMobileDrawerOpen ? 'block' : 'hidden lg:flex'
                        } lg:sticky lg:top-24 max-h-[800px]`}
                    >
                        {/* ========================================================= */}
                        {/* SIDEBAR PANEL CHO MODE 1: ĐỊA PHƯƠNG VĂN HÓA (PLACES)   */}
                        {/* ========================================================= */}
                        {mapMode === 'places' && (
                            selectedLocation ? (
                                <div className="flex flex-col h-full overflow-hidden">
                                    <div className="relative p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-slate-950">
                                                    {selectedLocation.region || 'Bắc'} Bộ
                                                </span>
                                                <span className="text-[11px] text-slate-400 font-mono">
                                                    {selectedLocation.coordinates?.lat.toFixed(2)}°B, {selectedLocation.coordinates?.lng.toFixed(2)}°Đ
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsMobileDrawerOpen(false)}
                                                className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h2 className="text-xl font-bold font-heritage text-white">
                                            {selectedLocation.name}
                                        </h2>

                                        <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                                            {selectedLocation.description}
                                        </p>

                                        {selectedLocation.sources && (
                                            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[10px] text-amber-200/90">
                                                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                                <span className="truncate">Nguồn: {selectedLocation.sources}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-amber-600" />
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                                Tác phẩm gắn liền
                                            </h3>
                                        </div>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                            {workTotal} tác phẩm
                                        </span>
                                    </div>

                                    <div className="p-4 overflow-y-auto space-y-3 flex-grow max-h-[500px]">
                                        {isLoadingWorks ? (
                                            <div className="py-12 text-center space-y-2">
                                                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                <p className="text-xs text-slate-500">Đang tải danh sách tác phẩm...</p>
                                            </div>
                                        ) : locationWorks.length === 0 ? (
                                            <div className="py-12 text-center space-y-2 px-4">
                                                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                                                <h4 className="text-xs font-bold text-slate-700">
                                                    Chưa có tác phẩm {selectedCategory !== 'all' ? `thể loại "${selectedCategory}"` : ''} tại địa phương này
                                                </h4>
                                                <p className="text-[11px] text-slate-400">
                                                    Hãy thử chọn thể loại khác hoặc chọn toàn bộ để xem các tư liệu có sẵn.
                                                </p>
                                            </div>
                                        ) : (
                                            locationWorks.map((work) => (
                                                <div
                                                    key={work._id}
                                                    onClick={() => setActiveModalWork(work)}
                                                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-bold text-slate-900 group-hover:text-amber-800 text-sm font-heritage transition">
                                                            {work.title}
                                                        </h4>
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 flex-shrink-0">
                                                            {work.categoryName || work.category}
                                                        </span>
                                                    </div>
                                                    {work.quote && (
                                                        <p className="mt-2 text-xs italic text-slate-600 bg-slate-50 p-2 rounded-lg border-l-2 border-amber-500">
                                                            "{work.quote}"
                                                        </p>
                                                    )}
                                                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                                                        {work.summary || work.lesson}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center space-y-3 my-auto">
                                    <MapPin className="w-10 h-10 text-amber-600/40 mx-auto" />
                                    <h3 className="font-heritage font-bold text-slate-800 text-base">
                                        Chưa chọn địa phương
                                    </h3>
                                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                        Nhấp vào một điểm ghim trên bản đồ hoặc chọn từ danh sách để xem các tác phẩm văn học dân gian gắn liền.
                                    </p>
                                </div>
                            )
                        )}

                        {/* ========================================================= */}
                        {/* SIDEBAR PANEL CHO MODE 2: CỔ DANH & CỬA ẢI LỊCH SỬ      */}
                        {/* ========================================================= */}
                        {mapMode === 'ancient' && (
                            selectedAncientLandmark ? (
                                <div className="flex flex-col h-full overflow-hidden">
                                    {/* Chiếu Chỉ / Cổ thư Header */}
                                    <div className="p-5 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-amber-100 border-b border-amber-800/40 relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                                                    🏯 Địa danh Cổ
                                                </span>
                                                <span className="text-[11px] text-amber-300 font-bold">
                                                    {selectedAncientLandmark.dynasty}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsMobileDrawerOpen(false)}
                                                className="lg:hidden p-1.5 rounded-lg bg-white/10 text-amber-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h2 className="text-xl font-bold font-heritage text-white">
                                            {selectedAncientLandmark.ancientName}
                                        </h2>
                                        <p className="text-xs text-amber-200/90 mt-1 font-medium">
                                            {selectedAncientLandmark.period}
                                        </p>
                                    </div>

                                    {ancientResolveNotice && (
                                        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 font-medium">
                                            ℹ️ {ancientResolveNotice}
                                        </div>
                                    )}

                                    {/* Thẻ Chiếu Thư so sánh Cổ danh & GPS ngày nay */}
                                    <div className="p-5 overflow-y-auto space-y-4 flex-grow max-h-[600px] lg:max-h-[calc(100vh-280px)]">
                                        {/* Box đối chiếu Tên Xưa vs Tên Nay */}
                                        <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-4 space-y-2.5">
                                            <div className="flex items-start gap-2.5">
                                                <MapPin className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                                        Vị trí hành chính ngày nay:
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-900">
                                                        {selectedAncientLandmark.modernLocation}
                                                    </span>
                                                    <span className="block text-[11px] font-mono text-amber-800 font-semibold mt-0.5">
                                                        GPS: {selectedAncientLandmark.coordinates?.lat?.toFixed(4)}°B, {selectedAncientLandmark.coordinates?.lng?.toFixed(4)}°Đ
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Không gian Đối chiếu: XƯA & NAY (Ảnh tư liệu lịch sử & Thực cảnh ngày nay) */}
                                        {selectedAncientLandmark.imagery && (
                                            <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 space-y-3 shadow-xs">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                                                        <span>🖼️</span>
                                                        <span>Đối Chiếu: Xưa & Nay</span>
                                                    </h4>
                                                    {/* View Switcher Tabs */}
                                                    <div className="inline-flex rounded-lg bg-stone-100 p-0.5 text-[11px] font-semibold border border-stone-200/60">
                                                        <button
                                                            type="button"
                                                            onClick={() => setAncientImageViewMode('split')}
                                                            className={`px-2 py-0.5 rounded-md transition ${ancientImageViewMode === 'split' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
                                                        >
                                                            Song song
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setAncientImageViewMode('ancient')}
                                                            className={`px-2 py-0.5 rounded-md transition ${ancientImageViewMode === 'ancient' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
                                                        >
                                                            Thời xưa
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setAncientImageViewMode('modern')}
                                                            className={`px-2 py-0.5 rounded-md transition ${ancientImageViewMode === 'modern' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
                                                        >
                                                            Hiện nay
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* View Mode: Song Song (Split / Dual Cards) */}
                                                {ancientImageViewMode === 'split' && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                        {/* Ancient card */}
                                                        {selectedAncientLandmark.imagery.ancient && (
                                                            <div className="group relative rounded-xl overflow-hidden border border-amber-300/80 bg-amber-50/40 flex flex-col">
                                                                <div
                                                                    className="relative aspect-[4/3] bg-stone-900 overflow-hidden cursor-pointer"
                                                                    onClick={() => setActiveLightboxImage(selectedAncientLandmark.imagery.ancient)}
                                                                >
                                                                    <img
                                                                        src={selectedAncientLandmark.imagery.ancient.url}
                                                                        alt={selectedAncientLandmark.imagery.ancient.title}
                                                                        className="w-full h-full object-cover sepia-[0.3] contrast-105 group-hover:scale-105 transition-transform duration-300"
                                                                        loading="lazy"
                                                                        referrerPolicy="no-referrer"
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Tran_Hung_Dao_statue.jpg/960px-Tran_Hung_Dao_statue.jpg';
                                                                        }}
                                                                    />
                                                                    <div className="absolute top-1.5 left-1.5 bg-amber-950/85 backdrop-blur-xs text-amber-200 text-[9.5px] font-bold px-2 py-0.5 rounded shadow">
                                                                        📜 {selectedAncientLandmark.imagery.ancient.era || 'Thời xưa'}
                                                                    </div>
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
                                                                            <Maximize2 className="w-3 h-3" /> Phóng to
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="p-2 space-y-1 flex-grow flex flex-col justify-between">
                                                                    <div>
                                                                        <p className="text-[11px] font-bold text-stone-900 line-clamp-1">
                                                                            {selectedAncientLandmark.imagery.ancient.title}
                                                                        </p>
                                                                        <p className="text-[10px] text-stone-600 line-clamp-2 leading-relaxed mt-0.5">
                                                                            {selectedAncientLandmark.imagery.ancient.caption}
                                                                        </p>
                                                                    </div>
                                                                    {selectedAncientLandmark.imagery.ancient.source && (
                                                                        <span className="text-[9px] text-amber-900 font-medium block truncate pt-1 border-t border-amber-200/60">
                                                                            {selectedAncientLandmark.imagery.ancient.source}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Modern card */}
                                                        {selectedAncientLandmark.imagery.modern && (
                                                            <div className="group relative rounded-xl overflow-hidden border border-emerald-300/80 bg-emerald-50/40 flex flex-col">
                                                                <div
                                                                    className="relative aspect-[4/3] bg-stone-900 overflow-hidden cursor-pointer"
                                                                    onClick={() => setActiveLightboxImage(selectedAncientLandmark.imagery.modern)}
                                                                >
                                                                    <img
                                                                        src={selectedAncientLandmark.imagery.modern.url}
                                                                        alt={selectedAncientLandmark.imagery.modern.title}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                        loading="lazy"
                                                                        referrerPolicy="no-referrer"
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Doan_Mon_Gate_2.jpg/960px-Doan_Mon_Gate_2.jpg';
                                                                        }}
                                                                    />
                                                                    <div className="absolute top-1.5 left-1.5 bg-emerald-950/85 backdrop-blur-xs text-emerald-200 text-[9.5px] font-bold px-2 py-0.5 rounded shadow">
                                                                        📸 {selectedAncientLandmark.imagery.modern.era || 'Ngày nay'}
                                                                    </div>
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
                                                                            <Maximize2 className="w-3 h-3" /> Phóng to
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="p-2 space-y-1 flex-grow flex flex-col justify-between">
                                                                    <div>
                                                                        <p className="text-[11px] font-bold text-stone-900 line-clamp-1">
                                                                            {selectedAncientLandmark.imagery.modern.title}
                                                                        </p>
                                                                        <p className="text-[10px] text-stone-600 line-clamp-2 leading-relaxed mt-0.5">
                                                                            {selectedAncientLandmark.imagery.modern.caption}
                                                                        </p>
                                                                    </div>
                                                                    {selectedAncientLandmark.imagery.modern.source && (
                                                                        <span className="text-[9px] text-emerald-900 font-medium block truncate pt-1 border-t border-emerald-200/60">
                                                                            {selectedAncientLandmark.imagery.modern.source}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* View Mode: Ancient Only */}
                                                {ancientImageViewMode === 'ancient' && selectedAncientLandmark.imagery.ancient && (
                                                    <div className="rounded-xl overflow-hidden border border-amber-300 bg-amber-50/50 p-2.5 space-y-2">
                                                        <div
                                                            className="relative rounded-lg overflow-hidden aspect-[16/10] bg-stone-900 cursor-pointer group"
                                                            onClick={() => setActiveLightboxImage(selectedAncientLandmark.imagery.ancient)}
                                                        >
                                                            <img
                                                                src={selectedAncientLandmark.imagery.ancient.url}
                                                                alt={selectedAncientLandmark.imagery.ancient.title}
                                                                referrerPolicy="no-referrer"
                                                                className="w-full h-full object-cover sepia-[0.35] group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            <div className="absolute top-2 left-2 bg-amber-950/90 text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded shadow">
                                                                📜 Tư liệu: {selectedAncientLandmark.imagery.ancient.era}
                                                            </div>
                                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 group-hover:bg-amber-900 transition">
                                                                <Maximize2 className="w-3 h-3" /> Phóng to
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h5 className="text-xs font-bold text-stone-900">{selectedAncientLandmark.imagery.ancient.title}</h5>
                                                            <p className="text-xs text-stone-600 leading-relaxed">{selectedAncientLandmark.imagery.ancient.caption}</p>
                                                            <p className="text-[10px] text-amber-900 font-medium pt-1 border-t border-amber-200/60">
                                                                Tư liệu: {selectedAncientLandmark.imagery.ancient.source}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* View Mode: Modern Only */}
                                                {ancientImageViewMode === 'modern' && selectedAncientLandmark.imagery.modern && (
                                                    <div className="rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50/50 p-2.5 space-y-2">
                                                        <div
                                                            className="relative rounded-lg overflow-hidden aspect-[16/10] bg-stone-900 cursor-pointer group"
                                                            onClick={() => setActiveLightboxImage(selectedAncientLandmark.imagery.modern)}
                                                        >
                                                            <img
                                                                src={selectedAncientLandmark.imagery.modern.url}
                                                                alt={selectedAncientLandmark.imagery.modern.title}
                                                                referrerPolicy="no-referrer"
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            <div className="absolute top-2 left-2 bg-emerald-950/90 text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded shadow">
                                                                📸 Thực cảnh: {selectedAncientLandmark.imagery.modern.era}
                                                            </div>
                                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 group-hover:bg-emerald-900 transition">
                                                                <Maximize2 className="w-3 h-3" /> Phóng to
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h5 className="text-xs font-bold text-stone-900">{selectedAncientLandmark.imagery.modern.title}</h5>
                                                            <p className="text-xs text-stone-600 leading-relaxed">{selectedAncientLandmark.imagery.modern.caption}</p>
                                                            <p className="text-[10px] text-emerald-900 font-medium pt-1 border-t border-emerald-200/60">
                                                                Nguồn ảnh: {selectedAncientLandmark.imagery.modern.source}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Sự kiện & Chiến tích oai hùng */}
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                                <span>⚔️</span>
                                                <span>Chiến công & Dấu ấn Lịch sử:</span>
                                            </h4>
                                            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                                                {selectedAncientLandmark.historicalEvent}
                                            </p>
                                        </div>

                                        {/* Thi phẩm hoặc Ca dao gắn liền */}
                                        {selectedAncientLandmark.literatureQuote && (
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                                    <span>📜</span>
                                                    <span>Thi phẩm & Ca dao lưu dấu:</span>
                                                </h4>
                                                <div className="bg-stone-50 border-l-3 border-amber-600 p-3 rounded-r-xl space-y-1">
                                                    <p className="text-xs italic text-stone-900 font-serif leading-relaxed">
                                                        "{selectedAncientLandmark.literatureQuote}"
                                                    </p>
                                                    {selectedAncientLandmark.literatureAuthor && (
                                                        <span className="block text-[10px] text-amber-800 font-bold text-right">
                                                            — {selectedAncientLandmark.literatureAuthor}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Biến thiên dòng chảy & cảnh quan */}
                                        {selectedAncientLandmark.geographicalChange && (
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                                    <span>🌊</span>
                                                    <span>Biến thiên địa chất & dòng sông:</span>
                                                </h4>
                                                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11.5px]">
                                                    {selectedAncientLandmark.geographicalChange}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center space-y-3 my-auto">
                                    <Landmark className="w-10 h-10 text-amber-600/40 mx-auto" />
                                    <h3 className="font-heritage font-bold text-slate-800 text-base">
                                        Chưa chọn cổ danh lịch sử
                                    </h3>
                                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                        Nhấp vào một điểm ghim cổ thành trên bản đồ hoặc nhập tên địa danh cổ vào thanh tìm kiếm phía trên để định vị tọa độ.
                                    </p>
                                </div>
                            )
                        )}
                    </aside>
                </div>
            </main>

            {/* Lightbox Phóng To Ảnh Tư Liệu Xưa & Nay */}
            {activeLightboxImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setActiveLightboxImage(null)}
                >
                    <div
                        className="relative max-w-4xl w-full bg-stone-900 border border-stone-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-3.5 bg-stone-950 flex items-center justify-between border-b border-stone-800">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    {activeLightboxImage.era || 'Tư liệu di sản'}
                                </span>
                                <h3 className="text-sm font-bold text-white truncate max-w-md">
                                    {activeLightboxImage.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveLightboxImage(null)}
                                className="p-1.5 rounded-lg bg-white/10 text-stone-300 hover:text-white hover:bg-white/20 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="min-h-[360px] max-h-[70vh] bg-black/90 flex items-center justify-center overflow-hidden p-2">
                            <img
                                src={activeLightboxImage.url}
                                alt={activeLightboxImage.title}
                                referrerPolicy="no-referrer"
                                loading="eager"
                                className="max-h-[66vh] max-w-full object-contain rounded-lg shadow-lg"
                            />
                        </div>

                        <div className="p-4 bg-stone-950 border-t border-stone-800 text-xs text-stone-300 space-y-1.5">
                            <p className="leading-relaxed font-sans text-stone-200">
                                {activeLightboxImage.caption}
                            </p>
                            {activeLightboxImage.source && (
                                <p className="text-[11px] text-amber-300/80 font-mono">
                                    🏛️ Nguồn tư liệu: {activeLightboxImage.source}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xem chi tiết tác phẩm (tái sử dụng modal chung) */}
            {activeModalWork && (
                <WorkDetailModal
                    work={activeModalWork}
                    onClose={() => setActiveModalWork(null)}
                />
            )}
        </div>
    );
};

export default LiteratureMap;
