import { createContext, useContext, useState } from 'react';
import HeritageChatModal from '../components/ai/HeritageChatModal';
import { Bot, Sparkles, X, MessageSquare } from 'lucide-react';

const AiChatContext = createContext(null);

export const AiChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [contextWork, setContextWork] = useState(null);

    const openAiChat = (work = null) => {
        if (work) setContextWork(work);
        setIsOpen(true);
    };

    const toggleAiChat = () => {
        setIsOpen((prev) => !prev);
    };

    const closeAiChat = () => {
        setIsOpen(false);
    };

    return (
        <AiChatContext.Provider
            value={{
                isOpen,
                contextWork,
                openAiChat,
                toggleAiChat,
                closeAiChat,
            }}
        >
            {children}

            {/* Corner Floating Chat Box Widget */}
            <HeritageChatModal
                isOpen={isOpen}
                onClose={closeAiChat}
                initialWork={contextWork}
            />

            {/* Modern Floating Chat Bubble Button */}
            <button
                onClick={toggleAiChat}
                title={isOpen ? "Thu nhỏ cửa sổ chat" : "Trò chuyện cùng VietHeritage AI"}
                className={`fixed bottom-6 right-4 sm:right-6 z-50 group flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
                    isOpen
                        ? 'w-12 h-12 bg-slate-900 border-2 border-amber-500/70 text-amber-300 hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-amber-500/20'
                        : 'h-13 px-4.5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-amber-300 border border-amber-500/40 hover:border-amber-400 hover:scale-105 active:scale-95 shadow-xl shadow-indigo-950/40'
                }`}
            >
                {isOpen ? (
                    <X className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
                ) : (
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/30 group-hover:rotate-12 transition-transform">
                                <Bot className="w-4.5 h-4.5 text-slate-950" />
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
                        </div>
                        <div className="text-left hidden sm:block pr-1">
                            <p className="text-xs font-extrabold text-white leading-tight font-heritage flex items-center gap-1">
                                <span>VietHeritage AI</span>
                                <Sparkles className="w-3 h-3 text-amber-400" />
                            </p>
                            <p className="text-[10px] text-amber-300/80 font-medium">Hỏi đáp & Tra cứu</p>
                        </div>
                    </div>
                )}
            </button>
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
