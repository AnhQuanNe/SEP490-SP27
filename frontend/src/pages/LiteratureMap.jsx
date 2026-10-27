import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import locationService from '../services/location.service';
import CulturalMap from '../components/map/CulturalMap';
import WorkDetailModal from '../components/common/WorkDetailModal';
import {
    MapPin,
    Compass,
    BookOpen,
    ArrowRight,
    Filter,
    ShieldCheck,
    ChevronRight,
    Map as MapIcon,
    X,
    Info,
    FileText
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
    { id: 'Trung', label: 'Miền Trung' },
    { id: 'Nam', label: 'Miền Nam' },
];

const RELATION_BADGES = {
    origin: {
        label: 'Nơi khởi nguồn',
        color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        desc: 'Địa phương được ghi nhận là nơi phát tích / quê hương tác phẩm',
    },
    associated: {
        label: 'Gắn liền địa danh',
        color: 'bg-amber-100 text-amber-900 border-amber-300',
        desc: 'Tác phẩm nhắc đến hoặc có mối liên hệ mật thiết với địa danh này',
    },
    circulation: {
        label: 'Vùng lưu truyền',
        color: 'bg-blue-100 text-blue-900 border-blue-300',
        desc: 'Lưu truyền rộng khắp trong sinh hoạt văn hóa dân gian địa phương',
    },
    unknown: {
        label: 'Chưa xác định',
        color: 'bg-slate-100 text-slate-700 border-slate-300',
        desc: 'Mối liên hệ địa lý đang được tiếp tục khảo cứu học thuật',
    },
};

