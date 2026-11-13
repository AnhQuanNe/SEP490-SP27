import { useState, useEffect } from 'react';
import { Route, Sparkles, X, Volume2, VolumeX, ArrowRight, Loader2, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import literatureService from '../../services/literature.service';

/**
 * GraphPathResultHUD - Giao diện hiển thị Đường Đi Văn Hóa kèm Luận Giải Di Sản của AI
 * Thiết kế tinh gọn (Compact Dock), tối ưu chiều cao để vừa thấy rõ ô mạch nguồn vừa thấy trọn vẹn đồ thị.
 */
const GraphPathResultHUD = ({
    pathResult,
    onClose,
    onSelectNode,
    isSoundEnabled,
    isSidebarOpen = false,
}) => {
    const [isExplaining, setIsExplaining] = useState(false);
    const [aiText, setAiText] = useState(pathResult?.aiAnalysis || null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Đồng bộ aiText khi kết quả pathResult thay đổi
    useEffect(() => {
        setAiText(pathResult?.aiAnalysis || null);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [pathResult]);

    if (!pathResult || !pathResult.path || pathResult.path.length === 0) return null;

    const sourceNode = pathResult.path[0];
    const targetNode = pathResult.path[pathResult.path.length - 1];

    // Vị trí thích ứng: Nếu Sidebar đang mở, HUD tự động né sang vùng Canvas bên trái
    const positionClass = isSidebarOpen
        ? 'bottom-3 left-3 md:left-[calc((100vw-450px)/2)] -translate-x-0 md:-translate-x-1/2 max-w-[calc(100vw-460px)]'
        : 'bottom-3 left-1/2 -translate-x-1/2 max-w-3xl';

    // Yêu cầu AI luận giải trực tiếp nếu chưa có
    const handleRequestAi = async () => {
        try {
            setIsExplaining(true);
            const res = await literatureService.explainPathWithAI(sourceNode.id, targetNode.id);
            const insight = res?.data?.aiAnalysis || res?.aiAnalysis;
            if (insight) {
                setAiText(insight);
            }
        } catch (err) {
            console.error('Lỗi khi gọi AI luận giải đường đi:', err);
        } finally {
            setIsExplaining(false);
        }
    };

    // Đọc thuyết minh bằng giọng nói
    const handleToggleSpeech = () => {
        if (!window.speechSynthesis) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const textToRead = aiText || `Mạch nguồn văn hóa kết nối từ ${sourceNode.name} đến ${targetNode.name} qua ${pathResult.length} chặng liên kết di sản.`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.95;

        const voices = window.speechSynthesis.getVoices() || [];
        const viVoice = voices.find((v) => v.lang.startsWith('vi') || v.name.includes('Vietnamese'));
        if (viVoice) utterance.voice = viVoice;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    const typeLabelMap = {
        philosophy: 'Triết lý',
        archetype: 'Cổ mẫu',
        region: 'Địa linh',
        work: 'Tác phẩm',
    };

    // Trạng thái thu gọn thành viên ngọc nhỏ ở đáy màn hình
    if (isCollapsed) {
        return (
            <div className={`absolute z-30 pointer-events-auto animate-fade-in transition-all duration-300 ${positionClass}`}>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-950/90 backdrop-blur-2xl border border-amber-500/40 shadow-2xl text-white">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                        <Route className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-amber-300 truncate max-w-[180px] sm:max-w-[280px]">
                        {sourceNode?.name} ➔ {targetNode?.name}
                    </span>
                    <span className="text-[10px] text-stone-400 bg-white/10 px-1.5 py-0.2 rounded-full font-mono flex-shrink-0">
                        {pathResult.length} chặng
                    </span>

                    {/* Nút nghe thuyết minh ngay trên thanh mini */}
                    <button
                        onClick={handleToggleSpeech}
                        title={isSpeaking ? 'Dừng đọc' : 'Nghe thuyết minh'}
                        className={`p-1 px-2 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isSpeaking ? 'bg-amber-500 text-stone-950' : 'bg-white/10 hover:bg-white/20 text-stone-200'
                        }`}
                    >
                        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-amber-400" />}
                        <span className="hidden sm:inline">{isSpeaking ? 'Dừng' : 'Nghe'}</span>
                    </button>

                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
                        title="Mở rộng chi tiết đường đi"
                    >
                        <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Đóng đường đi"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`absolute z-30 w-[96%] bg-stone-950/85 backdrop-blur-xl border border-amber-500/35 rounded-2xl p-3 sm:p-3.5 shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(245,158,11,0.12)] text-white animate-fade-in transition-all duration-300 ${positionClass}`}>
            {/* Header HUD */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-stone-950 shadow-md shadow-amber-500/20 flex-shrink-0">
                        <Route className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                MẠCH NGUỒN VĂN HÓA
                            </span>
                            <span className="text-[9px] text-stone-400 bg-white/5 px-1.5 py-0.2 rounded-full border border-white/10 font-mono">
                                {pathResult.length} chặng kết nối
                            </span>
                        </div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5 truncate">
                            <span className="text-pink-300 truncate">{sourceNode?.name}</span>
                            <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            <span className="text-amber-300 truncate">{targetNode?.name}</span>
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button
                        onClick={handleToggleSpeech}
                        title={isSpeaking ? 'Dừng đọc' : 'Nghe thuyết minh'}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                            isSpeaking
                                ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/30'
                                : 'bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10'
                        }`}
                    >
                        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-amber-400" />}
                        <span className="hidden sm:inline text-[10px]">
                            {isSpeaking ? 'Dừng' : 'Thuyết minh'}
                        </span>
                    </button>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Thu nhỏ bảng đường đi"
                    >
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Đóng chế độ đường đi"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Các chặng đường đi (Path Breadcrumb Timeline) */}
            <div className="py-2 flex items-center gap-1.5 overflow-x-auto kg-custom-scroll">
                {pathResult.path.map((node, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === pathResult.path.length - 1;
                    const link = pathResult.links?.[idx];

                    return (
                        <div key={node.id} className="flex items-center gap-1 flex-shrink-0">
                            {/* Nút nốt */}
                            <button
                                onClick={() => onSelectNode(node)}
                                className={`px-2 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isFirst || isLast
                                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                                        : 'bg-white/5 border-white/10 hover:border-amber-400/50 text-stone-200'
                                }`}
                                title={`Bấm để đưa camera đến nốt "${node.name}"`}
                            >
                                <span
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: node.color || '#10b981' }}
                                />
                                <span className="truncate max-w-[130px]">{node.name}</span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-stone-400 font-mono">
                                    {typeLabelMap[node.type] || node.type}
                                </span>
                            </button>

                            {/* Cạnh nối kèm quan hệ */}
                            {link && (
                                <div className="flex items-center gap-1 px-0.5 text-stone-400">
                                    <span
                                        className="text-[9px] text-amber-300/80 font-light whitespace-nowrap bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/5 max-w-[120px] truncate"
                                        title={link.description || link.relation || link.label}
                                    >
                                        {link.description || link.relation || link.label}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-amber-400/70 flex-shrink-0" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Khối Luận Giải Di Sản của AI */}
            <div className={`mt-1 p-2.5 rounded-xl border transition-all duration-300 ${
                isSpeaking 
                    ? 'bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                    : 'bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border-amber-500/20'
            }`}>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-300 tracking-wide uppercase">
                            VietHeritage AI • Luận Giải Mạch Nguồn Di Sản
                        </span>
                        {isSpeaking && (
                            <span className="flex items-center gap-1 text-[9px] text-amber-400 font-medium px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400/30 animate-pulse">
                                <Volume2 className="w-2.5 h-2.5" />
                                <span>Đang đọc...</span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {aiText ? (
                            <button
                                onClick={handleRequestAi}
                                disabled={isExplaining}
                                className="px-1.5 py-0.5 rounded text-[10px] text-stone-400 hover:text-amber-300 hover:bg-white/10 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Yêu cầu AI luận giải lại mạch nguồn"
                            >
                                <RotateCcw className={`w-2.5 h-2.5 ${isExplaining ? 'animate-spin text-amber-400' : ''}`} />
                                <span className="text-[9px]">Làm mới</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleRequestAi}
                                disabled={isExplaining}
                                className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-semibold border border-amber-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                {isExplaining ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Đang luận giải...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-3 h-3" />
                                        <span>Luận giải ngay</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="text-xs text-stone-200 leading-relaxed font-normal">
                    {isExplaining ? (
                        <div className="flex items-center gap-2 text-amber-300 py-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                            <span>Đang kết nối VietHeritage AI để luận giải thi pháp và mạch ngầm triết lý...</span>
                        </div>
                    ) : aiText ? (
                        <div className="max-h-28 sm:max-h-36 overflow-y-auto kg-custom-scroll pr-1">
                            <p className="border-l-2 border-amber-400 pl-2.5 py-0.5 italic text-amber-100/90 font-serif text-[12px] sm:text-[12.5px] leading-relaxed">
                                &ldquo;{aiText}&rdquo;
                            </p>
                        </div>
                    ) : (
                        <p className="text-stone-400 text-[11px]">
                            Mạch liên kết giữa &ldquo;{sourceNode?.name}&rdquo; và &ldquo;{targetNode?.name}&rdquo; được bắc cầu qua {pathResult.length} mắt xích ngữ nghĩa trong kho tàng dân gian. Bấm &ldquo;Luận giải ngay&rdquo; để nghe AI luận giải tầng sâu triết lý.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GraphPathResultHUD;
