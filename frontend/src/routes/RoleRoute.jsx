import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user?.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Truy cập bị từ chối</h2>
                    <p className="text-gray-600 mb-6">Bạn không có quyền truy cập vào trang này.</p>
                    <a
                        href="/"
                        className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Quay lại Trang chủ
                    </a>
                </div>
            </div>
        );
    }

    return children;
};

export default RoleRoute;
