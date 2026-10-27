import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Explore from '../pages/Explore';
import FolkLiterature from '../pages/FolkLiterature';
import LiteratureMap from '../pages/LiteratureMap';
import HeritageQuiz from '../pages/HeritageQuiz';
import InteractiveStory from '../pages/InteractiveStory';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyEmail from '../pages/auth/VerifyEmail';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Profile from '../pages/customer/Profile';
import Favorites from '../pages/Favorites';
import SearchHistory from '../pages/SearchHistory';
import SubmitContent from '../pages/SubmitContent';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kham-pha" element={<Explore />} />
            <Route path="/di-ban-co-tich" element={<InteractiveStory />} />
            <Route path="/van-hoc-dan-gian" element={<FolkLiterature />} />
            <Route path="/ban-do" element={<LiteratureMap />} />
            <Route path="/do-vui" element={<HeritageQuiz />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Các route yêu cầu người dùng đăng nhập */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/yeu-thich"
                element={
                    <ProtectedRoute>
                        <Favorites />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/lich-su"
                element={
                    <ProtectedRoute>
                        <SearchHistory />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dong-gop"
                element={
                    <ProtectedRoute>
                        <SubmitContent />
                    </ProtectedRoute>
                }
            />

            {/* Cổng Quản trị viên (Admin - Yêu cầu role === 'admin') */}
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Bắt các route không xác định */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
