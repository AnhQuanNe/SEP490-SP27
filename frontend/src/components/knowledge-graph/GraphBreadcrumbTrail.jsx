import { Footprints, ChevronRight, X, RotateCcw } from 'lucide-react';

/**
 * GraphBreadcrumbTrail - Thanh hiển thị "Dấu Chân Khám Phá"
 * Ghi lại chuỗi các nốt người dùng đã đi qua, giúp định vị không gian và quay lại bất kỳ bước nào.
 */
const GraphBreadcrumbTrail = ({ trail = [], onSelectNode, onClearTrail, isSidebarOpen = false }) => {
    if (!trail || trail.length <= 1) return null;

    // Né Sidebar nếu đang mở
    const positionClass = isSidebarOpen
        ? 'top-[96px] left-4 md:left-[calc((100vw-400px)/2)] -translate-x-0 md:-translate-x-1/2'
        : 'top-[96px] left-1/2 -translate-x-1/2';

    return (
        <div className={`absolute z-20 pointer-events-auto max-w-[calc(100vw-32px)] md:max-w-2xl animate-fade-in transition-all duration-300 ${positionClass}`}>
            <div className="bg-stone-950/85 backdrop-blur-xl border border-amber-500/30 rounded-2xl px-3 py-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.12)] flex items-center gap-1.5 sm:gap-2 text-xs">
                {/* Nhãn biểu tượng */}
                <div className="flex items-center gap-1 text-amber-400 font-semibold pr-1.5 border-r border-white/10 flex-shrink-0 text-[11px]">
                    <Footprints className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Hành trình:</span>
                </div>

                {/* Danh sách các nốt theo trình tự */}
                <div className="flex items-center gap-1 overflow-x-auto kg-custom-scroll py-0.5 min-w-0">
                    {trail.map((node, index) => {
                        const isCurrent = index === trail.length - 1;
                        return (
                            <div key={`${node.id}-${index}`} className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => onSelectNode(node)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                                        isCurrent
                                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                                            : 'hover:bg-white/10 text-stone-300 hover:text-white'
                                    }`}
                                    title={`Chuyển góc nhìn đến "${node.name}"`}
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: node.color || '#10b981' }}
                                    />
                                    <span className="truncate max-w-[110px] sm:max-w-[140px]">
                                        {node.name}
                                    </span>
                                </button>
                                {!isCurrent && (
                                    <ChevronRight className="w-3 h-3 text-stone-500 flex-shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Nút xoá lịch sử hành trình */}
                <button
                    onClick={onClearTrail}
                    className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0 ml-1"
                    title="Xóa vết hành trình"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

export default GraphBreadcrumbTrail;

