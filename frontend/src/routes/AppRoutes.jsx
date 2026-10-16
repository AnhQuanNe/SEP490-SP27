import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Explore from '../pages/Explore';
import FolkLiterature from '../pages/FolkLiterature';
import LiteratureMap from '../pages/LiteratureMap';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyEmail from '../pages/auth/VerifyEmail';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Profile from '../pages/customer/Profile';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kham-pha" element={<Explore />} />
            <Route path="/van-hoc-dan-gian" element={<FolkLiterature />} />
            <Route path="/ban-do" element={<LiteratureMap />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Route yêu cầu đăng nhập */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            {/* Bắt các route không xác định */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
