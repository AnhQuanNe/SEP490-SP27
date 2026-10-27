import { Play, X, Clock } from 'lucide-react';

/**
 * GraphTourModal - Modal chọn chuyến du hành văn hóa tự động (AI Guided Tours)
 */
const GraphTourModal = ({
    isOpen,
    onClose,
    tours,
    onStartTour
}) => {
    if (!isOpen) return null;

    return (
        <div className="kg-tour-modal-overlay">
            <div className="kg-tour-modal-box">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                <Play className="w-4 h-4 fill-amber-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white tracking-wide">
                                Chọn Chuyến Du Hành Văn Hóa Tự Động
                            </h3>
                        </div>
                        <p className="text-xs text-stone-400 mt-1">
                            AI sẽ tự động điều khiển camera bay lượn và thuyết minh từng chặng theo mạch tư tưởng của cha ông
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Danh sách các Tours */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto kg-custom-scroll">
                    {tours?.map((tour) => (
                        <div
                            key={tour.id}
                            onClick={() => onStartTour(tour)}
                            className="kg-tour-card group cursor-pointer"
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <span
                                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-stone-950"
                                    style={{ backgroundColor: tour.themeColor || '#f59e0b' }}
                                >
                                    {tour.badge}
                                </span>
                                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-stone-400" />
                                    {tour.duration}
                                </span>
                            </div>

                            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                                {tour.title}
                            </h4>
                            <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                                {tour.description}
                            </p>

                            {/* Danh sách các chặng dừng */}
                            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-stone-300">
                                    <span className="text-amber-400 font-bold">{tour.stops?.length || 0}</span>
                                    <span className="text-stone-400">chặng dừng chân</span>
                                </div>
                                <button className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-all cursor-pointer">
                                    <Play className="w-3 h-3 fill-stone-950" />
                                    <span>Khởi Hành</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GraphTourModal;
