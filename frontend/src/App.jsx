import { useState, useEffect } from 'react';
import { BrowserRouter, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AiChatProvider } from './context/AiChatContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';
import Maintenance from './pages/Maintenance';
import adminService from './services/admin.service';
import { ShieldAlert, ArrowRight } from 'lucide-react';

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function AppContent() {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const isAdminRoute = pathname.startsWith('/admin');
    const isLoginRoute = pathname === '/login';

    const [isMaintenance, setIsMaintenance] = useState(false);

    useEffect(() => {
        adminService.getPublicSettings().then((settings) => {
            if (settings && typeof settings.maintenanceMode === 'boolean') {
                setIsMaintenance(settings.maintenanceMode);
            }
        }).catch(() => {});
    }, [pathname]);

    // 1. Phân hệ Quản trị Admin: Luôn luôn cho phép Admin truy cập
    if (isAdminRoute) {
        return (
            <main className="min-h-screen bg-slate-900 font-vietnam text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
                <AppRoutes />
            </main>
        );
    }

    // 2. Chế độ Bảo Trì Hệ Thống:
    // - Cho phép vào trang /login để Quản trị viên đăng nhập
    // - Chặn toàn bộ khách vãng lai và tài khoản người dùng thông thường
    if (isMaintenance && user?.role !== 'admin' && !isLoginRoute) {
        return <Maintenance />;
    }

    // 3. Giao diện thông thường (hoặc Admin đang vào xem thử trong lúc bảo trì)
    return (
        <div className="min-h-screen bg-[#faf6ed] flex flex-col font-vietnam text-stone-800 antialiased selection:bg-amber-200 selection:text-red-950">
            {/* Dải Banner cảnh báo nổi dành riêng cho Admin khi đang bật bảo trì */}
            {isMaintenance && user?.role === 'admin' && (
                <div className="bg-rose-950 text-rose-100 px-4 py-2 text-xs font-bold flex items-center justify-between gap-3 shadow-md border-b border-rose-800 select-none z-50 sticky top-0">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse flex-shrink-0" />
                        <span className="truncate">
                            CHẾ ĐỘ BẢO TRÌ ĐANG BẬT — Công chúng không thể truy cập. Bạn đang xem với quyền Quản Trị Viên để kiểm thử.
                        </span>
                    </div>
                    <Link
                        to="/admin"
                        className="px-3 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-[11px] font-semibold flex items-center gap-1 border border-rose-600 transition-colors flex-shrink-0"
                    >
                        <span>Về Trang Admin</span>
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            )}

            <Navbar />
            <main className="flex-grow">
                <AppRoutes />
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
                <AiChatProvider>
                    <AppContent />
                </AiChatProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
