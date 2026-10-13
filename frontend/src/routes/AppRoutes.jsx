import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyEmail from '../pages/auth/VerifyEmail';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Profile from '../pages/customer/Profile';
import SplitScreenMirror from '../pages/learning/SplitScreenMirror';
import SkillTree from '../pages/learning/SkillTree';
import TwoWayTranslator from '../pages/communicator/TwoWayTranslator';
import LocalSignSpace from '../pages/dictionary/LocalSignSpace';
import EducatorConsole from '../pages/educator/EducatorConsole';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Core Feature Modules (Accessible for Guest demo & Registered Users) */}
            <Route path="/learning/mirror" element={<SplitScreenMirror />} />
            <Route path="/learning/skill-tree" element={<SkillTree />} />
            <Route path="/communicator" element={<TwoWayTranslator />} />
            <Route path="/dictionary" element={<LocalSignSpace />} />
            <Route path="/educator" element={<EducatorConsole />} />
            <Route path="/educator/classrooms" element={<EducatorConsole />} />

            {/* Authenticated user routes */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
