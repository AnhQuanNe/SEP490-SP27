import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Globe,
    Search,
    Heart,
    Video,
    Camera,
    Plus,
    Filter,
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    Eye,
    UploadCloud,
    X
} from 'lucide-react';

const LocalSignSpace = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [likedItems, setLikedItems] = useState({});
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const categories = [
        { id: 'all', label: 'Tất cả chủ đề' },
        { id: 'greeting', label: 'Chào hỏi & Giao tiếp' },
        { id: 'family', label: 'Gia đình & Xưng hô' },
        { id: 'food', label: 'Ẩm thực & Đồ uống' },
        { id: 'daily', label: 'Sinh hoạt thường ngày' },
    ];

    const synsets = [
        {
            id: 'syn-1',
            concept: 'Cảm ơn',
            category: 'greeting',
            description: 'Biểu thị sự biết ơn, cảm kích đối với người khác.',
            variants: [
                {
                    region: 'Miền Bắc (Hà Nội)',
                    description: 'Tay chạm cằm rồi đưa nhẹ ra phía trước kèm nụ cười.',
                    likes: 142,
                    author: 'CLB Khiếm thính Hà Nội',
                },
                {
                    region: 'Miền Nam (TP.HCM)',
                    description: 'Hai bàn tay chắp nhẹ trước ngực gật đầu nhẹ.',
                    likes: 98,
                    author: 'Chi hội Người Điếc TP.HCM',
                }
            ],
            culturalNotes: 'Ở miền Bắc thường dùng cử chỉ chạm cằm dứt khoát; ở miền Nam mang nét giao thoa văn hóa thể hiện sự cung kính hơn.'
        },
        {
            id: 'syn-2',
            concept: 'Bệnh viện',
            category: 'daily',
            description: 'Địa điểm cơ sở y tế khám chữa bệnh.',
            variants: [
                {
                    region: 'Miền Bắc',
                    description: 'Dấu chữ thập đỏ bằng hai ngón tay trước ngực.',
                    likes: 85,
                    author: 'Trường Chuyên biệt Xã Đàn',
                },
                {
                    region: 'Miền Nam',
                    description: 'Cử chỉ ống nghe bác sĩ đặt lên ngực.',
                    likes: 120,
                    author: 'CLB Hoa Hướng Dương',
                }
            ],
            culturalNotes: 'Biến thể miền Nam mô phỏng hành vi khám bệnh của bác sĩ, biến thể miền Bắc thiên về biểu tượng chữ thập.'
        },
        {
            id: 'syn-3',
            concept: 'Bánh mì',
            category: 'food',
            description: 'Món ăn quen thuộc phổ biến trong văn hóa ẩm thực Việt Nam.',
            variants: [
                {
                    region: 'Miền Bắc & Miền Trung',
                    description: 'Hai tay gập vòm mô phỏng ổ bánh mì dài.',
                    likes: 64,
                    author: 'Tình nguyện viên HSS',
                },
                {
                    region: 'Miền Nam',
                    description: 'Mô phỏng hành động bẻ đôi ổ bánh mì giòn.',
                    likes: 110,
                    author: 'CLB Khiếm thính Sài Gòn',
                }
            ],
            culturalNotes: 'Ký hiệu miền Nam gắn liền với văn hóa ăn bánh mì cắt đôi/bẻ đôi đặc trưng.'
        }
    ];

    const toggleLike = (id, region) => {
        const key = `${id}-${region}`;
        setLikedItems((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const filteredSynsets = synsets.filter((item) => {
        const matchesQuery = item.concept.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesQuery && matchesCategory;
    });

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Không Gian Phương Ngữ & Ngữ Liệu Synset
                            </h1>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Mô hình Synset: 1 Khái niệm — Đối chiếu song song biến thể cử chỉ Bắc, Trung, Nam.
                        </p>
                    </div>
                </div>

                {/* Upload Contribution Button */}
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 shadow-md shadow-emerald-500/20 transition self-stretch sm:self-auto justify-center"
                >
                    <Camera className="w-4 h-4" />
                    <span>Đóng Góp Video Mới (UC13)</span>
                </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm khái niệm, cử chỉ (ví dụ: Cảm ơn, Bệnh viện, Bánh mì)..."
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                                selectedCategory === cat.id
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Synsets Comparison Cards */}
            <div className="space-y-8">
                {filteredSynsets.map((synset) => (
                    <div key={synset.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                        
                        {/* Synset Concept Title Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                                    Khái niệm Synset
                                </span>
                                <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                                    "{synset.concept}"
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">{synset.description}</p>
                            </div>

                            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                                {synset.variants.length} Biến thể vùng miền
                            </span>
                        </div>

                        {/* Parallel Video Comparison Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {synset.variants.map((v, i) => {
                                const isLiked = likedItems[`${synset.id}-${v.region}`];
                                const currentLikes = v.likes + (isLiked ? 1 : 0);

                                return (
                                    <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-4 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            {/* Video Container Mockup */}
                                            <div className="relative rounded-xl bg-slate-950 aspect-video flex items-center justify-center text-white overflow-hidden group shadow-inner">
                                                <div className="w-12 h-12 rounded-full bg-emerald-600/80 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                                    <Video className="w-5 h-5" />
                                                </div>
                                                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 font-bold text-[10px] text-white">
                                                    {v.region}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="font-extrabold text-sm text-slate-900">{v.region}</h4>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{v.description}</p>
                                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Đóng góp bởi: {v.author}</p>
                                            </div>
                                        </div>

                                        {/* Community Voting Button (UC14) */}
                                        <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                                            <span className="text-xs text-slate-500 font-medium">Thẩm định cử chỉ:</span>
                                            <button
                                                onClick={() => toggleLike(synset.id, v.region)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                                                    isLiked
                                                        ? 'bg-rose-500 text-white'
                                                        : 'bg-white text-slate-700 hover:text-rose-600 border border-slate-200'
                                                }`}
                                            >
                                                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                                                <span>{currentLikes} Thả tim</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Cultural Notes */}
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                            <span className="font-bold flex items-center gap-1.5 text-amber-800">
                                <Sparkles className="w-3.5 h-3.5" /> Ghi Chú Văn Hóa & Phương Ngữ
                            </span>
                            <p className="leading-relaxed text-amber-800/90">{synset.culturalNotes}</p>
                        </div>

                    </div>
                ))}
            </div>

            {/* CROWDSOURCING UPLOAD MODAL (UC13) */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
                        <button
                            onClick={() => setIsUploadModalOpen(false)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-1">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                Crowdsourced Studio
                            </span>
                            <h3 className="text-xl font-black text-slate-900">
                                Đóng Góp Video Cử Chỉ Mới
                            </h3>
                            <p className="text-xs text-slate-500">
                                Video của bạn sẽ được gửi vào Review Queue để Quản trị viên thẩm định trước khi hiển thị chính thức.
                            </p>
                        </div>

                        <div className="space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-slate-700 mb-1">Khái niệm cử chỉ</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Cơm tấm, Trà đá..."
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-normal"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 mb-1">Vùng miền / Địa phương</label>
                                <select className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-normal">
                                    <option>Miền Bắc (Hà Nội, Hải Phòng...)</option>
                                    <option>Miền Trung (Đà Nẵng, Huế...)</option>
                                    <option>Miền Nam (TP.HCM, Cần Thơ...)</option>
                                </select>
                            </div>

                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2 hover:border-emerald-400 transition cursor-pointer">
                                <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto" />
                                <p className="font-bold text-slate-700">Kéo thả video hoặc bấm để quay webcam</p>
                                <p className="text-[11px] text-slate-400 font-normal">Định dạng MP4, WebM (Tối đa 50MB, thời lượng 5 - 15 giây)</p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="flex-1 py-3 rounded-xl text-slate-700 font-bold text-xs bg-slate-100 hover:bg-slate-200 transition"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={() => {
                                    alert('Đã gửi video của bạn vào Review Queue thành công! Ban quản trị sẽ sớm duyệt video.');
                                    setIsUploadModalOpen(false);
                                }}
                                className="flex-1 py-3 rounded-xl text-white font-bold text-xs bg-emerald-600 hover:bg-emerald-700 transition shadow-md"
                            >
                                Gửi Phê Duyệt
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default LocalSignSpace;
