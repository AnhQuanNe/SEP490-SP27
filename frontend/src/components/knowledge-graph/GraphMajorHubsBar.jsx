import { useState } from 'react';
import { Crown, ChevronDown, ChevronUp, Sparkles, Compass } from 'lucide-react';

/**
 * GraphMajorHubsBar - Thanh Floating Dock điều hướng các Trụ Cột Văn Hóa Cốt Lõi
 * Đặt cân đối ở đáy màn hình (Bottom-Center Dock), thiết kế chuẩn mực Glassmorphism hoàng gia.
 * Tuyệt đối không đè lên Topbar hay Chatbot, hỗ trợ thu gọn/mở rộng linh hoạt.
 */
const GraphMajorHubsBar = ({
    majorHubs = [],
    activeNode,
    onSelectHub,
    isTimeMachineActive = false,
    isTourActive = false,
    isPathResultActive = false,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Tự động ẩn nếu đang mở Cỗ máy thời gian, đang chạy Chuyến du hành hoặc đang xem Đường đi văn hóa
    if (isTimeMachineActive || isTourActive || isPathResultActive || !majorHubs || majorHubs.length === 0) {
        return null;
    }

    // Tính toán vị trí cân đối: Nếu Sidebar đang mở (activeNode != null), né sang trái để căn giữa vùng canvas thực tế
    const containerPositionClass = activeNode
        ? 'bottom-6 left-4 md:left-[calc((100vw-400px)/2)] -translate-x-0 md:-translate-x-1/2'
        : 'bottom-6 left-1/2 -translate-x-1/2';

    // Trạng thái thu gọn thành viên ngọc nhỏ gọn ở đáy màn hình
    if (isCollapsed) {
        return (
            <div className={`absolute z-20 pointer-events-auto animate-fade-in transition-all duration-300 ${containerPositionClass}`}>
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="group px-4 py-2 rounded-full bg-stone-950/85 hover:bg-stone-900 backdrop-blur-2xl border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-2 shadow-[0_12px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.15)] transition-all hover:scale-105 cursor-pointer"
                    title="Mở thanh khám phá các Trụ Cột Văn Hóa Cốt Lõi"
                >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-sm flex-shrink-0">
                        <Crown className="w-3 h-3 fill-stone-950" />
                    </div>
                    <span>Trụ Cột Cốt Lõi ({majorHubs.length})</span>
                    <ChevronUp className="w-3.5 h-3.5 text-amber-400/80 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            </div>
        );
    }

    return (
        <div className={`absolute z-20 pointer-events-auto max-w-[calc(100vw-32px)] md:max-w-3xl animate-fade-in transition-all duration-300 ${containerPositionClass}`}>
            <div className="relative overflow-hidden rounded-full bg-stone-950/85 backdrop-blur-2xl border border-amber-500/35 px-3 py-2 sm:px-4 sm:py-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(245,158,11,0.15)] flex items-center gap-2 sm:gap-3">
                {/* Ánh sáng mờ trang trí chạy ngầm */}
                <div className="absolute -top-6 left-1/4 w-36 h-20 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Phần nhãn tiêu đề bên trái */}
                <div className="flex items-center gap-2 pr-2.5 sm:pr-3 border-r border-white/10 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-md shadow-amber-500/30 flex-shrink-0">
                        <Crown className="w-3.5 h-3.5 fill-stone-950" />
                    </div>
                    <div className="hidden lg:flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-amber-300 tracking-wider uppercase">
                                TRỤ CỘT CỐT LÕI
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        </div>
                        <span className="text-[9px] text-amber-300/90 font-medium">
                            Bắt đầu từ đây 👇
                        </span>
                    </div>
                </div>

                {/* Danh sách các nút viên nang Trụ cột */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto kg-custom-scroll py-0.5 flex-1 min-w-0">
                    {majorHubs.map((hub) => {
                        const isSelected = activeNode?.id === hub.id;
                        return (
                            <button
                                key={hub.id}
                                onClick={() => onSelectHub(hub)}
                                className={`px-3 py-1.5 rounded-full text-xs transition-all flex-shrink-0 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                                    isSelected
                                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/30 scale-105'
                                        : 'bg-white/5 hover:bg-white/12 text-stone-200 hover:text-white border border-white/10 hover:border-amber-400/40 hover:scale-[1.02]'
                                }`}
                                title={`Khám phá trụ cột "${hub.name}" (${hub.degree || 0} liên kết di sản)`}
                            >
                                <span
                                    className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm"
                                    style={{
                                        backgroundColor: hub.color || '#ec4899',
                                        boxShadow: isSelected ? '0 0 6px rgba(0,0,0,0.5)' : `0 0 8px ${hub.color || '#ec4899'}`
                                    }}
                                />
                                <span className="font-medium">
                                    {hub.name}
                                </span>
                                {hub.degree && (
                                    <span
                                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                                            isSelected
                                                ? 'bg-stone-950/20 text-stone-950 font-bold'
                                                : 'bg-white/10 text-stone-400'
                                        }`}
                                    >
                                        {hub.degree}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Nút thu gọn thanh Dock */}
                <button
                    onClick={() => setIsCollapsed(true)}
                    className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer ml-1"
                    title="Thu gọn thanh trụ cột để ngắm trọn vẹn vũ trụ"
                >
                    <ChevronDown className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

export default GraphMajorHubsBar;
