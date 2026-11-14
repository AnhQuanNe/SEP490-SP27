import { useState, useMemo } from 'react';
import { 
    Crown, 
    Sparkles, 
    Search, 
    ArrowRight, 
    Eye, 
    Compass, 
    BookOpen, 
    Route,
    Clock,
    X,
    Layers
} from 'lucide-react';

/**
 * GraphBentoGridView - Chế độ xem Thư Viện Thẻ (Bento Grid)
 * Giải pháp thay thế trực quan cho người dùng không quen với tương tác đồ thị vật lý.
 * Phân chia dữ liệu theo Trụ Cột và 4 Tầng Tri Thức khoa học, rõ ràng và có cấu trúc.
 */
const GraphBentoGridView = ({
    graphData,
    onSelectNodeOnGraph,
    onOpenTourModal,
    onOpenTimeMachine,
    onOpenPathModal,
    onCloseGrid
}) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const majorHubs = graphData?.majorHubs || [];
    const allNodes = graphData?.nodes || [];

    // Lọc nốt theo tìm kiếm và thể loại
    const filteredNodes = useMemo(() => {
        let list = allNodes;
        if (selectedCategory !== 'all') {
            list = list.filter((n) => n.type === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter((n) => 
                n.name?.toLowerCase().includes(q) ||
                n.description?.toLowerCase().includes(q) ||
                n.archetype?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [allNodes, selectedCategory, searchQuery]);

    const categoryLabels = {
        philosophy: { name: 'Triết Lý Sống', color: '#ec4899', badge: 'bg-pink-500/10 text-pink-300 border-pink-500/30' },
        archetype: { name: 'Cổ Mẫu Di Sản', color: '#f59e0b', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
        region: { name: 'Địa Linh Nhân Kiệt', color: '#3b82f6', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
        work: { name: 'Tác Phẩm & Truyện', color: '#10b981', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
    };

    return (
        <div className="absolute inset-0 z-30 bg-stone-950/95 backdrop-blur-2xl overflow-y-auto kg-custom-scroll p-4 sm:p-6 md:p-8 animate-fade-in text-stone-100">
            {/* Thanh điều hướng đỉnh trang Bento */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            CHẾ ĐỘ THƯ VIỆN THẺ BENTO
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                        <span>Kho Tàng Văn Hóa & Tri Thức Dân Gian</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl">
                        Duyệt toàn bộ mạng lưới tri thức dưới góc nhìn danh mục mạch lạc, phân loại theo Trụ Cột và 4 Tầng Bản Sắc.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={onCloseGrid}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
                    >
                        <span>🪐 Trở Về Vũ Trụ Đồ Thị</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 space-y-8">
                {/* PHẦN 1: 5 TRỤ CỘT VĂN HÓA CỐT LÕI */}
                {majorHubs.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                <Crown className="w-4 h-4" />
                            </div>
                            <h2 className="text-base font-bold text-amber-200">
                                5 Trụ Cột Tri Thức Cốt Lõi (Khởi Nguồn Văn Hóa)
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {majorHubs.map((hub) => (
                                <div
                                    key={hub.id}
                                    className="p-5 rounded-2xl bg-stone-900/80 border border-amber-500/30 hover:border-amber-400/60 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-md"
                                                    style={{ backgroundColor: hub.color || '#ec4899' }}
                                                />
                                                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                                                    {hub.name}
                                                </h3>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold flex-shrink-0">
                                                {hub.degree || 0} liên kết
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-300 leading-relaxed mb-4 line-clamp-3">
                                            {hub.description || 'Trụ cột tư tưởng cốt lõi kết nối hệ thống các cổ mẫu, biểu tượng và kho tàng danh tác dân gian Việt Nam.'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                        <button
                                            onClick={() => onSelectNodeOnGraph(hub)}
                                            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-amber-500/20 text-stone-200 hover:text-amber-200 border border-white/10 hover:border-amber-400/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Định vị trên Vũ Trụ Đồ Thị</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* PHẦN 2: BỘ LỌC VÀ TÌM KIẾM CÁC THỰC THỂ TRI THỨC */}
                <section className="space-y-5 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/60 p-3 rounded-2xl border border-white/10">
                        {/* Thanh tìm kiếm */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm danh tác, biểu tượng cổ mẫu, địa danh..."
                                className="w-full bg-stone-950/80 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Thẻ lọc danh mục */}
                        <div className="flex items-center gap-1.5 overflow-x-auto kg-custom-scroll py-1">
                            {[
                                { id: 'all', label: 'Tất Cả' },
                                { id: 'philosophy', label: '🟣 Triết Lý' },
                                { id: 'archetype', label: '🟠 Cổ Mẫu' },
                                { id: 'region', label: '🔵 Địa Linh' },
                                { id: 'work', label: '🟢 Tác Phẩm' },
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                                        selectedCategory === cat.id
                                            ? 'bg-amber-400 text-stone-950 font-bold shadow-md'
                                            : 'bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white border border-white/5'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Danh sách lưới các thẻ tri thức */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                        {filteredNodes.map((node) => {
                            const catConfig = categoryLabels[node.type] || {
                                name: node.type,
                                color: '#10b981',
                                badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            };

                            return (
                                <div
                                    key={node.id}
                                    onClick={() => onSelectNodeOnGraph(node)}
                                    className="p-4 rounded-2xl bg-stone-900/60 hover:bg-stone-900 border border-white/10 hover:border-amber-400/50 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${catConfig.badge}`}>
                                                {catConfig.name}
                                            </span>
                                            {node.degree && (
                                                <span className="text-[10px] font-mono text-stone-400">
                                                    {node.degree} lk
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors mb-1.5 line-clamp-2">
                                            {node.name}
                                        </h4>

                                        {node.description && (
                                            <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                                                {node.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-[11px] text-amber-400 group-hover:text-amber-300">
                                        <span>Xem trên Đồ thị</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredNodes.length === 0 && (
                        <div className="text-center py-16 bg-stone-900/30 rounded-3xl border border-white/5">
                            <Layers className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                            <p className="text-sm text-stone-400">Không tìm thấy thực thể tri thức phù hợp.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default GraphBentoGridView;

