import { useState } from 'react';
import { TrendingUp, Users, Calendar } from 'lucide-react';

const UserGrowthChart = ({ data = [] }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Fallback nếu chưa có dữ liệu từ backend
    const chartData = data && data.length > 0 ? data : [
        { label: '22/10', count: 2 },
        { label: '23/10', count: 4 },
        { label: '24/10', count: 3 },
        { label: '25/10', count: 7 },
        { label: '26/10', count: 5 },
        { label: '27/10', count: 8 },
        { label: '28/10', count: 12 },
    ];

    const totalNew = chartData.reduce((acc, curr) => acc + (curr.count || 0), 0);

    // Kích thước SVG
    const width = 600;
    const height = 220;
    const paddingLeft = 35;
    const paddingRight = 25;
    const paddingTop = 25;
    const paddingBottom = 35;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxCount = Math.max(5, ...chartData.map((d) => d.count || 0));
    // Bo tròn số mốc trần Y-axis lên bội số của 2 hoặc 5
    const yMax = Math.ceil(maxCount * 1.25);

    // Tọa độ các điểm (X, Y)
    const points = chartData.map((item, index) => {
        const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
        const countVal = item.count || 0;
        const y = paddingTop + (1 - countVal / yMax) * chartHeight;
        return { ...item, x, y };
    });

    // Tạo đường cong Cubic Bezier mượt mà
    const generateSmoothPath = (pts) => {
        if (pts.length === 0) return '';
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            const cp1y = p0.y;
            const cp2x = p0.x + (p1.x - p0.x) / 2;
            const cp2y = p1.y;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
        return d;
    };

    const linePath = generateSmoothPath(points);
    const baselineY = paddingTop + chartHeight;
    const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
        : '';

    // Lưới ngang (3 vạch chuẩn)
    const gridLevels = [0, Math.round(yMax / 2), yMax];

    return (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-sm">
            {/* Header Thống Kê */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-bold text-slate-100 font-heritage tracking-wide">
                            Xu Hướng Sĩ Tử Mới (7 Ngày Qua)
                        </h3>
                    </div>
                    <p className="text-xs text-slate-400">
                        Số lượng tài khoản đăng ký mới ghi danh vào hệ thống
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>+{totalNew} Sĩ tử tuần này</span>
                    </div>
                </div>
            </div>

            {/* Vùng Vẽ Biểu Đồ SVG Tương Tác */}
            <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] min-h-[190px]">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full overflow-visible select-none"
                >
                    <defs>
                        {/* Gradient đổ bóng miền hoàng kim */}
                        <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                            <stop offset="60%" stopColor="#d97706" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#b45309" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Bộ lọc phát sáng neon cho đường viền */}
                        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#f59e0b" floodOpacity="0.4" />
                        </filter>
                    </defs>

                    {/* Đường lưới ngang Y-Axis */}
                    {gridLevels.map((val, idx) => {
                        const y = paddingTop + (1 - val / yMax) * chartHeight;
                        return (
                            <g key={idx}>
                                <line
                                    x1={paddingLeft}
                                    y1={y}
                                    x2={width - paddingRight}
                                    y2={y}
                                    stroke="#334155"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                    opacity="0.5"
                                />
                                <text
                                    x={paddingLeft - 8}
                                    y={y + 3.5}
                                    textAnchor="end"
                                    fill="#64748b"
                                    fontSize="10"
                                    fontFamily="monospace"
                                >
                                    {val}
                                </text>
                            </g>
                        );
                    })}

                    {/* Vùng đổ màu Gradient (Area Fill) */}
                    <path d={areaPath} fill="url(#amberGlow)" />

                    {/* Đường viền cong chính (Main Curve Line) */}
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        filter="url(#goldGlow)"
                    />

                    {/* Các mốc điểm tương tác (Interactive Dots & Axis Labels) */}
                    {points.map((p, index) => {
                        const isHovered = hoveredPoint?.date === p.date || hoveredPoint?.label === p.label;
                        return (
                            <g key={index} className="cursor-pointer">
                                {/* Trục X - Nhãn Ngày */}
                                <text
                                    x={p.x}
                                    y={baselineY + 20}
                                    textAnchor="middle"
                                    fill={isHovered ? '#fbbf24' : '#94a3b8'}
                                    fontSize="11"
                                    fontWeight={isHovered ? 'bold' : 'normal'}
                                    className="transition-colors"
                                >
                                    {p.label}
                                </text>

                                {/* Cột cảm ứng hover dọc */}
                                <rect
                                    x={p.x - 18}
                                    y={paddingTop}
                                    width={36}
                                    height={chartHeight}
                                    fill="transparent"
                                    onMouseEnter={() => setHoveredPoint(p)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />

                                {/* Đường dọi thẳng khi hover */}
                                {isHovered && (
                                    <line
                                        x1={p.x}
                                        y1={paddingTop}
                                        x2={p.x}
                                        y2={baselineY}
                                        stroke="#f59e0b"
                                        strokeWidth="1.5"
                                        strokeDasharray="3 3"
                                        opacity="0.8"
                                    />
                                )}

                                {/* Điểm tròn dữ liệu */}
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={isHovered ? 6 : 4}
                                    fill="#0f172a"
                                    stroke="#f59e0b"
                                    strokeWidth={isHovered ? 3 : 2}
                                    className="transition-all duration-150"
                                />

                                {isHovered && (
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={10}
                                        fill="#f59e0b"
                                        opacity="0.3"
                                        className="animate-ping pointer-events-none"
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Floating Tooltip HTML khi rê chuột */}
                {hoveredPoint && (
                    <div
                        className="absolute pointer-events-none z-20 px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/50 shadow-xl shadow-black/80 text-center transform -translate-x-1/2 -translate-y-full transition-all"
                        style={{
                            left: `${(hoveredPoint.x / width) * 100}%`,
                            top: `${(hoveredPoint.y / height) * 100}%`,
                            marginTop: '-12px',
                        }}
                    >
                        <p className="text-[10px] text-slate-400 font-medium">
                            Ngày {hoveredPoint.label}
                        </p>
                        <p className="text-xs font-extrabold text-amber-300">
                            +{hoveredPoint.count} Sĩ tử mới
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserGrowthChart;
