import React, { useState, useEffect, useRef } from 'react';
import {
    User,
    MapPin,
    BookOpen,
    Sparkles,
    Bot,
    X,
    Loader2,
    ShieldCheck,
    Volume2,
    VolumeX,
    Copy,
    Check,
    ArrowRight,
    Compass
} from 'lucide-react';
import aiService from '../../services/ai.service';
import { useAiChat } from '../../context/AiChatContext';

/**
 * Loại bỏ dấu tiếng Việt phục vụ nhận diện từ khóa nhanh
 */
function removeVietnameseTonesQuick(str) {
    if (!str) return '';
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
}

/**
 * Heuristic nhận diện nhanh loại thực thể được người dùng bôi đen
 */
function detectEntityType(text) {
    if (!text) return 'definition';
    const clean = removeVietnameseTonesQuick(text);

    // 0. Ưu tiên các từ ngữ / thuật ngữ văn học đặc sắc đã có trong từ điển
    const literaryTermKeywords = [
        'choi voi', 'sung ngui troi', 'nuoc man dong chua', 'dau sung trang treo', 'mat chu dien',
        'la truc', 'ao thu', 'lanh leo', 'thuyen cau', 'be teo teo', 'song biec', 'la vang',
        'tang may', 'lo lung', 'ngoc', 'tram', 'khanh', 'chau', 'hoan', 'khuc ca', 'tieng dan',
        'nieu com', 'bua riu', 'ao giap', 'ngua sat', 'tre dang nga', 'ken re', 'sinh le',
        'tiet nhien', 'thien thu', 'nghich lo', 'dieu phat', 'doan truong', 'dem hoi',
        'quoc quoc', 'gia gia', 'ung dung', 'buong lai', 'khieu vu', 'khoang rung',
        'suong lap', 'doan quan moi', 'hoa ve', 'heo hut', 'con buoc', 'mua xa khoi'
    ];
    if (literaryTermKeywords.some((term) => clean === term || new RegExp(`\\b${term}\\b`, 'i').test(clean))) {
        return 'definition';
    }

    // 1. Nhận diện Nhân vật & Tác giả (Dùng regex nguyên từ \b để tránh khớp nhầm chuỗi con)
    const charKeywords = [
        'my nuong', 'mi nuong', 'nang my nuong', 'nang mi nuong',
        'son tinh', 'thuy tinh', 'tan vien', 'vua hung', 'hung vuong',
        'thach sanh', 'ly thong', 'quynh nga', 'cong chua', 'chan tinh', 'dai bang',
        'thanh giong', 'phu dong', 'me giong',
        'thuy kieu', 'nang kieu', 'kim trong', 'tu hai', 'thuy van', 'thuc sinh', 'hoan thu', 'ma giam sinh', 'so khanh', 'dam tien',
        'ly thuong kiet', 'le loi', 'nguyen trai', 'nguoi linh', 'quang dung', 'chinh huu', 'pham tien duat',
        'cao tan', 'cao lang', 'luu thi', 'han mac tu', 'hoang cuc', 'kim cuc', 'khach duong xa',
        'ba huyen thanh quan', 'nguyen khuyen', 'nguyen du', 'bac ho', 'ho chi minh', 'bao dinh giang',
        'nguoi nong dan', 'me gia', 'nguoi me', 'truong hong', 'truong hat', 'lieu thang'
    ];
    if (charKeywords.some((kw) => clean === kw || new RegExp(`\\b${kw}\\b`, 'i').test(clean))) {
        return 'character';
    }
    if (/^(chang|nang|ong|ba|vua|cong chua|tuong|thi si|nha tho|tac gia)\s+/i.test(clean)) {
        return 'character';
    }

    // 2. Nhận diện Địa danh / Vị trí địa lý
    // Chỉ khớp các địa danh cụ thể hoặc có tiền tố chỉ không gian (sông, núi, hồ, đèo...)
    const specificLocations = [
        'tan vien', 'ba vi', 'bien dong', 'song ma', 'nhu nguyet', 'song cau',
        'sai khao', 'muong lat', 'pha luong', 'muong hich', 'mai chau', 'lam son',
        'thon vi da', 'vi da', 'song huong', 'huong giang', 'song trang', 'ben song trang',
        'viet bac', 'yen do', 'binh luc', 'ao thu', 'soc son', 'phong chau', 'den hung',
        'tien duong', 'song tien duong', 'deo ngang', 'hoanh son',
        'ho tay', 'tran vu', 'tho xuong', 'yen thai', 'thap muoi', 'xu nghe', 'song lam', 'hong linh'
    ];
    if (specificLocations.some((loc) => clean === loc || new RegExp(`\\b${loc}\\b`, 'i').test(clean))) {
        return 'location';
    }

    // Nhận diện tiền tố địa danh khi đi kèm danh từ riêng phía sau (ví dụ: "sông Mã", "núi Ba Vì", "hồ Tây")
    if (/^(nui|song|bien|ban|lang|thung lung|deo|dinh|ho|canh dong|dong song|cang)\s+[a-z]+/i.test(clean)) {
        return 'location';
    }

    // 3. Mặc định là Giải nghĩa từ ngữ / Từ khó
    return 'definition';
}

