import { useState, useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import Footer from './components/layout/Footer';
import GlobalSearchModal from './components/common/GlobalSearchModal';
import AppRoutes from './routes/AppRoutes';

function AppLayout() {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');

    // Global keyboard shortcut: Ctrl+K or Cmd+K to open Sign Search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setSearchModalOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Standalone full-page auth routes
    const authRoutes = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
    const isAuthRoute = authRoutes.includes(location.pathname);

    if (isAuthRoute) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-rose-500 selection:text-white">
                <main className="flex-grow">
                    <AppRoutes />
                </main>
                <Footer />
                <GlobalSearchModal
                    isOpen={searchModalOpen}
                    onClose={() => setSearchModalOpen(false)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-rose-500 selection:text-white flex">
            {/* Left Collapsible & Mobile Responsive Sidebar */}
            <Sidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                mobileOpen={mobileSidebarOpen}
                setMobileOpen={setMobileSidebarOpen}
            />

            {/* Main Application Area (Margin adjusted for Sidebar) */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
                    isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                }`}
            >
                {/* Top Header Bar (Hand sign search + Filter pills + Lộ trình học + User avatar) */}
                <TopHeader
                    onOpenSearch={() => setSearchModalOpen(true)}
                    selectedFilter={selectedFilter}
                    onSelectFilter={setSelectedFilter}
                    onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
                />

                {/* Page Content */}
                <main className="flex-grow">
                    <AppRoutes />
                </main>

                {/* App Footer */}
                <Footer />
            </div>

            {/* Global Quick Sign Gesture Search Modal (Ctrl+K) */}
            <GlobalSearchModal
                isOpen={searchModalOpen}
                onClose={() => setSearchModalOpen(false)}
            />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppLayout />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;