import { useState } from 'react';
import { TrendingUp, Users } from 'lucide-react';

const UserGrowthChart = ({ data = [] }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Chuẩn bị 7 ngày gần nhất nếu chưa có dữ liệu từ backend
    const defaultData = (() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({
                label: `${d.getDate()}/${d.getMonth() + 1}`,
                count: 0,
            });
        }
        return days;
    })();

    const chartData = data && data.length > 0 ? data : defaultData;
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
        const x = paddingLeft + (index / (chartData.length - 1 || 1)) * chartWidth;
        const countVal = item.count || 0;
        const y = paddingTop + (1 - countVal / yMax) * chartHeight;
        return { ...item, x, y };
    });

    // Tạo đường cong Cubic Bezier mượt mà
    const generateSmoothPath = (pts) => {
        if (pts.length === 0) return '';
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
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

                        {/* Điểm sáng phát quang */}
                        <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Vạch lưới ngang mờ */}
                    {gridLevels.map((lvl, idx) => {
                        const yPos = paddingTop + (1 - lvl / yMax) * chartHeight;
                        return (
                            <g key={idx}>
                                <line
                                    x1={paddingLeft}
                                    y1={yPos}
                                    x2={width - paddingRight}
                                    y2={yPos}
                                    stroke="#334155"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                    opacity="0.35"
                                />
                                <text
                                    x={paddingLeft - 8}
                                    y={yPos + 4}
                                    textAnchor="end"
                                    fill="#64748b"
                                    fontSize="10"
                                    fontFamily="monospace"
                                >
                                    {lvl}
                                </text>
                            </g>
                        );
                    })}

                    {/* Miền Gradient phía dưới đường cong */}
                    {areaPath && (
                        <path d={areaPath} fill="url(#amberGlow)" />
                    )}

                    {/* Đường cong biểu đồ chính */}
                    {linePath && (
                        <path
                            d={linePath}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* Các điểm dữ liệu mốc tròn và nhãn X-axis */}
                    {points.map((pt, idx) => {
                        const isHovered = hoveredPoint?.label === pt.label;
                        return (
                            <g key={idx}>
                                {/* Đường dóng dọc khi hover hoặc mặc định mờ */}
                                <line
                                    x1={pt.x}
                                    y1={pt.y}
                                    x2={pt.x}
                                    y2={baselineY}
                                    stroke={isHovered ? '#fbbf24' : '#475569'}
                                    strokeWidth={isHovered ? '1.5' : '1'}
                                    strokeDasharray="3 3"
                                    opacity={isHovered ? '0.8' : '0.25'}
                                />

                                {/* Điểm nút (Node Point) */}
                                <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={isHovered ? '6' : '4.5'}
                                    fill="#0f172a"
                                    stroke="#fbbf24"
                                    strokeWidth={isHovered ? '3' : '2'}
                                    filter="url(#pointGlow)"
                                    className="cursor-pointer transition-all duration-150"
                                    onMouseEnter={() => setHoveredPoint(pt)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />

                                {/* Nhãn ngày dưới trục X */}
                                <text
                                    x={pt.x}
                                    y={baselineY + 18}
                                    textAnchor="middle"
                                    fill={isHovered ? '#fbbf24' : '#94a3b8'}
                                    fontSize="11"
                                    fontWeight={isHovered ? '700' : '500'}
                                    className="select-none"
                                >
                                    {pt.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Tooltip nổi khi rê chuột vào điểm */}
                {hoveredPoint && (
                    <div
                        style={{
                            left: `${(hoveredPoint.x / width) * 100}%`,
                            top: `${(hoveredPoint.y / height) * 100}%`,
                            transform: 'translate(-50%, -120%)',
                        }}
                        className="absolute pointer-events-none px-2.5 py-1.5 rounded-lg bg-slate-950 border border-amber-500/50 text-[11px] shadow-xl text-center whitespace-nowrap z-20"
                    >
                        <p className="text-slate-400 font-semibold">{hoveredPoint.label}</p>
                        <p className="text-amber-300 font-bold">
                            +{hoveredPoint.count} sĩ tử mới
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserGrowthChart;