/**
 * Component SmartTextSelectionToolbar:
 * Lắng nghe thao tác bôi đen (text selection) của người dùng trong một container
 * Bật ra Floating Toolbar với 4 tùy chọn chuyên sâu:
 * 1. 👤 Nhân vật (Đây là ai? Vai trò gì trong tác phẩm?)
 * 2. 📍 Địa danh (Vị trí thực tế & Bối cảnh lịch sử?)
 * 3. 📖 Giải nghĩa từ (Nghĩa từ khó, từ cổ, Hán Việt & ngữ cảnh?)
 * 4. 🤖 Hỏi AI (Mở đối thoại chuyên sâu cùng trợ lý VietHeritage AI)
 */
const SmartTextSelectionToolbar = ({ containerRef, currentWork, onSelectSnippet }) => {
    const { openAiChat } = useAiChat();
    const [selectedText, setSelectedText] = useState('');
    const [toolbarPosition, setToolbarPosition] = useState(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [popoverType, setPopoverType] = useState('character'); // 'character' | 'location' | 'definition' | 'rhetoric'
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [detectedType, setDetectedType] = useState('definition');

    const toolbarRef = useRef(null);
    const popoverRef = useRef(null);

    // Lắng nghe sự kiện bôi đen (selectionchange & mouseup)
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed) {
                if (!isPopoverOpen) {
                    setToolbarPosition(null);
                    setSelectedText('');
                }
                return;
            }

            const text = selection.toString().trim();
            // Kích hoạt khi độ dài từ 2 đến 250 ký tự
            if (text.length < 2 || text.length > 250) {
                if (!isPopoverOpen) {
                    setToolbarPosition(null);
                    setSelectedText('');
                }
                return;
            }

            // Kiểm tra xem vùng chọn có nằm trong containerRef hay không
            if (containerRef && containerRef.current) {
                const range = selection.getRangeAt(0);
                if (!containerRef.current.contains(range.commonAncestorContainer)) {
                    return;
                }

                const rect = range.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return;

                const detected = detectEntityType(text);
                setDetectedType(detected);
                setSelectedText(text);
                setToolbarPosition({
                    top: Math.max(10, rect.top - 54),
                    left: Math.max(10, rect.left + rect.width / 2),
                });
            }
        };

        const handleMouseUp = (e) => {
            if (toolbarRef.current && toolbarRef.current.contains(e.target)) return;
            if (popoverRef.current && popoverRef.current.contains(e.target)) return;
            setTimeout(handleSelection, 50);
        };

        const handleKeyUp = (e) => {
            if (e.key === 'Escape') {
                closeAll();
            } else {
                setTimeout(handleSelection, 50);
            }
        };

        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keyup', handleKeyUp);
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, [containerRef, isPopoverOpen]);

    // Đóng khi click ra ngoài toolbar và popover
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                toolbarRef.current &&
                !toolbarRef.current.contains(e.target) &&
                popoverRef.current &&
                !popoverRef.current.contains(e.target)
            ) {
                const selection = window.getSelection();
                if (!selection || selection.isCollapsed) {
                    closeAll();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeAll = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setToolbarPosition(null);
        setIsPopoverOpen(false);
        setAnalysisResult(null);
        setSelectedText('');
        setPopoverType('character');
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    // Xử lý khi bấm nút phân tích: 'character' | 'location' | 'definition' | 'rhetoric'
    const handleAnalyze = async (type) => {
        if (!selectedText) return;
        setPopoverType(type);
        setIsPopoverOpen(true);
        setLoading(true);

        try {
            const res = await aiService.analyzeSnippet({
                snippet: selectedText,
                workSlug: currentWork?.slug || null,
                workTitle: currentWork?.title || null,
                analysisType: type,
            });

            if (res && res.suggestedType && res.suggestedType !== type) {
                setPopoverType(res.suggestedType);
            }
            setAnalysisResult(res);
        } catch (err) {
            console.error('Lỗi phân tích đoạn trích:', err);
            const titleMap = {
                character: '👤 Nhân vật & Vai trò',
                location: '📍 Vị trí địa lý & Bối cảnh',
                definition: '📖 Giải nghĩa từ ngữ',
                rhetoric: '💡 Biện pháp tu từ',
            };
            setAnalysisResult({
                title: titleMap[type] || 'Khám phá văn học',
                details: `Không thể kết nối với hệ thống phân tích. Bạn có thể bấm "Hỏi AI" để trò chuyện trực tiếp về nội dung này.`,
                source: currentWork?.source || 'VietHeritage AI',
            });
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi bấm "🤖 Hỏi AI"
    const handleAskAi = (typeOverride) => {
        let question = '';
        // Nếu truyền trực tiếp hoặc popover đang mở thì tôn trọng tab người dùng đang chọn
        const targetType = typeOverride || (isPopoverOpen ? popoverType : detectEntityType(selectedText));

        if (targetType === 'character') {
            question = `Hãy phân tích chi tiết về nhân vật "${selectedText}" trong tác phẩm "${currentWork?.title || 'Di sản văn học'}": Đây là ai (xuất thân, đặc điểm), vai trò của nhân vật trong tác phẩm và ý nghĩa biểu tượng văn hóa là gì?`;
        } else if (targetType === 'location') {
            question = `Hãy giải thích chi tiết về vị trí địa lý "${selectedText}" trong tác phẩm "${currentWork?.title || 'Di sản văn học'}": Nơi này ở đâu trong thực tế, gắn liền với bối cảnh lịch sử nào và có ý nghĩa không gian nghệ thuật gì trong tác phẩm?`;
        } else if (targetType === 'rhetoric') {
            question = `Hãy phân tích biện pháp tu từ và giá trị biểu đạt nghệ thuật của cụm từ "${selectedText}" trong tác phẩm "${currentWork?.title || 'Di sản văn học'}": Tác giả sử dụng thủ pháp gì và mang lại hiệu quả thẩm mỹ ra sao?`;
        } else {
            question = `Hãy giải thích ý nghĩa của từ ngữ / hình ảnh "${selectedText}" trong tác phẩm "${currentWork?.title || 'Di sản văn học'}": Nghĩa của từ này là gì, được dùng trong ngữ cảnh nào và có giá trị biểu đạt nghệ thuật gì?`;
        }
        closeAll();
        openAiChat(currentWork, question);
    };

    // Đọc văn bản phân tích
    const handleToggleSpeech = () => {
        if (!('speechSynthesis' in window)) {
            alert('Trình duyệt không hỗ trợ phát âm thanh.');
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const textToRead = analysisResult?.details || selectedText || '';
            const cleanText = textToRead.replace(/[*#_]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'vi-VN';
            utterance.rate = 0.95;
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    // Sao chép nội dung
    const handleCopy = () => {
        if (analysisResult?.details) {
            navigator.clipboard.writeText(analysisResult.details);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!toolbarPosition && !isPopoverOpen) return null;

    return (
        <>
            {/* 1. FLOATING TOOLBAR BUBBLE */}
            {toolbarPosition && !isPopoverOpen && (
                <div
                    ref={toolbarRef}
                    style={{
                        position: 'fixed',
                        top: `${toolbarPosition.top}px`,
                        left: `${toolbarPosition.left}px`,
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                    }}
                    className="flex items-center gap-1 p-1 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-amber-500/40 animate-in fade-in zoom-in-95 duration-150 select-none max-w-[95vw] overflow-x-auto"
                >
                    {/* Badge Snippet Preview */}
                    <span className="hidden md:inline-block max-w-[100px] truncate text-[11px] font-semibold text-amber-300 px-2.5 py-1 bg-slate-800/80 rounded-xl border border-amber-500/20 italic">
                        "{selectedText}"
                    </span>

                    {/* Nút 1: 👤 Nhân vật */}
                    <button
                        type="button"
                        onClick={() => handleAnalyze('character')}
                        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all active:scale-95 whitespace-nowrap ${
                            detectedType === 'character'
                                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                                : 'hover:bg-amber-500/15 text-slate-300 hover:text-amber-200'
                        }`}
                        title="Giải thích đây là ai & vai trò của nhân vật trong tác phẩm"
                    >
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>Nhân vật</span>
                    </button>

                    <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5" />

                    {/* Nút 2: 📍 Địa danh */}
                    <button
                        type="button"
                        onClick={() => handleAnalyze('location')}
                        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all active:scale-95 whitespace-nowrap ${
                            detectedType === 'location'
                                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm'
                                : 'hover:bg-emerald-500/15 text-slate-300 hover:text-emerald-200'
                        }`}
                        title="Tra cứu vị trí địa lý thực tế & bối cảnh lịch sử"
                    >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Địa danh</span>
                    </button>

                    <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5" />

                    {/* Nút 3: 📖 Giải nghĩa từ */}
                    <button
                        type="button"
                        onClick={() => handleAnalyze('definition')}
                        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all active:scale-95 whitespace-nowrap ${
                            detectedType === 'definition'
                                ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/50 shadow-sm'
                                : 'hover:bg-indigo-500/15 text-slate-300 hover:text-indigo-200'
                        }`}
                        title="Giải thích nghĩa từ khó, từ cổ, Hán Việt và hàm ý trong văn cảnh"
                    >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Giải nghĩa từ</span>
                    </button>

                    <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5" />

                    {/* Nút 4: 🤖 Hỏi AI */}
                    <button
                        type="button"
                        onClick={() => handleAskAi(detectedType)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white transition-all active:scale-95 shadow-md shadow-amber-900/40 whitespace-nowrap"
                        title="Gửi câu hỏi chuyên sâu về cụm từ này vào VietHeritage AI"
                    >
                        <Bot className="w-3.5 h-3.5 text-amber-200" />
                        <span>Hỏi AI</span>
                    </button>

                    {/* Nút đóng */}
                    <button
                        type="button"
                        onClick={closeAll}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-0.5"
                        title="Đóng thanh công cụ"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* 2. INLINE EXPLAINER POPOVER / MODAL CARD */}
            {isPopoverOpen && (
                <div
                    ref={popoverRef}
                    className="fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[10000] flex items-center justify-center p-3 sm:p-0 bg-slate-950/60 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none animate-in fade-in duration-200"
                >
                    <div className="bg-slate-900 text-white rounded-3xl border border-amber-500/30 shadow-2xl w-full max-w-lg sm:w-[540px] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        {/* Header Popover */}
                        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    popoverType === 'character'
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : popoverType === 'location'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                }`}>
                                    {popoverType === 'character' ? (
                                        <User className="w-4 h-4" />
                                    ) : popoverType === 'location' ? (
                                        <MapPin className="w-4 h-4" />
                                    ) : popoverType === 'rhetoric' ? (
                                        <Sparkles className="w-4 h-4" />
                                    ) : (
                                        <BookOpen className="w-4 h-4" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                                        {popoverType === 'character'
                                            ? 'Nhân vật & Tác giả'
                                            : popoverType === 'location'
                                            ? 'Vị trí địa lý & Bối cảnh'
                                            : popoverType === 'rhetoric'
                                            ? 'Thi pháp & Tu từ'
                                            : 'Giải nghĩa từ ngữ'}
                                    </span>
                                    <h3 className="text-sm font-bold text-white truncate font-heritage">
                                        "{selectedText}"
                                    </h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {/* Đọc âm thanh */}
                                <button
                                    type="button"
                                    onClick={handleToggleSpeech}
                                    className={`p-1.5 rounded-lg border transition-all ${
                                        isSpeaking
                                            ? 'bg-amber-500 border-amber-600 text-white animate-pulse'
                                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                    }`}
                                    title={isSpeaking ? 'Dừng đọc' : 'Nghe giọng AI đọc'}
                                >
                                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                </button>

                                {/* Sao chép */}
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
                                    title="Sao chép nội dung"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>

                                {/* Đóng */}
                                <button
                                    type="button"
                                    onClick={closeAll}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Switch Type Tabs Bar */}
                        <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-1 text-xs overflow-x-auto">
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => handleAnalyze('character')}
                                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
                                        popoverType === 'character'
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <User className="w-3 h-3" /> Nhân vật & Tác giả
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleAnalyze('location')}
                                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
                                        popoverType === 'location'
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <MapPin className="w-3 h-3" /> Địa danh
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleAnalyze('definition')}
                                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
                                        popoverType === 'definition'
                                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <BookOpen className="w-3 h-3" /> Nghĩa từ
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleAnalyze('rhetoric')}
                                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
                                        popoverType === 'rhetoric'
                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <Sparkles className="w-3 h-3" /> Tu từ
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleAskAi(popoverType)}
                                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[11px] transition-colors whitespace-nowrap pl-2 flex-shrink-0"
                            >
                                <Bot className="w-3 h-3" /> Hỏi sâu AI <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                        </div>

                        {/* Body Details */}
                        <div className="p-5 overflow-y-auto space-y-4 flex-grow text-xs sm:text-sm leading-relaxed custom-scrollbar">
                            {loading ? (
                                <div className="py-12 text-center space-y-3">
                                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-amber-400" />
                                    <p className="text-slate-400 text-xs font-medium">
                                        Đang tra cứu từ điển học thuật & đối chiếu ngữ liệu di sản...
                                    </p>
                                </div>
                            ) : analysisResult ? (
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    {/* Thông báo điều hướng thông minh khi chọn nhầm tab */}
                                    {analysisResult.redirectNotice && (
                                        <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-400" />
                                            <span className="leading-relaxed">{analysisResult.redirectNotice}</span>
                                        </div>
                                    )}

                                    {/* Tiêu đề mục */}
                                    <h4 className="font-bold text-amber-300 text-sm sm:text-base font-heritage">
                                        {analysisResult.title}
                                    </h4>

                                    {/* Nội dung chi tiết */}
                                    <div className="text-slate-200 space-y-2 whitespace-pre-line leading-relaxed font-sans bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                                        {analysisResult.details}
                                    </div>

                                    {/* Nguồn học thuật kiểm chứng */}
                                    <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-800/80">
                                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                                        <span>
                                            Nguồn kiểm chứng: <strong className="text-slate-300">{analysisResult.source || 'Kho tàng Di sản Văn học Việt Nam'}</strong>
                                        </span>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Footer Popover */}
                        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Compass className="w-3 h-3 text-amber-500" />
                                Bôi đen bất kỳ từ nào để tra cứu
                            </span>
                            <button
                                type="button"
                                onClick={() => handleAskAi(popoverType)}
                                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                            >
                                <Bot className="w-3.5 h-3.5 text-amber-200" />
                                Trò chuyện với AI về câu này
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SmartTextSelectionToolbar;