const LiteratureMap = () => {
    // Trạng thái bộ lọc
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRegion, setSelectedRegion] = useState('all');

    // Dữ liệu bản đồ & địa phương
    const [locations, setLocations] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);

    // Dữ liệu tác phẩm của địa phương đang chọn
    const [locationWorks, setLocationWorks] = useState([]);
    const [isLoadingWorks, setIsLoadingWorks] = useState(false);
    const [workTotal, setWorkTotal] = useState(0);

    // Modal xem chi tiết tác phẩm (tái sử dụng WorkDetailModal hiện có)
    const [activeModalWork, setActiveModalWork] = useState(null);

    // Mobile drawer state
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    // 1. Tải danh sách markers bản đồ theo bộ lọc thể loại & vùng miền (Chỉ chạy khi đổi bộ lọc)
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
                const markers = data?.markers || [];
                setLocations(markers);
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

    // Lấy ID định danh ổn định của địa phương đang chọn
    const selectedLocationId = selectedLocation?._id || selectedLocation?.slug || null;

    // 2. Tải danh sách tác phẩm chi tiết khi chọn địa phương hoặc đổi thể loại
    useEffect(() => {
        if (!selectedLocationId) {
            return;
        }

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
    }, [selectedLocationId, selectedCategory]);

    // Khi người dùng click marker trên bản đồ
    const handleSelectLocation = (loc) => {
        if (!loc) return;
        setSelectedLocation((prev) => {
            if (prev && (prev._id === loc._id || prev.slug === loc.slug)) return prev;
            return loc;
        });
        setIsMobileDrawerOpen(true);
    };

    // Tổng số tác phẩm trên toàn bản đồ
    const totalWorksCount = useMemo(() => {
        return locations.reduce((acc, loc) => acc + (loc.totalWorks || loc.worksCount || 0), 0);
    }, [locations]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
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
                        <span className="text-amber-300 font-semibold">Bản đồ tác phẩm</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="max-w-2xl space-y-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                                <Compass className="w-3.5 h-3.5 text-amber-400" />
                                <span>Địa lý Văn hóa & Không gian Di sản Việt Nam</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heritage tracking-tight leading-tight">
                                Bản Đồ Tác Phẩm Văn Hóa Việt Nam
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                                Khám phá ca dao, tục ngữ và tác phẩm văn học dân gian gắn liền với các vùng đất trên dải đất hình chữ S. 
                                Phân biệt rõ nơi khởi nguồn được ghi nhận, địa danh gắn liền và phạm vi lưu truyền.
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

            {/* 2. FILTER & TOOLBAR */}
            <section className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Thể loại lọc (MAP06) */}
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
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                                    selectedCategory === cat.id
                                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Vùng miền & Chọn nhanh địa phương */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                            {REGION_FILTERS.map((reg) => (
                                <button
                                    key={reg.id}
                                    type="button"
                                    onClick={() => setSelectedRegion(reg.id)}
                                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                                        selectedRegion === reg.id
                                            ? 'bg-white text-slate-900 shadow-xs font-bold'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {reg.label}
                                </button>
                            ))}
                        </div>

                        {/* Dropdown nhảy nhanh tới địa phương */}
                        <div className="relative min-w-[180px]">
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
            </section>

            {/* 3. MAIN MAP WORKSPACE */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* KHU VỰC BẢN ĐỒ (Lg: 7 cột) */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
                        <div className="h-[560px] lg:h-[680px] w-full">
                            <CulturalMap
                                locations={locations}
                                selectedLocation={selectedLocation}
                                onSelectLocation={handleSelectLocation}
                                isLoading={isLoadingLocations}
                            />
                        </div>

                        {/* Ghi chú phân định quan hệ địa lý văn hóa (Học thuật) */}
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
                            <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-bold">Lưu ý khoa học về địa lý văn hóa dân gian:</p>
                                <p className="text-slate-600 leading-relaxed text-[11px]">
                                    Ca dao và tục ngữ là sản phẩm truyền khẩu dân gian, thường lưu truyền qua nhiều vùng miền. 
                                    VietHeritage AI phân biệt nghiêm ngặt giữa <strong className="text-emerald-800">Nơi khởi nguồn</strong> (khi có ghi chép nguồn gốc rõ ràng), 
                                    <strong className="text-amber-800"> Gắn liền địa danh</strong> (địa danh xuất hiện trực tiếp trong văn bản) và 
                                    <strong className="text-blue-800"> Vùng lưu truyền</strong> (không gian văn hóa diễn xướng), tuyệt đối không tự suy đoán.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SIDE PANEL / DRAWER CHI TIẾT ĐỊA PHƯƠNG & TÁC PHẨM (Lg: 5 cột) */}
                    <aside
                        className={`lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${
                            isMobileDrawerOpen ? 'block' : 'hidden lg:flex'
                        } lg:sticky lg:top-20 max-h-[800px]`}
                    >
                        {selectedLocation ? (
                            <div className="flex flex-col h-full overflow-hidden">
                                {/* Banner / Header của địa phương */}
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
                                        {/* Nút đóng drawer trên mobile */}
                                        <button
                                            type="button"
                                            onClick={() => setIsMobileDrawerOpen(false)}
                                            className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
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

                                {/* Header danh sách tác phẩm */}
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

                                {/* Body danh sách tác phẩm (Scrollable) */}
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
                                        locationWorks.map((work) => {
                                            const relInfo = RELATION_BADGES[work.relationType] || RELATION_BADGES.unknown;
                                            return (
                                                <article
                                                    key={work._id || work.slug}
                                                    onClick={() => setActiveModalWork(work)}
                                                    className="p-3.5 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-300 shadow-2xs hover:shadow-sm cursor-pointer transition-all space-y-2 group"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                                                            {work.categoryName || (work.category === 'tuc-ngu' ? 'Tục ngữ' : 'Ca dao')}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${relInfo.color}`}
                                                            title={relInfo.desc}
                                                        >
                                                            {relInfo.label}
                                                        </span>
                                                    </div>

                                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-900 transition-colors line-clamp-1">
                                                        {work.title}
                                                    </h4>

                                                    {work.quote && (
                                                        <p className="text-[11px] font-heritage text-slate-700 italic bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2">
                                                            "{work.quote}"
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                                                        <span>{work.author || 'Dân gian'}</span>
                                                        <span className="text-amber-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                                            Xem chi tiết <ArrowRight className="w-3 h-3" />
                                                        </span>
                                                    </div>
                                                </article>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* State khi chưa chọn địa phương nào */
                            <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 my-auto">
                                <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-inner">
                                    <MapIcon className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-slate-900 font-heritage">
                                        Chọn địa phương trên bản đồ
                                    </h3>
                                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                                        Nhấp vào một điểm đánh dấu trên bản đồ để khám phá tư liệu văn hóa, nguồn gốc và tác phẩm gắn liền với địa danh.
                                    </p>
                                </div>

                                {/* Danh sách địa phương gợi ý */}
                                <div className="w-full pt-4 border-t border-slate-100 text-left space-y-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Địa phương tiêu biểu:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {locations.slice(0, 5).map((loc) => (
                                            <button
                                                key={loc._id}
                                                type="button"
                                                onClick={() => handleSelectLocation(loc)}
                                                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-950 text-slate-700 text-xs font-medium transition"
                                            >
                                                {loc.name.split('(')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </main>

            {/* 4. TÁI SỬ DỤNG WORK DETAIL MODAL (MAP05) */}
            <WorkDetailModal
                work={activeModalWork}
                isOpen={!!activeModalWork}
                onClose={() => setActiveModalWork(null)}
                onWorkSelect={(newWork) => setActiveModalWork(newWork)}
            />
        </div>
    );
};

export default LiteratureMap;
