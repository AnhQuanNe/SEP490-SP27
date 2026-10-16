import { createContext, useContext, useState } from 'react';
import HeritageChatModal from '../components/ai/HeritageChatModal';
import { Bot, Sparkles } from 'lucide-react';

const AiChatContext = createContext(null);

export const AiChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [contextWork, setContextWork] = useState(null);

    const openAiChat = (work = null) => {
        setContextWork(work);
        setIsOpen(true);
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
                closeAiChat,
            }}
        >
            {children}

            {/* Global Heritage AI Chat Modal */}
            <HeritageChatModal
                isOpen={isOpen}
                onClose={closeAiChat}
                initialWork={contextWork}
            />

            {/* Floating Quick Action Button */}
            <button
                onClick={() => openAiChat()}
                title="Mở Trợ lý AI Di sản (RAG & Dẫn nguồn)"
                className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-amber-300 px-4 py-3 rounded-full shadow-2xl border border-amber-500/30 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all duration-200"
            >
                <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 group-hover:rotate-12 transition-transform">
                        <Bot className="w-4 h-4" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
                </div>
                <div className="text-left hidden sm:block pr-1">
                    <p className="text-xs font-extrabold text-white leading-tight font-heritage flex items-center gap-1">
                        <span>Trợ lý AI</span>
                        <Sparkles className="w-3 h-3 text-amber-400" />
                    </p>
                    <p className="text-[10px] text-amber-300/80 font-medium">Hỏi đáp & Dẫn nguồn</p>
                </div>
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
