import { Route, X, Loader2, Sparkles } from 'lucide-react';

/**
 * GraphPathModal - Modal tìm kiếm đường đi ngắn nhất giữa 2 thực thể bất kỳ (BFS)
 */
const GraphPathModal = ({
    isOpen,
    onClose,
    pathSource,
    setPathSource,
    pathTarget,
    setPathTarget,
    isFindingPath,
    onFindShortestPath,
    graphData
}) => {
    if (!isOpen) return null;

    return (
        <div className="kg-path-modal">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <Route className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">
                        Khai Phá Đường Đi Văn Hóa
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-6 space-y-4">
                <p className="text-xs text-stone-300 leading-relaxed">
                    Thuật toán đồ thị <b>BFS (Breadth-First Search)</b> sẽ tìm chuỗi liên kết ngữ nghĩa ngắn nhất nối liền giữa hai thực thể tư tưởng hoặc cổ mẫu dân gian bất kỳ.
                </p>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-stone-400 mb-1">
                            Thực thể khởi nguồn (Source Node):
                        </label>
                        <select
                            value={pathSource}
                            onChange={(e) => setPathSource(e.target.value)}
                            className="w-full p-2.5 rounded-lg bg-stone-900 border border-white/15 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
                        >
                            {graphData?.nodes?.map((n) => (
                                <option key={n.id} value={n.id}>
                                    [{n.type.toUpperCase()}] {n.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-stone-400 mb-1">
                            Thực thể đích đến (Target Node):
                        </label>
                        <select
                            value={pathTarget}
                            onChange={(e) => setPathTarget(e.target.value)}
                            className="w-full p-2.5 rounded-lg bg-stone-900 border border-white/15 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
                        >
                            {graphData?.nodes?.map((n) => (
                                <option key={n.id} value={n.id}>
                                    [{n.type.toUpperCase()}] {n.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={onFindShortestPath}
                        disabled={isFindingPath || pathSource === pathTarget}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {isFindingPath ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Đang duyệt cây đồ thị...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                <span>Khai Phá Đường Đi Ngữ Nghĩa</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GraphPathModal;
