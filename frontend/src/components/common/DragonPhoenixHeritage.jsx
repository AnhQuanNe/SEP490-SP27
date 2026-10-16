import React from 'react';

/**
 * Component Hiệu ứng Động "Rồng Bay Phượng Múa" (Dragon Soaring & Phoenix Dancing)
 * Phong cách Cung Đình & Di Sản Cổ Truyền Việt Nam (Thăng Long - Đông Sơn)
 */
const DragonPhoenixHeritage = ({ variant = 'hero' }) => {
    return (
        <div className={`pointer-events-none select-none relative overflow-hidden w-full ${variant === 'hero' ? 'h-full min-h-[460px] lg:min-h-[520px]' : 'h-48'}`}>
            {/* 1. MẶT TRỜI TRỐNG ĐỒNG ĐÔNG SƠN (TRUNG TÂM HOÀNG ĐẠO) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] lg:w-[540px] lg:h-[540px] opacity-15">
                <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full animate-dongson-slow text-amber-500 fill-none stroke-current"
                >
                    {/* Các vòng tròn đồng tâm & ngôi sao 14 cánh Đông Sơn */}
                    <circle cx="200" cy="200" r="190" strokeWidth="2" strokeDasharray="6 4" />
                    <circle cx="200" cy="200" r="170" strokeWidth="1.5" />
                    <circle cx="200" cy="200" r="145" strokeWidth="3" strokeDasharray="3 3" />
                    <circle cx="200" cy="200" r="110" strokeWidth="1.5" />
                    <circle cx="200" cy="200" r="80" strokeWidth="2" strokeDasharray="8 4" />
                    <circle cx="200" cy="200" r="45" strokeWidth="2" />
                    
                    {/* Ngôi sao mặt trời 14 cánh */}
                    <polygon
                        points="200,158 208,185 235,178 218,198 242,208 218,218 235,238 208,231 200,258 192,231 165,238 182,218 158,208 182,198 165,178 192,185"
                        fill="currentColor"
                        opacity="0.3"
                    />

                    {/* Vòng chim Lạc bay ngược chiều kim đồng hồ đặc trưng trống đồng Ngọc Lũ */}
                    <g transform="rotate(0 200 200)">
                        <path d="M 200 35 Q 215 45 235 38 Q 220 55 200 50 Z" fill="currentColor" opacity="0.4" />
                    </g>
                    <g transform="rotate(60 200 200)">
                        <path d="M 200 35 Q 215 45 235 38 Q 220 55 200 50 Z" fill="currentColor" opacity="0.4" />
                    </g>
                    <g transform="rotate(120 200 200)">
                        <path d="M 200 35 Q 215 45 235 38 Q 220 55 200 50 Z" fill="currentColor" opacity="0.4" />
                    </g>
                    <g transform="rotate(180 200 200)">
                        <path d="M 200 35 Q 215 45 235 38 Q 220 55 200 50 Z" fill="currentColor" opacity="0.4" />
                    </g>
                    <g transform="rotate(240 200 200)">
                        <path d="M 200 35 Q 215 45 235 38 Q 220 55 200 50 Z" fill="currentColor" opacity="0.4" />
                    </g>
                    <g transform="rotate(300 200 200)">
                        <path d="M 200 35 Q 215 45 235 38 Q 220 55 200 50 Z" fill="currentColor" opacity="0.4" />
                    </g>
                </svg>
            </div>

            {/* 2. RỒNG THỜI LÝ UỐN LƯỢN (THĂNG LONG KIM LONG - PHÍA TẢ / BÊN TRÁI) */}
            <div className="absolute -left-6 sm:left-4 lg:left-12 top-4 sm:top-10 w-52 sm:w-72 lg:w-96 h-64 sm:h-80 lg:h-96 animate-dragon-soar">
                <svg
                    viewBox="0 0 320 320"
                    className="w-full h-full filter drop-shadow-[0_0_18px_rgba(234,179,8,0.45)]"
                >
                    <defs>
                        <linearGradient id="dragonGold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FEF08A" />
                            <stop offset="35%" stopColor="#EAB308" />
                            <stop offset="70%" stopColor="#B45309" />
                            <stop offset="100%" stopColor="#78350F" />
                        </linearGradient>
                        <linearGradient id="dragonFlame" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#DC2626" />
                            <stop offset="50%" stopColor="#EA580C" />
                            <stop offset="100%" stopColor="#FBBF24" />
                        </linearGradient>
                        <radialGradient id="pearlShine" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="40%" stopColor="#FDE047" />
                            <stop offset="80%" stopColor="#EAB308" />
                            <stop offset="100%" stopColor="#B45309" />
                        </radialGradient>
                    </defs>

                    {/* Ngọc minh châu trước miệng rồng */}
                    <circle cx="178" cy="98" r="9" fill="url(#pearlShine)" className="animate-golden-shimmer" />
                    <circle cx="178" cy="98" r="14" fill="none" stroke="#FDE047" strokeWidth="1" opacity="0.5" strokeDasharray="3 2" />

                    {/* Tia hào quang ngọc */}
                    <path d="M 178 84 L 178 80 M 178 112 L 178 116 M 164 98 L 160 98 M 192 98 L 196 98" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

                    {/* Thân Rồng thời Lý uốn khúc hình sin nhịp nhàng mềm mại */}
                    <path
                        d="M 148 112
                           C 130 95, 95 90, 75 118
                           C 55 145, 60 185, 95 195
                           C 135 205, 175 170, 160 225
                           C 148 260, 95 270, 65 250
                           C 45 235, 40 200, 30 220
                           C 20 240, 35 275, 60 290
                           C 95 310, 150 295, 175 255
                           C 205 205, 160 165, 120 160
                           C 90 155, 85 130, 105 115
                           C 120 105, 140 115, 148 112 Z"
                        fill="url(#dragonGold)"
                        opacity="0.95"
                    />

                    {/* Vảy rồng và đường sống lưng thời Lý */}
                    <path
                        d="M 148 112
                           C 130 95, 95 90, 75 118
                           C 55 145, 60 185, 95 195
                           C 135 205, 175 170, 160 225
                           C 148 260, 95 270, 65 250"
                        fill="none"
                        stroke="#FEF08A"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        opacity="0.9"
                    />

                    {/* Đầu rồng thời Lý ngẩng cao, bờm lửa uốn lượn */}
                    <g transform="translate(132, 85)">
                        {/* Miệng rồng mở rộng */}
                        <path d="M 10 22 C 22 18, 38 15, 44 26 C 36 29, 25 31, 16 32 Z" fill="url(#dragonGold)" />
                        {/* Mũi rồng vút cao hình ngọn lửa đặc trưng thời Lý */}
                        <path d="M 38 18 C 45 10, 50 2, 44 0 C 38 0, 32 10, 30 16 Z" fill="url(#dragonFlame)" />
                        {/* Râu rồng uốn lượn thướt tha */}
                        <path d="M 40 25 C 55 35, 75 30, 85 45 C 90 55, 85 70, 75 75" fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M 35 28 C 48 42, 60 48, 65 65" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                        {/* Mắt rồng đính ngọc */}
                        <circle cx="24" cy="18" r="3.5" fill="#FFFFFF" />
                        <circle cx="25" cy="17.5" r="1.8" fill="#78350F" />
                        {/* Bờm rồng tỏa hào quang như sóng nước và mây */}
                        <path d="M 12 12 C 5 -5, -15 0, -25 8 C -15 15, 0 16, 5 22 Z" fill="url(#dragonFlame)" opacity="0.9" />
                        <path d="M 6 18 C -5 10, -20 18, -28 28 C -15 30, 0 25, 2 30 Z" fill="url(#dragonFlame)" opacity="0.8" />
                    </g>

                    {/* Mây lửa cuộn quanh thân rồng */}
                    <path
                        d="M 60 170 C 45 160, 35 175, 45 185 C 55 195, 70 185, 60 170 Z
                           M 130 215 C 145 205, 155 220, 145 230 C 135 240, 120 230, 130 215 Z"
                        fill="url(#dragonFlame)"
                        opacity="0.8"
                    />

                    {/* Móng rồng thời Lý thanh mảnh uốn lượn */}
                    <path d="M 98 128 C 115 135, 125 150, 120 158" fill="none" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 120 158 L 126 156 M 120 158 L 124 163 M 120 158 L 115 164" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>

            {/* 3. PHƯỢNG HOÀNG MÚA LƯỢN (HOÀNG CUNG KIM PHƯỢNG - PHÍA HỮU / BÊN PHẢI) */}
            <div className="absolute -right-6 sm:right-4 lg:right-12 top-2 sm:top-8 w-52 sm:w-72 lg:w-96 h-64 sm:h-80 lg:h-96 animate-phoenix-dance">
                <svg
                    viewBox="0 0 320 320"
                    className="w-full h-full filter drop-shadow-[0_0_18px_rgba(220,38,38,0.45)]"
                >
                    <defs>
                        <linearGradient id="phoenixRedGold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FEF08A" />
                            <stop offset="25%" stopColor="#F59E0B" />
                            <stop offset="60%" stopColor="#DC2626" />
                            <stop offset="100%" stopColor="#7F1D1D" />
                        </linearGradient>
                        <linearGradient id="tailFeather" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FBBF24" />
                            <stop offset="30%" stopColor="#EA580C" />
                            <stop offset="70%" stopColor="#BE123C" />
                            <stop offset="100%" stopColor="#4C0519" />
                        </linearGradient>
                    </defs>

                    {/* Đầu và mào phượng hoàng kiêu hãnh */}
                    <g transform="translate(130, 75)">
                        {/* Mỏ phượng ngậm cành hoa cúc / hoa sen */}
                        <path d="M 15 25 L 2 29 L 14 33 Z" fill="#FDE047" />
                        {/* Đầu phượng hoàng */}
                        <circle cx="22" cy="28" r="10" fill="url(#phoenixRedGold)" />
                        <circle cx="20" cy="26" r="2.5" fill="#FFFFFF" />
                        <circle cx="19.5" cy="25.5" r="1.3" fill="#450A0A" />
                        {/* Mào phượng hoàng ngũ sắc vươn cao */}
                        <path d="M 28 20 C 35 5, 48 2, 54 8 C 45 14, 38 18, 30 22 Z" fill="#FDE047" />
                        <path d="M 26 18 C 30 2, 40 -2, 45 4 C 38 10, 32 14, 28 20 Z" fill="#DC2626" />
                        <path d="M 24 16 C 24 -2, 32 -6, 36 0 C 30 8, 28 12, 24 18 Z" fill="#0D5C4A" />
                    </g>

                    {/* Thân và ức phượng hoàng */}
                    <path
                        d="M 152 102
                           C 140 120, 138 145, 150 168
                           C 160 185, 175 198, 172 215
                           C 168 200, 155 185, 142 165
                           C 130 145, 132 120, 145 105 Z"
                        fill="url(#phoenixRedGold)"
                    />

                    {/* Cánh phượng hoàng giương cao vỗ cánh (Wing Flap Animation) */}
                    <g className="animate-wing-flap">
                        <path
                            d="M 148 118
                               C 165 95, 205 75, 245 80
                               C 225 100, 205 115, 185 130
                               C 225 115, 255 108, 275 120
                               C 240 135, 215 145, 180 152
                               C 215 150, 245 155, 260 170
                               C 225 175, 195 172, 165 162 Z"
                            fill="url(#phoenixRedGold)"
                            opacity="0.95"
                        />
                        {/* Viền lông vũ hoàng kim */}
                        <path
                            d="M 148 118 C 165 95, 205 75, 245 80 M 185 130 C 225 115, 255 108, 275 120 M 180 152 C 215 150, 245 155, 260 170"
                            stroke="#FEF08A"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            opacity="0.9"
                        />
                    </g>

                    {/* Đuôi phượng xòe ngũ sắc mềm mại uốn lượn (Fluttering Tail) */}
                    <g className="animate-tail-flutter">
                        {/* Dải lông đuôi chính 1 */}
                        <path
                            d="M 172 210
                               C 180 235, 195 260, 185 285
                               C 175 305, 145 315, 125 300
                               C 140 295, 160 280, 162 260
                               C 165 240, 158 225, 168 210 Z"
                            fill="url(#tailFeather)"
                            opacity="0.95"
                        />
                        {/* Mắt đuôi phượng hoàng (ngọc bội bảo châu) */}
                        <ellipse cx="132" cy="302" rx="7" ry="5" fill="#FDE047" transform="rotate(-20 132 302)" />
                        <ellipse cx="132" cy="302" rx="4" ry="2.8" fill="#DC2626" transform="rotate(-20 132 302)" />

                        {/* Dải lông đuôi 2 (uốn lượn thướt tha sang phải) */}
                        <path
                            d="M 175 212
                               C 198 238, 225 255, 230 280
                               C 232 298, 215 312, 192 310
                               C 205 300, 212 288, 205 272
                               C 198 255, 185 235, 172 215 Z"
                            fill="url(#tailFeather)"
                            opacity="0.9"
                        />
                        <ellipse cx="198" cy="308" rx="6" ry="4.5" fill="#FDE047" transform="rotate(15 198 308)" />
                        <ellipse cx="198" cy="308" rx="3.5" ry="2.5" fill="#0D5C4A" transform="rotate(15 198 308)" />

                        {/* Dải lông đuôi 3 (nhỏ thanh thoát) */}
                        <path
                            d="M 166 215
                               C 152 240, 138 258, 120 270
                               C 105 280, 88 280, 80 272
                               C 92 268, 110 260, 128 245
                               C 145 230, 158 220, 166 215 Z"
                            fill="url(#tailFeather)"
                            opacity="0.85"
                        />
                        <ellipse cx="85" cy="272" rx="5" ry="3.5" fill="#FDE047" transform="rotate(-40 85 272)" />
                        <ellipse cx="85" cy="272" rx="3" ry="2" fill="#7C2D12" transform="rotate(-40 85 272)" />
                    </g>
                </svg>
            </div>

            {/* 4. VÂN MÂY NGŨ SẮC CUNG ĐÌNH TRÔI LỮNG LỜ */}
            <div className="absolute left-1/4 top-8 sm:top-14 w-36 sm:w-56 h-16 sm:h-24 opacity-35 animate-cloud-drift">
                <svg viewBox="0 0 160 60" className="w-full h-full fill-amber-300">
                    <path d="M 20 40 C 10 40, 0 32, 5 20 C 10 8, 28 8, 35 15 C 42 5, 65 2, 75 14 C 85 8, 102 10, 106 22 C 118 20, 130 28, 125 38 C 120 46, 105 44, 98 42 C 85 45, 45 45, 20 40 Z" />
                </svg>
            </div>

            <div className="absolute right-1/4 bottom-6 sm:bottom-12 w-40 sm:w-64 h-16 sm:h-24 opacity-30 animate-cloud-drift-reverse">
                <svg viewBox="0 0 160 60" className="w-full h-full fill-red-400">
                    <path d="M 20 40 C 10 40, 0 32, 5 20 C 10 8, 28 8, 35 15 C 42 5, 65 2, 75 14 C 85 8, 102 10, 106 22 C 118 20, 130 28, 125 38 C 120 46, 105 44, 98 42 C 85 45, 45 45, 20 40 Z" />
                </svg>
            </div>

            {/* 5. CÁC ĐỐM SÁNG BỤI HOÀNG KIM (GOLDEN SPARKLES) */}
            <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-amber-300 blur-[1px] animate-golden-shimmer" />
            <div className="absolute top-1/2 right-1/3 w-2.5 h-2.5 rounded-full bg-yellow-200 blur-[1px] animate-golden-shimmer" style={{ animationDelay: '1.2s' }} />
            <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-400 blur-[0.5px] animate-golden-shimmer" style={{ animationDelay: '2.1s' }} />
            <div className="absolute top-1/6 right-1/5 w-2 h-2 rounded-full bg-amber-200 blur-[1px] animate-golden-shimmer" style={{ animationDelay: '0.7s' }} />
        </div>
    );
};

export default DragonPhoenixHeritage;
