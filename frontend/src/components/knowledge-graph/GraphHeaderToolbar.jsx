import { useState } from 'react';
import { 
    Sparkles, 
    Search, 
    X, 
    Volume2, 
    VolumeX, 
    Route, 
    Play, 
    Compass,
    Clock, 
    BookOpen, 
    ZoomIn, 
    ZoomOut, 
    RotateCcw,
    ChevronUp,
    ChevronDown,
    SlidersHorizontal,
    Maximize2,
    LayoutGrid,
    HelpCircle
} from 'lucide-react';

/**
 * GraphHeaderToolbar - Thanh công cụ điều khiển đỉnh đồ thị tri thức
 * Tối ưu hóa không gian hiển thị (Floating Glass Deck), hỗ trợ Zen Mode (Thu gọn/Mở rộng).
 */
const GraphHeaderToolbar = ({
    searchQuery,
    setSearchQuery,
    searchResults,
    onSelectSearchNode,
    selectedCategory,
    setSelectedCategory,
    isSoundEnabled,
    setIsSoundEnabled,
    isTimeMachineActive,
    setIsTimeMachineActive,
    isTourModalOpen,
    setIsTourModalOpen,
    isPathModalOpen,
    setIsPathModalOpen,
    isOntologyModalOpen,
    setIsOntologyModalOpen,
    onZoomIn,
    onZoomOut,
    onResetView,
    graphData,
    viewMode = 'graph',
    setViewMode,
    onOpenQuickGuide
}) => {
    // Chế độ Zen Mode: Thu gọn toàn bộ thanh công cụ để mở rộng không gian vô cực
    const [isZenMode, setIsZenMode] = useState(false);

    if (isZenMode) {
        return (
            <div className="absolute top-4 left-4 z-20 pointer-events-auto animate-fade-in">
                <button
                    onClick={() => setIsZenMode(false)}
                    className="kg-interactive-panel px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 flex items-center gap-2 border border-amber-500/30 shadow-xl shadow-amber-950/30 hover:bg-white/10 transition-all cursor-pointer"
                    title="Mở thanh công cụ điều khiển"
                >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Mở Bảng Điều Khiển</span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>
            </div>
        );
    }

    return (
        <div className="kg-topbar">
            {/* Cột trái: Tiêu đề + Ô tìm kiếm + Bộ lọc thể loại tinh gọn theo hàng ngang */}
            <div className="flex flex-col gap-2 max-w-2xl w-full pointer-events-auto">
                {/* Hàng 1: Tiêu đề + Nút thu gọn Zen Mode */}
                <div className="flex items-center justify-between gap-3 bg-stone-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 w-fit">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-500/20 flex-shrink-0">
                            <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                        </div>
                        <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            <span>Vũ Trụ Tri Thức Dân Gian</span>
                            {isTimeMachineActive && (
                                <span className="text-[9px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold animate-pulse">
                                    CỖ MÁY THỜI GIAN
                                </span>
                            )}
                        </h1>
                    </div>

                    <button
                        onClick={() => setIsZenMode(true)}
                        className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ml-2 cursor-pointer flex items-center gap-1 text-[11px]"
                        title="Thu gọn thanh công cụ để mở rộng tối đa không gian đồ thị"
                    >
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Thu gọn</span>
                    </button>
                </div>

                {/* Hàng 2: Ô tìm kiếm kết hợp dải bộ lọc 5 tầng trên cùng 1 luồng ngang */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Ô tìm kiếm nhỏ gọn */}
                    <div className="relative w-56 sm:w-64">
                        <div className="kg-interactive-panel rounded-xl flex items-center px-3 py-1.5 gap-2 border border-white/10">
                            <Search className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm tác phẩm, biểu tượng..."
                                className="bg-transparent border-none outline-none text-xs text-white placeholder-stone-500 w-full"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-stone-400 hover:text-white"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown kết quả tìm kiếm */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 kg-interactive-panel rounded-xl border border-white/15 overflow-hidden shadow-2xl max-h-60 overflow-y-auto kg-custom-scroll z-50">
                                {searchResults.map((node) => (
                                    <button
                                        key={node.id}
                                        onClick={() => onSelectSearchNode(node)}
                                        className="w-full text-left px-3.5 py-2.5 hover:bg-white/10 flex items-center justify-between border-b border-white/5 last:border-b-0 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: node.color || '#10b981' }}
                                            />
                                            <span className="text-xs font-medium text-stone-200 truncate">
                                                {node.name}
                                            </span>
                                        </div>
                                        <span className="text-[10px] uppercase font-semibold text-stone-400 px-1.5 py-0.5 rounded bg-white/5 flex-shrink-0 ml-2">
                                            {node.type}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bộ lọc 5 tầng tri thức dạng Pill nhỏ gọn */}
                    <div className="flex items-center gap-1 bg-stone-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
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
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                                    selectedCategory === cat.id
                                        ? 'bg-white/20 text-white shadow-sm border border-white/30 font-bold'
                                        : 'hover:bg-white/10 text-stone-400'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cột phải: Các nút công cụ tương tác chuyên sâu */}
            <div className="flex items-center gap-2 pointer-events-auto flex-wrap justify-end">
                {/* Nút bật/tắt âm thanh chuông ngũ cung */}
                <button
                    onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                    className={`kg-interactive-panel p-2 rounded-xl transition-all cursor-pointer ${
                        isSoundEnabled ? 'text-amber-400 border-amber-500/30' : 'text-stone-500'
                    }`}
                    title={isSoundEnabled ? 'Tắt âm thanh tương tác' : 'Bật âm thanh chuông ngũ cung'}
                >
                    {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Nút mở Đường đi văn hóa (BFS Shortest Path) */}
                <button
                    onClick={() => setIsPathModalOpen(!isPathModalOpen)}
                    className="kg-interactive-panel px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-stone-300 hover:text-white transition-all cursor-pointer hover:border-amber-500/50"
                    title="Tìm mạch ngầm kết nối ngắn nhất giữa 2 thực thể bất kỳ"
                >
                    <Route className="w-4 h-4 text-amber-400" />
                    <span className="hidden md:inline">Đường Đi Văn Hóa</span>
                </button>

                {/* Nút mở Chuyến Du Hành Thi Pháp (Semantic Drift AI Tour) - Hero Highlight CTA */}
                <button
                    onClick={() => setIsTourModalOpen(!isTourModalOpen)}
                    className="kg-tour-cta-btn text-xs font-extrabold group"
                    title="Du Hành Thi Pháp & Cổ Mẫu Di Sản (Semantic Drift AI Tour)"
                >
                    <Compass className="w-4 h-4 text-stone-950 stroke-[2.4] group-hover:rotate-45 transition-transform duration-300 flex-shrink-0" />
                    <span>Du Hành Thi Pháp</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-stone-950/20 text-stone-950 font-black tracking-wider uppercase border border-stone-950/20">
                        AI
                    </span>
                </button>

                {/* Nút mở Cỗ Máy Thời Gian Di Sản (Cultural Time-Lapse) */}
                <button
                    onClick={() => setIsTimeMachineActive(!isTimeMachineActive)}
                    className={`kg-interactive-panel px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isTimeMachineActive
                            ? 'text-amber-300 bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                            : 'text-stone-300 hover:text-white border-white/10 hover:border-amber-400/50'
                    }`}
                    title="Khám phá sự tiến hóa của mạng lưới tri thức qua 5 kỷ nguyên lịch sử"
                >
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Cỗ Máy Thời Gian</span>
                </button>

                {/* Nút mở giải thích 4 Tầng Tri Thức (Ontology Guide) */}
                <button
                    onClick={() => setIsOntologyModalOpen(true)}
                    className="kg-interactive-panel px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-stone-300 hover:text-white transition-all cursor-pointer hover:border-amber-500/50"
                    title="Tìm hiểu kiến trúc 4 tầng tri thức đột phá của VietHeritage"
                >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span className="hidden lg:inline">4 Tầng Tri Thức</span>
                </button>

                {/* Nút chuyển đổi góc nhìn: Vũ Trụ Đồ Thị vs Thư Viện Thẻ Bento */}
                {setViewMode && (
                    <button
                        onClick={() => setViewMode(viewMode === 'graph' ? 'grid' : 'graph')}
                        className={`kg-interactive-panel px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            viewMode === 'grid'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                                : 'text-stone-300 hover:text-white border-white/10 hover:border-amber-400/50'
                        }`}
                        title={viewMode === 'graph' ? 'Chuyển sang Chế Độ Thư Viện Thẻ Bento (dễ đọc hơn)' : 'Quay lại Chế Độ Vũ Trụ Đồ Thị'}
                    >
                        <LayoutGrid className="w-4 h-4 text-amber-400" />
                        <span className="hidden sm:inline">{viewMode === 'graph' ? 'Thư Viện Thẻ' : 'Vũ Trụ Đồ Thị'}</span>
                    </button>
                )}

                {/* Nút mở hướng dẫn nhanh 15s */}
                {onOpenQuickGuide && (
                    <button
                        onClick={onOpenQuickGuide}
                        className="kg-interactive-panel p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer"
                        title="Hướng dẫn nhanh cách khám phá"
                    >
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                    </button>
                )}

                {/* Cụm nút điều khiển Zoom canvas */}
                <div className="kg-interactive-panel flex items-center rounded-xl p-1 gap-0.5 border border-white/10">
                    <button
                        onClick={onZoomIn}
                        className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        title="Phóng to"
                    >
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onZoomOut}
                        className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        title="Thu nhỏ"
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onResetView}
                        className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        title="Căn giữa toàn màn hình"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GraphHeaderToolbar;
