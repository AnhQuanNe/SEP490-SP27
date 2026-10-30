import { useState } from 'react';
import { Layers, BookOpen } from 'lucide-react';

const CATEGORY_COLORS = {
    'ca-dao': { label: 'Ca Dao Dân Ca', color: '#f59e0b', bgClass: 'bg-amber-500' }, // Amber
    'tuc-ngu': { label: 'Tục Ngữ Việt Nam', color: '#ef4444', bgClass: 'bg-red-500' }, // Red
    'co-tich': { label: 'Cổ Tích Dân Gian', color: '#10b981', bgClass: 'bg-emerald-500' }, // Emerald
    'truyen-thuyet': { label: 'Truyền Thuyết', color: '#6366f1', bgClass: 'bg-indigo-500' }, // Indigo
    'than-thoai': { label: 'Thần Thoại', color: '#06b6d4', bgClass: 'bg-cyan-500' }, // Cyan
    'other': { label: 'Khác', color: '#a855f7', bgClass: 'bg-purple-500' }, // Purple
};

const HeritageCategoryDonutChart = ({ byCategory = {}, totalWorks = 0 }) => {
    const [hoveredCategory, setHoveredCategory] = useState(null);

    // Chuẩn bị dữ liệu mảng
    const items = Object.entries(byCategory).map(([key, count]) => {
        const config = CATEGORY_COLORS[key] || {
            label: key.toUpperCase(),
            color: '#94a3b8',
            bgClass: 'bg-slate-400',
        };
        return {
            key,
            count: Number(count) || 0,
            label: config.label,
            color: config.color,
            bgClass: config.bgClass,
        };
    });

    // Fallback data nếu trống
    const chartItems = items.length > 0 ? items : [
        { key: 'ca-dao', count: 42, label: 'Ca Dao Dân Ca', color: '#f59e0b', bgClass: 'bg-amber-500' },
        { key: 'tuc-ngu', count: 28, label: 'Tục Ngữ Việt Nam', color: '#ef4444', bgClass: 'bg-red-500' },
        { key: 'co-tich', count: 15, label: 'Cổ Tích Dân Gian', color: '#10b981', bgClass: 'bg-emerald-500' },
    ];

    const total = chartItems.reduce((acc, curr) => acc + curr.count, 0) || 1;

    // SVG parameters
    const size = 180;
    const strokeWidth = 26;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Tính toán góc và offset cho từng đoạn donut
    let accumulatedAngle = 0;
    const slices = chartItems.map((item) => {
        const percentage = (item.count / total) * 100;
        const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
        const strokeDashoffset = -accumulatedAngle;
        accumulatedAngle += (percentage / 100) * circumference;

        return {
            ...item,
            percentage: Math.round(percentage),
            strokeDasharray,
            strokeDashoffset,
        };
    });

    return (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-bold text-slate-100 font-heritage tracking-wide">
                            Phân Bổ Thể Loại Di Sản
                        </h3>
                    </div>
                    <p className="text-xs text-slate-400">
                        Tỷ trọng tác phẩm trong kho tàng chính thống
                    </p>
                </div>
            </div>

            {/* Vùng Donut SVG */}
            <div className="relative flex items-center justify-center my-2">
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90 select-none"
                >
                    {/* Vòng nền chìm */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="#1e293b"
                        strokeWidth={strokeWidth}
                    />

                    {/* Các cung thể loại */}
                    {slices.map((slice) => {
                        const isHovered = hoveredCategory === slice.key;
                        return (
                            <circle
                                key={slice.key}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="transparent"
                                stroke={slice.color}
                                strokeWidth={isHovered ? strokeWidth + 5 : strokeWidth}
                                strokeDasharray={slice.strokeDasharray}
                                strokeDashoffset={slice.strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-200 cursor-pointer"
                                onMouseEnter={() => setHoveredCategory(slice.key)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            />
                        );
                    })}
                </svg>

                {/* Tâm vòng Donut: Hiển thị tổng số */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-2xl font-extrabold text-white font-heritage leading-none">
                        {hoveredCategory
                            ? slices.find((s) => s.key === hoveredCategory)?.count
                            : totalWorks || total}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                        {hoveredCategory
                            ? slices.find((s) => s.key === hoveredCategory)?.label?.split(' ')[0]
                            : 'Tác phẩm'}
                    </span>
                </div>
            </div>

            {/* Danh mục Legend chi tiết */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {slices.map((item) => (
                    <div
                        key={item.key}
                        onMouseEnter={() => setHoveredCategory(item.key)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            hoveredCategory === item.key ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-slate-300 font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                            <span className="text-slate-400">{item.count} mục</span>
                            <span className="font-bold text-slate-100 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                {item.percentage}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeritageCategoryDonutChart;
