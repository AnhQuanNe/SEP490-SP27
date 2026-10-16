import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import literatureService from '../services/literature.service';
import {
    MapPin,
    Compass,
    Sparkles,
    BookOpen,
    ArrowRight,
    CheckCircle2,
    Bookmark,
    Eye,
    ThumbsUp,
    X,
    Quote,
    Layers,
    Navigation,
    Mountain,
    Waves,
    Sun,
    ChevronRight,
    Map
} from 'lucide-react';

const LiteratureMap = () => {
    const [selectedRegion, setSelectedRegion] = useState('Bắc');
    const [works, setWorks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModalWork, setActiveModalWork] = useState(null);
    const [savedWorkIds, setSavedWorkIds] = useState(new Set());
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Cultural & Geographic Data of 3 Regions
    const regionInfo = {
        'Bắc': {
            name: 'Kinh Kỳ & Bắc Bộ',
            subtitle: 'Cái nôi văn minh sông Hồng & Vùng đất ngàn năm văn hiến',
            icon: Mountain,
            accentColor: 'from-amber-600 to-amber-800',
            borderColor: 'border-amber-400',
            bgGlow: 'bg-amber-500/10',
            landmarks: [
                { name: 'Núi Tản Viên (Ba Vì)', desc: 'Gắn liền với Thần thoại Sơn Tinh - Thủy Tinh & Tứ Bất Tử' },
                { name: 'Đền Hùng (Phú Thọ)', desc: 'Đất Tổ cội nguồn, khởi phát truyền thuyết Bánh chưng bánh giầy' },
                { name: 'Sông Bạch Đằng', desc: 'Chiến địa lịch sử lẫy lừng, nguồn cảm hứng thiên cổ Bạch Đằng giang phú' },
                { name: 'Hồ Hoàn Kiếm (Hà Nội)', desc: 'Địa linh Thăng Long, truyền thuyết rùa vàng trao gươm báu' },
            ],
            identity: 'Văn học Bắc Bộ đậm tính sử thi khởi nguồn, triết lý nhân sinh trầm mặc, giàu chất trữ tình qua ca dao quan họ và danh tác Nho học trung đại.',
        },
        'Trung': {
            name: 'Miền Trung & Xứ Lam Hồng',
            subtitle: 'Vùng đất địa linh nhân kiệt, sâu lắng trầm tích cung đình & thi ca',
            icon: Waves,
            accentColor: 'from-emerald-600 to-teal-800',
            borderColor: 'border-emerald-400',
            bgGlow: 'bg-emerald-500/10',
            landmarks: [
                { name: 'Sông Lam - Núi Hồng (Nghệ Tĩnh)', desc: 'Quê hương Đại thi hào Nguyễn Du, cái nôi của hát ví giặm và Truyện Kiều' },
                { name: 'Cố đô Huế & Sông Hương', desc: 'Không gian thơ ca cung đình, nhã nhạc và văn học bác học thế kỷ XIX' },
                { name: 'Đèo Ngang', desc: 'Thắng cảnh đi vào kiệt tác thi ca "Qua Đèo Ngang" của Bà Huyện Thanh Quan' },
            ],
            identity: 'Mang âm hưởng kiên cường vượt gian khó bão giông, kết hợp sự tao nhã đài các của văn hóa cung đình và sự tinh tế trong thi pháp.',
        },
        'Nam': {
            name: 'Nam Bộ & Đất Phương Nam',
            subtitle: 'Hào sảng, phóng khoáng, giàu tình nghĩa miệt vườn sông nước',
            icon: Sun,
            accentColor: 'from-indigo-600 to-purple-800',
            borderColor: 'border-indigo-400',
            bgGlow: 'bg-indigo-500/10',
            landmarks: [
                { name: 'Đồng bằng Sông Cửu Long', desc: 'Cái nôi của truyện cười dân gian Bác Ba Phi, đờn ca tài tử' },
                { name: 'Bến Nghé - Sài Gòn', desc: 'Vùng đất mở cõi, gắn với áng văn tế nghĩa sĩ Cần Giuộc của Nguyễn Đình Chiểu' },
                { name: 'Đất Rừng U Minh (Cà Mau)', desc: 'Không gian thiên nhiên hùng vĩ gắn liền huyền thoại khẩn hoang' },
            ],
            identity: 'Đặc trưng bởi ngôn ngữ bình dân, tinh thần trọng nghĩa khinh tài, hào sảng phóng khoáng của những lưu dân mở cõi.',
        },
    };

    // Fetch works for the selected region
    useEffect(() => {
        const fetchRegionalWorks = async () => {
            try {
                setIsLoading(true);
                const data = await literatureService.searchWorks({
                    region: selectedRegion,
                    limit: 15,
                });
                setWorks(data.works || []);
            } catch (err) {
                console.error('Lỗi tải tác phẩm theo vùng miền:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegionalWorks();
    }, [selectedRegion]);

    const toggleSave = (id) => {
        setSavedWorkIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                showToast('Đã xóa khỏi danh sách lưu');
            } else {
                next.add(id);
                showToast('Đã lưu tác phẩm vào sổ tay di sản!');
            }
            return next;
        });
    };

    const currentRegionData = regionInfo[selectedRegion];
    const RegionIcon = currentRegionData.icon;

    return (
        <div className="min-h-screen bg-slate-50/70 pb-24">
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* 1. HERO HEADER */}
            <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-10 pb-16 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
                        <Link to="/" className="hover:text-amber-400 transition">Trang chủ</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-amber-300 font-semibold">Bản đồ Văn học</span>
                    </div>

                    <div className="max-w-3xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                            <Compass className="w-3.5 h-3.5 text-amber-400" />
                            <span>Không Gian Văn Hóa & Địa Danh Văn Học 3 Miền</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heritage tracking-tight leading-tight">
                            Bản Đồ Văn Học Việt Nam
                        </h1>
                        <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                            Mỗi tấc đất, dòng sông, ngọn núi trên dải đất hình chữ S đều thấm đượm những áng thi ca, tích xưa và huyền thoại. Hãy chọn từng miền đất để khám phá di sản văn học gắn liền với địa danh văn hóa.
                        </p>
                    </div>

                    {/* Region Switcher Tabs */}
                    <div className="mt-8 flex items-center gap-3 flex-wrap">
                        {[
                            { id: 'Bắc', name: 'Miền Bắc', sub: 'Kinh Kỳ & Đất Tổ' },
                            { id: 'Trung', name: 'Miền Trung', sub: 'Lam Hồng & Cố Đô' },
                            { id: 'Nam', name: 'Miền Nam', sub: 'Hào sảng Đất Phương Nam' },
                        ].map((reg) => (
                            <button
                                key={reg.id}
                                onClick={() => setSelectedRegion(reg.id)}
                                className={`px-5 py-3 rounded-2xl text-left transition-all flex items-center gap-3 border ${
                                    selectedRegion === reg.id
                                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-xl scale-105'
                                        : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
                                }`}
                            >
                                <MapPin className={`w-4 h-4 ${selectedRegion === reg.id ? 'text-slate-950' : 'text-amber-400'}`} />
                                <div>
                                    <span className="text-xs font-bold block">{reg.name}</span>
                                    <span className={`text-[10px] ${selectedRegion === reg.id ? 'text-slate-800' : 'text-slate-400'}`}>
                                        {reg.sub}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* 2. REGION SPOTLIGHT & LANDMARKS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Region Identity Card */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-sm">
                                    <RegionIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Khu vực văn hóa</span>
                                    <h2 className="text-2xl font-bold font-heritage text-slate-900">
                                        {currentRegionData.name}
                                    </h2>
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-slate-500">
                                {currentRegionData.subtitle}
                            </p>
                            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                {currentRegionData.identity}
                            </p>
                        </div>

                        {/* Landmark Nodes */}
                        <div className="lg:col-span-7 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Navigation className="w-4 h-4 text-amber-600" />
                                    Địa danh văn hóa nổi bật trong tác phẩm
                                </h3>
                                <span className="text-[11px] text-slate-400">Không gian thực địa</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {currentRegionData.landmarks.map((lm, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-2xl bg-slate-50/80 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 transition-all group"
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                                                {idx + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                                                    {lm.name}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                                    {lm.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. REGIONAL WORKS LIST */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 font-heritage">
                            Tác Phẩm & Tích Xưa Vùng {currentRegionData.name}
                        </h2>
                        <p className="text-xs text-slate-500">
                            Hiển thị các tác phẩm gắn liền với địa phương và xuất xứ {selectedRegion} Bộ
                        </p>
                    </div>

                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                        Có <strong>{works.length}</strong> tư liệu được kết nối bản đồ
                    </span>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                                <div className="h-7 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-16 bg-slate-100 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                ) : works.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-3">
                        <MapPin className="w-10 h-10 text-amber-500 mx-auto" />
                        <h3 className="text-base font-bold text-slate-900 font-heritage">
                            Chưa có tác phẩm cụ thể cho vùng này
                        </h3>
                        <p className="text-xs text-slate-500">
                            Các tư liệu vùng miền đang tiếp tục được cập nhật vào kho tàng.
                        </p>
                        <Link
                            to="/kham-pha"
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold inline-block"
                        >
                            Khám phá toàn bộ thư viện
                        </Link>
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
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                                                {work.categoryName || work.category}
                                            </span>
                                            <span className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-amber-600" />
                                                {work.region}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 font-heritage group-hover:text-amber-800 transition-colors">
                                            {work.title}
                                        </h3>

                                        <p className="text-xs text-slate-500 font-medium">
                                            {work.author || 'Dân gian'} • <span className="text-slate-400">{work.period}</span>
                                        </p>

                                        {work.quote && (
                                            <div className="p-3 bg-amber-50/70 rounded-xl border-l-2 border-amber-500 text-amber-950 font-heritage italic text-xs leading-relaxed line-clamp-2">
                                                &ldquo;{work.quote}&rdquo;
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

            {/* 4. MODAL CHI TIẾT TÁC PHẨM */}
            {activeModalWork && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 bg-slate-950 text-white flex items-start justify-between border-b border-slate-800">
                            <div className="space-y-1.5 pr-6">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        {activeModalWork.categoryName || activeModalWork.category}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        Xuất xứ: <strong>{activeModalWork.region}</strong> • {activeModalWork.period}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold font-heritage text-white">
                                    {activeModalWork.title}
                                </h2>
                                <p className="text-xs text-slate-300">
                                    Tác giả: <strong>{activeModalWork.author || 'Dân gian'}</strong>
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveModalWork(null)}
                                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
                            {activeModalWork.quote && (
                                <div className="p-4 bg-amber-50 rounded-2xl border-l-4 border-amber-600 text-amber-950 font-heritage italic text-xs leading-relaxed">
                                    <Quote className="w-4 h-4 text-amber-600 mb-1 inline mr-1" />
                                    {activeModalWork.quote}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                    Tóm tắt cốt truyện / nội dung
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                    {activeModalWork.summary}
                                </p>
                            </div>

                            {activeModalWork.content && (
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                        Toàn văn tác phẩm
                                    </h4>
                                    <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-700 leading-relaxed whitespace-pre-line border border-slate-200 max-h-72 overflow-y-auto">
                                        {activeModalWork.content}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {activeModalWork.historicalContext && (
                                    <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                                        <h5 className="text-[11px] font-bold text-indigo-900 uppercase">Dấu ấn địa phương & lịch sử</h5>
                                        <p className="text-xs text-indigo-950/80 leading-relaxed">
                                            {activeModalWork.historicalContext}
                                        </p>
                                    </div>
                                )}
                                {activeModalWork.thematicMeaning && (
                                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1">
                                        <h5 className="text-[11px] font-bold text-emerald-900 uppercase">Ý nghĩa biểu tượng văn hóa</h5>
                                        <p className="text-xs text-emerald-950/80 leading-relaxed">
                                            {activeModalWork.thematicMeaning}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Nguồn học thuật: <strong>{activeModalWork.source}</strong></span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
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

export default LiteratureMap;
