import { 
    Sparkles, 
    Search, 
    X, 
    Volume2, 
    VolumeX, 
    Route, 
    Play, 
    Clock, 
    BookOpen, 
    ZoomIn, 
    ZoomOut, 
    RotateCcw 
} from 'lucide-react';

/**
 * GraphHeaderToolbar - Thanh công cụ điều khiển đỉnh đồ thị tri thức
 * Chứa tìm kiếm, bộ lọc 4 tầng tri thức, và các nút điều hướng chức năng cao cấp.
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
    graphData
}) => {
    return (
        <div className="kg-topbar">
            {/* Cột trái: Tiêu đề + Ô tìm kiếm + Bộ lọc thể loại */}
            <div className="flex flex-col gap-2.5 max-w-xl w-full pointer-events-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/20">
                        <Sparkles className="w-4 h-4 text-stone-950" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-white tracking-wide font-heritage flex items-center gap-2">
                            <span>Vũ Trụ Tri Thức Văn Hóa Dân Gian</span>
                            {isTimeMachineActive && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold animate-pulse">
                                    CỖ MÁY THỜI GIAN
                                </span>
                            )}
                        </h1>
                        <p className="text-xs text-stone-400 font-light hidden sm:block">
                            Khám phá mạng lưới liên kết ngữ nghĩa giữa Triết lý, Cổ mẫu, Địa linh và Tác phẩm
                        </p>
                    </div>
                </div>

                {/* Ô tìm kiếm thực thể */}
                <div className="relative">
                    <div className="kg-interactive-panel rounded-xl flex items-center px-3.5 py-2 gap-2.5 border border-white/10">
                        <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm tác phẩm, cổ mẫu, triết lý (ví dụ: Thánh Gióng, Con Cò, Đạo Hiếu...)"
                            className="bg-transparent border-none outline-none text-xs text-white placeholder-stone-500 w-full"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-stone-400 hover:text-white"
                            >
                                <X className="w-3.5 h-3.5" />
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
                                    className="w-full text-left px-3.5 py-2.5 hover:bg-white/10 flex items-center justify-between border-b border-white/5 last:border-b-0 transition-colors"
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

                {/* Bộ lọc theo 4 tầng bản thể học (Ontology Layers) */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                        { id: 'all', label: 'Tất Cả', color: '#94a3b8' },
                        { id: 'philosophy', label: '🟣 Triết Lý', color: '#a855f7' },
                        { id: 'archetype', label: '🟠 Cổ Mẫu', color: '#f59e0b' },
                        { id: 'region', label: '🔵 Địa Linh', color: '#3b82f6' },
                        { id: 'work', label: '🟢 Tác Phẩm', color: '#10b981' },
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                selectedCategory === cat.id
                                    ? 'bg-white/20 text-white shadow-sm border border-white/30 font-bold'
                                    : 'bg-stone-900/60 hover:bg-white/10 text-stone-400 border border-white/5'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
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

                {/* Nút mở Chuyến Du Hành Văn Hóa Tự Động (AI Guided Tour) */}
                <button
                    onClick={() => setIsTourModalOpen(!isTourModalOpen)}
                    className="kg-interactive-panel px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-stone-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                    title="Bắt đầu chuyến du hành văn hóa tự động theo dòng cảm xúc"
                >
                    <Play className="w-3.5 h-3.5 fill-stone-950" />
                    <span>Du Hành AI</span>
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
                    <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
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
                        title="Khôi phục góc nhìn vũ trụ"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GraphHeaderToolbar;
