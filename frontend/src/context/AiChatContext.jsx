import { createContext, useContext, useState, useEffect, useRef } from 'react';
import HeritageChatModal from '../components/ai/HeritageChatModal';
import { Bot, Sparkles, X } from 'lucide-react';

const AiChatContext = createContext(null);

const BUTTON_SIZE = 56; // 56px (w-14 h-14)
const EDGE_MARGIN = 12;
const LEGACY_POS_KEY = 'vietheritage_ai_btn_pos';
const OFFSET_STORAGE_KEY = 'vietheritage_ai_btn_offset_v2';

const getDefaultOffset = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const margin = isMobile ? 16 : 24;
    return { right: margin, bottom: margin };
};

const clampOffset = (offset) => {
    if (typeof window === 'undefined') return offset;
    const maxRight = Math.max(EDGE_MARGIN, window.innerWidth - BUTTON_SIZE - EDGE_MARGIN);
    const maxBottom = Math.max(EDGE_MARGIN, window.innerHeight - BUTTON_SIZE - EDGE_MARGIN);
    return {
        right: Math.min(Math.max(EDGE_MARGIN, offset.right), maxRight),
        bottom: Math.min(Math.max(EDGE_MARGIN, offset.bottom), maxBottom),
    };
};

export const AiChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [contextWork, setContextWork] = useState(null);
    const [initialQuestion, setInitialQuestion] = useState(null);

    // Neo vị trí theo khoảng cách từ góc dưới-phải (bottom/right) để không bao giờ bị trôi ra giữa trang khi đổi trang hay resize
    const [customOffset, setCustomOffset] = useState(() => {
        try {
            localStorage.removeItem(LEGACY_POS_KEY);
            const saved = localStorage.getItem(OFFSET_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed.right === 'number' && typeof parsed.bottom === 'number') {
                    return clampOffset(parsed);
                }
            }
        } catch {
            // Bỏ qua lỗi đọc localStorage ở chế độ ẩn danh
        }
        return null;
    });

    const [viewportTick, setViewportTick] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const activeOffset = customOffset ? clampOffset(customOffset) : getDefaultOffset();
    const latestOffsetRef = useRef(activeOffset);

    // Ref lưu trữ trạng thái kéo thả để phân biệt giữa Click và Drag
    const dragDataRef = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
        initialRight: 24,
        initialBottom: 24,
        hasMoved: false,
    });

    // Cập nhật lại giới hạn theo viewport khi đổi kích thước màn hình
    useEffect(() => {
        const handleResize = () => {
            setCustomOffset((prev) => (prev ? clampOffset(prev) : null));
            setViewportTick((t) => t + 1);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Xử lý kéo thả thống nhất cho cả chuột và cảm ứng (Pointer Events)
    const handlePointerDown = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        const current = activeOffset;
        latestOffsetRef.current = current;
        dragDataRef.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initialRight: current.right,
            initialBottom: current.bottom,
            hasMoved: false,
        };
        setIsDragging(true);

        const handlePointerMove = (moveEvent) => {
            if (!dragDataRef.current.isDragging) return;
            const dx = moveEvent.clientX - dragDataRef.current.startX;
            const dy = moveEvent.clientY - dragDataRef.current.startY;

            if (Math.hypot(dx, dy) > 4) {
                dragDataRef.current.hasMoved = true;
            }

            const nextOffset = clampOffset({
                right: dragDataRef.current.initialRight - dx,
                bottom: dragDataRef.current.initialBottom - dy,
            });
            latestOffsetRef.current = nextOffset;
            setCustomOffset(nextOffset);
        };

        const handlePointerUp = () => {
            if (dragDataRef.current.isDragging) {
                dragDataRef.current.isDragging = false;
                setIsDragging(false);
                if (dragDataRef.current.hasMoved) {
                    try {
                        localStorage.setItem(OFFSET_STORAGE_KEY, JSON.stringify(latestOffsetRef.current));
                    } catch {
                        // Bỏ qua nếu trình duyệt chặn localStorage
                    }
                }
            }
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
    };

    // Bấm vào nút: chỉ mở chatbox nếu người dùng KHÔNG kéo đi
    const handleClick = () => {
        if (!dragDataRef.current.hasMoved) {
            toggleAiChat();
        }
    };

    const handleResetPosition = () => {
        setCustomOffset(null);
        try {
            localStorage.removeItem(OFFSET_STORAGE_KEY);
        } catch {
            // Bỏ qua nếu trình duyệt chặn localStorage
        }
    };

    const openAiChat = (work = null, question = null) => {
        if (work) setContextWork(work);
        if (question) setInitialQuestion(question);
        else setInitialQuestion(null);
        setIsOpen(true);
    };

    const toggleAiChat = () => {
        setIsOpen((prev) => !prev);
    };

    const closeAiChat = () => {
        setIsOpen(false);
        setInitialQuestion(null);
    };

    return (
        <AiChatContext.Provider
            value={{
                isOpen,
                contextWork,
                initialQuestion,
                openAiChat,
                toggleAiChat,
                closeAiChat,
            }}
        >
            {children}

            {/* Cửa Sổ Trò Chuyện Chatbot */}
            <HeritageChatModal
                isOpen={isOpen}
                onClose={closeAiChat}
                initialWork={contextWork}
                initialQuestion={initialQuestion}
            />

            {/* Nút Tròn Robot AI Thu Nhỏ & Kéo Thả (Draggable Floating Robot Ball) */}
            <div
                data-viewport-tick={viewportTick}
                style={{
                    position: 'fixed',
                    right: `${activeOffset.right}px`,
                    bottom: `${activeOffset.bottom}px`,
                    zIndex: 50,
                    touchAction: 'none',
                }}
                className="select-none"
            >
                <div className="relative group">
                    <button
                        type="button"
                        onPointerDown={handlePointerDown}
                        onClick={handleClick}
                        onDoubleClick={handleResetPosition}
                        title={isOpen ? "Thu nhỏ cửa sổ chat" : "Trò chuyện cùng VietHeritage AI (Kéo thả để di chuyển, nhấp đúp để về góc phải)"}
                        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-150 ${
                            isDragging ? 'cursor-grabbing scale-110 shadow-amber-500/40 ring-4 ring-amber-500/30' : 'cursor-grab hover:scale-105 active:scale-95'
                        } ${
                            isOpen
                                ? 'bg-slate-900 border-2 border-amber-500 text-amber-300 shadow-amber-500/30 ring-2 ring-amber-400/40'
                                : 'bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/90 border-2 border-amber-500/80 text-amber-300 shadow-xl shadow-black/80'
                        }`}
                        aria-label="VietHeritage AI Assistant"
                    >
                        {/* Hào quang nhấp nháy phát sáng nhẹ khi đóng */}
                        {!isOpen && (
                            <span 
                                className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping pointer-events-none" 
                                style={{ animationDuration: '3s' }} 
                            />
                        )}

                        {/* Icon Robot hoặc Nút Đóng X khi mở */}
                        {isOpen ? (
                            <X className="w-6 h-6 text-amber-400 transition-transform duration-200 group-hover:rotate-90" />
                        ) : (
                            <div className="relative flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/40 group-hover:rotate-12 transition-transform">
                                    <Bot className="w-5 h-5 text-slate-950" />
                                </div>
                                {/* Chấm xanh trạng thái trực tuyến */}
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
                            </div>
                        )}
                    </button>

                    {/* Tooltip hiển thị khi hover (Tự động ẩn khi đang kéo, tự đổi bên nếu kéo sát cạnh trái) */}
                    {!isDragging && (
                        <div
                            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap hidden sm:block ${
                                typeof window !== 'undefined' && activeOffset.right > window.innerWidth / 2
                                    ? 'left-full ml-3'
                                    : 'right-full mr-3'
                            }`}
                        >
                            <div className="px-3 py-1.5 rounded-xl bg-slate-950/95 border border-amber-500/40 shadow-xl shadow-black/80 text-center">
                                <p className="text-xs font-bold text-amber-200 font-heritage flex items-center gap-1">
                                    <span>VietHeritage AI</span>
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    {isOpen ? 'Nhấp để thu nhỏ' : 'Nhấp để chat • Kéo thả để di chuyển'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AiChatContext.Provider>
    );
};

export const useAiChat = () => {
    const context = useContext(AiChatContext);
    if (!context) {
        throw new Error('useAiChat phải được sử dụng bên trong AiChatProvider');
    }
    return context;
};

export default AiChatContext;
