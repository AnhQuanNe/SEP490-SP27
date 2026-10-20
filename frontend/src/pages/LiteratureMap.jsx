import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import literatureService from '../services/literature.service';
import PoemDisplay from '../components/common/PoemDisplay';
import {
    MapPin,
    Compass,
    CheckCircle2,
    Bookmark,
    Eye,
    ThumbsUp,
    X,
    Navigation,
    Mountain,
    Waves,
    Sun,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import './LiteratureMap.css';

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
                { name: 'Sông Hương & Núi Ngự (Huế)', desc: 'Không gian nhã nhạc cung đình, ca dao hò mái nhì mái đẩy' },
                { name: 'Núi Hồng - Sông Lam (Hà Tĩnh)', desc: 'Quê hương Đại thi hào Nguyễn Du, cái nôi kiệt tác Truyện Kiều' },
                { name: 'Đèo Ngang (Quảng Bình)', desc: 'Cảm hứng bất hủ qua bài thơ Bà Huyện Thanh Quan' },
                { name: 'Ngũ Hành Sơn (Đà Nẵng)', desc: 'Địa linh truyền tích non nước hữu tình xứ Quảng' },
            ],
            identity: 'Văn học Miền Trung giàu tính tự sự, đượm nét hoài cổ phong trần, gắn kết giữa văn hóa cung đình bác học và ca dao thổ nhưỡng kiên cường trước bão táp.',
        },
        'Nam': {
            name: 'Nam Bộ & Miền Tây Đất Mới',
            subtitle: 'Hào sảng đất phương Nam, phóng khoáng nghĩa tình sông nước Cửu Long',
            icon: Sun,
            accentColor: 'from-orange-500 to-amber-700',
            borderColor: 'border-orange-400',
            bgGlow: 'bg-orange-500/10',
            landmarks: [
                { name: 'Đồng Tháp Mười', desc: 'Không gian ca dao tráng lệ: Tháp Mười đẹp nhất bông sen' },
                { name: 'Bến Nghé - Sài Gòn xưa', desc: 'Vùng đất khởi sắc của văn học tài tử và chí khí Lục Vân Tiên' },
                { name: 'Rừng U Minh & Cà Mau', desc: 'Bối cảnh truyện cổ tích mở cõi và thần thoại Bác Ba Phi' },
                { name: 'Sông Tiền & Sông Hậu', desc: 'Mạch nguồn của những câu hò sông nước mênh mang, trù phú' },
            ],
            identity: 'Văn học Nam Bộ mộc mạc, hào sảng, thẳng thắn, trọng nghĩa khinh tài với tinh thần cởi mở của những lưu dân khai hoang mở cõi kiên cường.',
        },
    };

    useEffect(() => {
        const fetchRegionalWorks = async () => {
            setIsLoading(true);
            try {
                const res = await literatureService.searchWorks({
                    region: selectedRegion,
                    limit: 12,
                });
                setWorks(res.works || []);
            } catch (err) {
                console.error('Lỗi lấy tác phẩm theo vùng miền:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegionalWorks();
    }, [selectedRegion]);

    const toggleSave = (workId) => {
        setSavedWorkIds((prev) => {
            const next = new Set(prev);
            if (next.has(workId)) {
                next.delete(workId);
                showToast('Đã xóa khỏi sổ tay lưu trữ');
            } else {
                next.add(workId);
                showToast('Đã lưu tác phẩm vào sổ tay');
            }
            return next;
        });
    };

    const currentRegionData = regionInfo[selectedRegion];
    const RegionIcon = currentRegionData.icon;

    return (
        <div className="litmap-page">
            {toastMessage && (
                <div className="litmap-toast">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* 1. HERO HEADER */}
            <section className="litmap-hero">
                <div className="litmap-hero-aura"></div>
                <div className="litmap-hero-container">
                    {/* Breadcrumb */}
                    <div className="litmap-breadcrumb">
                        <Link to="/" className="litmap-breadcrumb-link">Trang chủ</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-amber-300 font-semibold">Bản đồ Văn học</span>
                    </div>

                    <div className="litmap-hero-content">
                        <div className="litmap-badge">
                            <Compass className="w-3.5 h-3.5 text-amber-400" />
                            <span>Không Gian Văn Hóa & Địa Danh Văn Học 3 Miền</span>
                        </div>
                        <h1 className="litmap-hero-title font-heritage">
                            Bản Đồ Văn Học Việt Nam
                        </h1>
                        <p className="litmap-hero-desc">
                            Mỗi tấc đất, dòng sông, ngọn núi trên dải đất hình chữ S đều thấm đượm những áng thi ca, tích xưa và huyền thoại. Hãy chọn từng miền đất để khám phá di sản văn học gắn liền với địa danh văn hóa.
                        </p>
                    </div>

                    {/* Region Switcher Tabs */}
                    <div className="litmap-tabs-container">
                        {[
                            { id: 'Bắc', name: 'Miền Bắc', sub: 'Kinh Kỳ & Đất Tổ' },
                            { id: 'Trung', name: 'Miền Trung', sub: 'Lam Hồng & Cố Đô' },
                            { id: 'Nam', name: 'Miền Nam', sub: 'Hào sảng Đất Phương Nam' },
                        ].map((reg) => {
                            const isActive = selectedRegion === reg.id;
                            return (
                                <button
                                    key={reg.id}
                                    onClick={() => setSelectedRegion(reg.id)}
                                    className={`litmap-tab-btn ${isActive ? 'litmap-tab-btn-active' : 'litmap-tab-btn-inactive'}`}
                                >
                                    <MapPin className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                                    <div>
                                        <span className="litmap-tab-title">{reg.name}</span>
                                        <span className={`litmap-tab-sub ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                                            {reg.sub}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 2. REGION SPOTLIGHT & LANDMARKS */}
            <section className="litmap-spotlight-section">
                <div className="litmap-spotlight-card">
                    <div className="litmap-spotlight-grid">
                        {/* Region Identity Card */}
                        <div className="litmap-identity-col">
                            <div className="litmap-region-header">
                                <div className="litmap-region-icon-wrapper">
                                    <RegionIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="litmap-region-tag">Khu vực văn hóa</span>
                                    <h2 className="litmap-region-title font-heritage">
                                        {currentRegionData.name}
                                    </h2>
                                </div>
                            </div>
                            <p className="litmap-region-subtitle">
                                {currentRegionData.subtitle}
                            </p>
                            <p className="litmap-region-identity-text">
                                {currentRegionData.identity}
                            </p>
                        </div>

                        {/* Landmark Nodes */}
                        <div className="litmap-landmarks-col">
                            <div className="litmap-landmarks-header">
                                <h3 className="litmap-landmarks-heading">
                                    <Navigation className="w-4 h-4 text-amber-600" />
                                    Địa danh văn hóa nổi bật trong tác phẩm
                                </h3>
                                <span className="text-[11px] text-slate-400">Không gian thực địa</span>
                            </div>

                            <div className="litmap-landmarks-grid">
                                {currentRegionData.landmarks.map((lm, idx) => (
                                    <div key={idx} className="litmap-landmark-card group">
                                        <div className="litmap-landmark-inner">
                                            <div className="litmap-landmark-index">
                                                {idx + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="litmap-landmark-name">
                                                    {lm.name}
                                                </h4>
                                                <p className="litmap-landmark-desc">
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
            <section className="litmap-works-section">
                <div className="litmap-works-header">
                    <div>
                        <h2 className="litmap-works-title font-heritage">
                            Tác Phẩm & Tích Xưa Vùng {currentRegionData.name}
                        </h2>
                        <p className="litmap-works-subtitle">
                            Hiển thị các tác phẩm gắn liền với địa phương và xuất xứ {selectedRegion} Bộ
                        </p>
                    </div>

                    <span className="litmap-works-count">
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
                    <div className="litmap-empty-box">
                        <MapPin className="w-10 h-10 text-amber-500 mx-auto" />
                        <h3 className="text-base font-bold text-slate-900 font-heritage">
                            Chưa có tác phẩm cụ thể cho vùng này
                        </h3>
                        <p className="text-xs text-slate-500">
                            Các tư liệu vùng miền đang tiếp tục được cập nhật vào kho tàng.
                        </p>
                        <Link to="/kham-pha" className="litmap-empty-btn">
                            Khám phá toàn bộ thư viện
                        </Link>
                    </div>
                ) : (
                    <div className="litmap-works-grid">
                        {works.map((work) => {
                            const isSaved = savedWorkIds.has(work._id);
                            return (
                                <article key={work._id} className="litmap-card group">
                                    <div className="litmap-card-body">
                                        <div className="litmap-card-top">
                                            <span className="litmap-card-cat-badge">
                                                {work.categoryName || work.category}
                                            </span>
                                            <span className="litmap-card-region-badge">
                                                <MapPin className="w-3 h-3 text-amber-600" />
                                                {work.region}
                                            </span>
                                        </div>

                                        <h3 className="litmap-card-title font-heritage">
                                            {work.title}
                                        </h3>

                                        <p className="litmap-card-meta">
                                            {work.author || 'Dân gian'} • <span className="text-slate-400">{work.period}</span>
                                        </p>

                                        {work.quote && (
                                            <div className="litmap-card-quote font-heritage">
                                                <PoemDisplay text={work.quote} size="xs" showQuotes={true} />
                                            </div>
                                        )}

                                        <p className="litmap-card-summary">
                                            {work.summary}
                                        </p>
                                    </div>

                                    <div className="litmap-card-footer">
                                        <div className="litmap-card-stats">
                                            <span className="litmap-card-stat">
                                                <Eye className="w-3.5 h-3.5" />
                                                {work.viewsCount || 0}
                                            </span>
                                            <span className="litmap-card-stat">
                                                <ThumbsUp className="w-3.5 h-3.5" />
                                                {work.likesCount || 0}
                                            </span>
                                        </div>

                                        <div className="litmap-card-actions">
                                            <button
                                                onClick={() => toggleSave(work._id)}
                                                className={`litmap-btn-bookmark ${isSaved ? 'litmap-btn-bookmark-saved' : 'litmap-btn-bookmark-unsaved'}`}
                                                title="Lưu vào sổ tay"
                                            >
                                                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
                                            </button>
                                            <button
                                                onClick={() => setActiveModalWork(work)}
                                                className="litmap-btn-detail"
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
                <div className="litmap-modal-overlay">
                    <div className="litmap-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="litmap-modal-header">
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

                        <div className="litmap-modal-body">
                            {activeModalWork.quote && (
                                <div className="litmap-modal-quote-box font-heritage">
                                    <PoemDisplay text={activeModalWork.quote} size="sm" showQuotes={true} />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <h4 className="litmap-modal-section-title">
                                    Tóm tắt cốt truyện / nội dung
                                </h4>
                                <p className="litmap-modal-summary-text">
                                    {activeModalWork.summary}
                                </p>
                            </div>

                            {activeModalWork.content && (
                                <div className="space-y-1.5">
                                    <h4 className="litmap-modal-section-title">
                                        Toàn văn tác phẩm
                                    </h4>
                                    <div className="litmap-modal-fullcontent">
                                        {activeModalWork.content}
                                    </div>
                                </div>
                            )}

                            <div className="litmap-modal-info-grid">
                                {activeModalWork.historicalContext && (
                                    <div className="litmap-modal-info-card-indigo">
                                        <h5 className="text-[11px] font-bold text-indigo-900 uppercase">Dấu ấn địa phương & lịch sử</h5>
                                        <p className="text-xs text-indigo-950/80 leading-relaxed">
                                            {activeModalWork.historicalContext}
                                        </p>
                                    </div>
                                )}
                                {activeModalWork.thematicMeaning && (
                                    <div className="litmap-modal-info-card-emerald">
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

                        <div className="litmap-modal-footer">
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
