import { 
    GraduationCap, 
    Headphones, 
    MapPin, 
    BookOpen, 
    Quote, 
    Volume2, 
    Sparkles 
} from 'lucide-react';

/**
 * ExhibitionDetailPanel - Cột thông tin học thuật chuẩn Sách Giáo Khoa
 * Hiển thị trích đoạn SGK, 4 tầng nghĩa AI, danh sách điểm khảo cứu và kết nối Gia sư AI.
 */
const ExhibitionDetailPanel = ({
    selectedArtifact,
    activeTab,
    currentHotspots,
    activeHotspot,
    audio,
    onTabChange,
    onHotspotClick,
    onOpenAiChat
}) => {
    if (!selectedArtifact) return null;

    return (
        <div className="bg-gradient-to-b from-[#18110b]/95 via-[#130d08]/95 to-[#0b0805]/95 rounded-3xl border border-amber-500/35 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-amber-100 overflow-hidden flex flex-col">
            {/* Header bài học chuẩn Sách Giáo Khoa */}
            <div className="p-5 border-b border-amber-600/25 bg-gradient-to-r from-red-950/40 via-amber-950/30 to-[#18110b] relative">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wide">
                        <GraduationCap className="w-4 h-4 text-amber-400" />
                        <span>{selectedArtifact.textbookUnit}</span>
                    </div>
                    {/* Nút nghe thuyết minh nhanh bài này */}
                    <button
                        type="button"
                        onClick={() => audio?.narrateArtifact(selectedArtifact)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 font-bold text-[11px] border border-amber-400/40 cursor-pointer transition-all hover:scale-102 shadow-xs"
                        title="Nghe toàn bộ bài thuyết minh"
                    >
                        <Headphones className="w-3 h-3 text-amber-300" />
                        <span>Nghe bài học</span>
                    </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-amber-100 font-heritage tracking-tight leading-tight">
                    {selectedArtifact.name}
                </h2>
                <p className="text-xs text-amber-300/80 font-medium mt-1">
                    {selectedArtifact.subtitle}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-400">
                    <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{selectedArtifact.location}</span>
                    </span>
                    <span className="text-amber-500/40">•</span>
                    <span className="text-amber-300/80 font-serif">
                        Thời kỳ: {selectedArtifact.era}
                    </span>
                </div>
            </div>

            {/* Thanh chuyển Tab nghiên cứu */}
            <div className="flex border-b border-amber-600/25 bg-[#120d09]/80 px-3">
                <button
                    type="button"
                    onClick={() => onTabChange('textbook')}
                    className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                        activeTab === 'textbook'
                            ? 'border-amber-400 text-amber-300 font-black bg-amber-500/10'
                            : 'border-transparent text-stone-400 hover:text-amber-200'
                    }`}
                >
                    Trích Đoạn SGK
                </button>
                <button
                    type="button"
                    onClick={() => onTabChange('fourLayers')}
                    className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                        activeTab === 'fourLayers'
                            ? 'border-amber-400 text-amber-300 font-black bg-amber-500/10'
                            : 'border-transparent text-stone-400 hover:text-amber-200'
                    }`}
                >
                    4 Tầng Nghĩa AI
                </button>
                <button
                    type="button"
                    onClick={() => onTabChange('hotspots')}
                    className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                        activeTab === 'hotspots'
                            ? 'border-amber-400 text-amber-300 font-black bg-amber-500/10'
                            : 'border-transparent text-stone-400 hover:text-amber-200'
                    }`}
                >
                    Điểm Khảo Cứu ({currentHotspots?.length || 0})
                </button>
            </div>

            {/* Nội dung chi tiết từng Tab */}
            <div className="p-5 space-y-4 text-sm flex-1">
                {/* TAB 1: ĐOẠN TRÍCH CHUẨN SÁCH GIÁO KHOA */}
                {activeTab === 'textbook' && (
                    <div className="space-y-4">
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#20150d]/85 border border-amber-500/30 shadow-lg relative">
                            <Quote className="w-8 h-8 text-amber-500/20 absolute top-2 right-2" />
                            
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                                    Đoạn trích kinh điển trong SGK:
                                </p>
                                <button
                                    type="button"
                                    onClick={() => audio?.narrateArtifact({
                                        name: `Đoạn trích ${selectedArtifact.name}`,
                                        subtitle: selectedArtifact.subtitle,
                                        era: selectedArtifact.era,
                                        location: selectedArtifact.location,
                                        textbookUnit: selectedArtifact.textbookUnit,
                                        textbookExcerpt: selectedArtifact.textbookExcerpt,
                                        fourLayers: {}
                                    })}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all border border-amber-500/40"
                                    title="Nghe giọng đọc đoạn trích này"
                                >
                                    <Volume2 className="w-3 h-3 text-amber-300" />
                                    <span>Nghe đoạn trích</span>
                                </button>
                            </div>

                            <p className="text-xs sm:text-[13.5px] leading-relaxed text-amber-100/90 italic font-serif">
                                {selectedArtifact.textbookExcerpt}
                            </p>
                            <p className="text-[11px] text-amber-400/90 font-semibold mt-2.5 text-right font-serif">
                                — {selectedArtifact.textbookSource}
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#160f09]/90 border border-amber-900/40 space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                                <span>❖</span> Ca Dao & Lời Ru Dân Gian Truyền Đời:
                            </h4>
                            <ul className="space-y-1.5 text-xs text-amber-100/80 italic pl-1 font-serif">
                                {selectedArtifact.fourLayers?.folkQuotes?.map((quote, qIdx) => (
                                    <li key={qIdx} className="flex items-start gap-2">
                                        <span className="text-amber-400 font-bold">•</span>
                                        <span>“{quote}”</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="text-[11px] text-stone-400 italic border-t border-amber-900/30 pt-3">
                            Nguồn học thuật: {selectedArtifact.academicSource}
                        </div>
                    </div>
                )}

                {/* TAB 2: GIẢI NGHĨA 4 TẦNG NGHĨA AI */}
                {activeTab === 'fourLayers' && (
                    <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-amber-950/30 border-l-4 border-l-amber-500 border border-amber-500/20">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-1">
                                <span>❖</span> Tầng 1: Nghĩa Hiện Thực (Literal)
                            </p>
                            <p className="text-xs text-amber-100/80 leading-relaxed font-serif">
                                {selectedArtifact.fourLayers?.literal}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-red-950/30 border-l-4 border-l-red-500 border border-red-500/20">
                            <p className="text-xs font-bold uppercase tracking-wider text-red-300 flex items-center gap-1.5 mb-1">
                                <span>❖</span> Tầng 2: Nghĩa Biểu Tượng (Symbolic)
                            </p>
                            <p className="text-xs text-stone-200 leading-relaxed font-serif">
                                {selectedArtifact.fourLayers?.symbolic}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-purple-950/30 border-l-4 border-l-purple-500 border border-purple-500/20">
                            <p className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 mb-1">
                                <span>❖</span> Tầng 3: Triết Lý Dân Gian (Philosophical)
                            </p>
                            <p className="text-xs text-stone-200 leading-relaxed font-serif">
                                {selectedArtifact.fourLayers?.philosophical}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => audio?.narrateArtifact({
                                name: `Luận giải 4 tầng nghĩa ${selectedArtifact.name}`,
                                subtitle: 'Phân tích đa chiều về bảo vật',
                                era: selectedArtifact.era,
                                location: selectedArtifact.location,
                                textbookUnit: 'Khảo cứu ý nghĩa',
                                textbookExcerpt: selectedArtifact.fourLayers?.literal,
                                fourLayers: selectedArtifact.fourLayers
                            })}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-amber-300 shadow-md hover:scale-[1.01]"
                        >
                            <Headphones className="w-3.5 h-3.5" />
                            <span>Nghe Audio Luận Giải 4 Tầng Nghĩa</span>
                        </button>
                    </div>
                )}

                {/* TAB 3: DANH SÁCH CÁC ĐIỂM KHẢO CỨU (HOTSPOTS) */}
                {activeTab === 'hotspots' && (
                    <div className="space-y-2.5">
                        <p className="text-xs text-amber-200/70 italic">
                            Bấm vào một chi tiết để <strong>phóng to ảnh và nghe thuyết minh</strong>:
                        </p>
                        {currentHotspots?.map((spot) => {
                            const isCurrent = activeHotspot?.id === spot.id;
                            return (
                                <div
                                    key={spot.id}
                                    onClick={() => onHotspotClick(spot)}
                                    title={isCurrent ? "Đang soi cận cảnh • Bấm lại để thu về toàn cảnh 100%" : "Bấm để phóng to điểm khảo cứu này"}
                                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                        isCurrent
                                            ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] text-amber-100'
                                            : 'bg-[#150f09]/80 border-amber-900/30 hover:border-amber-500/50 hover:bg-[#1f150e]/90 text-stone-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-bold flex items-center gap-2 ${isCurrent ? 'text-amber-200' : 'text-stone-200'}`}>
                                            <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-amber-400 ring-2 ring-amber-300/80 animate-pulse' : 'bg-amber-600'}`} />
                                            {spot.title}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {isCurrent && (
                                                <span className="text-[10px] font-bold text-stone-950 bg-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <span>Đang soi</span>
                                                    <span className="text-stone-800 font-normal hidden sm:inline">(Thu về)</span>
                                                </span>
                                            )}
                                            <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                                                {spot.tag}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onHotspotClick(spot);
                                                    audio?.narrateHotspot(spot);
                                                }}
                                                className="p-1 rounded-md hover:bg-amber-500/20 text-amber-300 transition-colors"
                                                title="Nghe thuyết minh điểm này"
                                            >
                                                <Volume2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-stone-400 mt-1.5 leading-relaxed font-serif">
                                        {spot.detail}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Nút đàm đạo cùng Gia sư AI ở cuối trang sách */}
            <div className="p-4 border-t border-amber-600/25 bg-[#120d09]/80 mt-auto">
                <button
                    type="button"
                    onClick={onOpenAiChat}
                    className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-red-950 via-red-900 to-amber-700 hover:from-red-900 hover:to-amber-600 text-amber-100 text-xs font-bold transition-all shadow-[0_0_20px_rgba(185,28,28,0.3)] flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40 group hover:scale-[1.01]"
                >
                    <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                    <span>Hỏi Gia sư AI luận giải sâu hơn về "{selectedArtifact.name}"</span>
                </button>
            </div>
        </div>
    );
};

export default ExhibitionDetailPanel;
