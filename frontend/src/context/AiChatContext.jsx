import { createContext, useContext, useState, useEffect, useRef } from 'react';
import HeritageChatModal from '../components/ai/HeritageChatModal';
import { Bot, Sparkles, X } from 'lucide-react';

const AiChatContext = createContext(null);

const BUTTON_SIZE = 56; // 56px (w-14 h-14)

export const AiChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [contextWork, setContextWork] = useState(null);
    const [initialQuestion, setInitialQuestion] = useState(null);

    // Vị trí của nút tròn Robot trên màn hình (Hỗ trợ Kéo - Thả)
    const [position, setPosition] = useState(() => {
        try {
            const saved = localStorage.getItem('vietheritage_ai_btn_pos');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (
                    typeof parsed.x === 'number' &&
                    typeof parsed.y === 'number' &&
                    parsed.x >= 0 &&
                    parsed.x < window.innerWidth &&
                    parsed.y >= 0 &&
                    parsed.y < window.innerHeight
                ) {
                    return parsed;
                }
            }
        } catch (e) {}

        return {
            x: typeof window !== 'undefined' ? Math.max(12, window.innerWidth - BUTTON_SIZE - 24) : 100,
            y: typeof window !== 'undefined' ? Math.max(12, window.innerHeight - BUTTON_SIZE - 24) : 100,
        };
    });

    const [isDragging, setIsDragging] = useState(false);

    // Ref lưu trữ trạng thái kéo thả để phân biệt giữa Click và Drag
    const dragDataRef = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0,
        hasMoved: false,
    });

    // Cập nhật vị trí nếu kích thước màn hình thay đổi để nút không bị rơi ra ngoài
    useEffect(() => {
        const handleResize = () => {
            setPosition((prev) => ({
                x: Math.min(Math.max(12, prev.x), window.innerWidth - BUTTON_SIZE - 12),
                y: Math.min(Math.max(12, prev.y), window.innerHeight - BUTTON_SIZE - 12),
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Xử lý kéo thả bằng chuột (Mouse Drag)
    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // Chỉ nhận chuột trái

        dragDataRef.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y,
            hasMoved: false,
        };
        setIsDragging(true);

        const handleMouseMove = (moveEvent) => {
            if (!dragDataRef.current.isDragging) return;
            const dx = moveEvent.clientX - dragDataRef.current.startX;
            const dy = moveEvent.clientY - dragDataRef.current.startY;

            if (Math.hypot(dx, dy) > 4) {
                dragDataRef.current.hasMoved = true;
            }

            const newX = Math.max(12, Math.min(window.innerWidth - BUTTON_SIZE - 12, dragDataRef.current.initialX + dx));
            const newY = Math.max(12, Math.min(window.innerHeight - BUTTON_SIZE - 12, dragDataRef.current.initialY + dy));

            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            if (dragDataRef.current.isDragging) {
                dragDataRef.current.isDragging = false;
                setIsDragging(false);
                try {
                    localStorage.setItem('vietheritage_ai_btn_pos', JSON.stringify(position));
                } catch (err) {}
            }
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    // Xử lý kéo thả bằng ngón tay trên màn hình cảm ứng (Touch Drag)
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        dragDataRef.current = {
            isDragging: true,
            startX: touch.clientX,
            startY: touch.clientY,
            initialX: position.x,
            initialY: position.y,
            hasMoved: false,
        };
        setIsDragging(true);

        const handleTouchMove = (moveEvent) => {
            if (!dragDataRef.current.isDragging) return;
            const moveTouch = moveEvent.touches[0];
            const dx = moveTouch.clientX - dragDataRef.current.startX;
            const dy = moveTouch.clientY - dragDataRef.current.startY;

            if (Math.hypot(dx, dy) > 4) {
                dragDataRef.current.hasMoved = true;
            }

            const newX = Math.max(12, Math.min(window.innerWidth - BUTTON_SIZE - 12, dragDataRef.current.initialX + dx));
            const newY = Math.max(12, Math.min(window.innerHeight - BUTTON_SIZE - 12, dragDataRef.current.initialY + dy));

            setPosition({ x: newX, y: newY });
        };

        const handleTouchEnd = () => {
            if (dragDataRef.current.isDragging) {
                dragDataRef.current.isDragging = false;
                setIsDragging(false);
                try {
                    localStorage.setItem('vietheritage_ai_btn_pos', JSON.stringify(position));
                } catch (err) {}
            }
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };

        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
    };

    // Bấm vào nút: chỉ mở chatbox nếu người dùng KHÔNG kéo đi
    const handleClick = () => {
        if (!dragDataRef.current.hasMoved) {
            toggleAiChat();
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
                style={{
                    position: 'fixed',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    zIndex: 50,
                    touchAction: 'none',
                }}
                className="select-none"
            >
                <div className="relative group">
                    <button
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        onClick={handleClick}
                        title={isOpen ? "Thu nhỏ cửa sổ chat" : "Trò chuyện cùng VietHeritage AI (Kéo thả để di chuyển)"}
                        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-150 ${
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

                    {/* Tooltip hiển thị khi hover (Tự động ẩn khi đang kéo) */}
                    {!isDragging && (
                        <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap hidden sm:block">
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
