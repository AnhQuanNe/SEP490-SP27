import { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AiChatProvider } from './context/AiChatContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
                <AiChatProvider>
                    <div className="min-h-screen bg-[#faf6ed] flex flex-col font-vietnam text-stone-800 antialiased selection:bg-amber-200 selection:text-red-950">
                        <Navbar />
                        <main className="flex-grow">
                            <AppRoutes />
                        </main>
                        <Footer />
                    </div>
                </AiChatProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;