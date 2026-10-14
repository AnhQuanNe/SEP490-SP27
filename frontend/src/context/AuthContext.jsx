import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import userService from '../services/user.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

    // Helper tính toán đường dẫn Avatar (hỗ trợ ảnh Google hoặc ảnh lưu trên server)
    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath || typeof avatarPath !== 'string') return null;
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
            return avatarPath;
        }
        return `${serverUrl}${avatarPath}`;
    };

    // Khi khởi động ứng dụng: nếu có token thì tải thông tin profile
    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                try {
                    const res = await userService.getProfile();
                    if (res.success) {
                        setUser(res.data);
                    }
                } catch (error) {
                    console.warn('Phiên đăng nhập cũ đã hết hạn, tự động làm mới trạng thái.');
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Đăng ký tài khoản (tự động lưu token và đăng nhập trực tiếp)
    const register = async ({ name, email, password }) => {
        const res = await authService.register({ name, email, password });
        if (res.success) {
            const { token: receivedToken, user: receivedUser } = res.data;
            if (receivedToken) {
                localStorage.setItem('token', receivedToken);
                setToken(receivedToken);
                setUser(receivedUser);
            }
            return res.data;
        }
        throw new Error(res.message || 'Đăng ký thất bại');
    };

    // Đăng nhập thường
    const login = async ({ email, password }) => {
        const res = await authService.login({ email, password });
        if (res.success) {
            const { token: receivedToken, user: receivedUser } = res.data;
            localStorage.setItem('token', receivedToken);
            setToken(receivedToken);
            setUser(receivedUser);
            return res.data;
        }
        throw new Error(res.message || 'Đăng nhập thất bại');
    };

    // Đăng nhập Google
    const loginWithGoogle = async (idToken) => {
        const res = await authService.googleLogin(idToken);
        if (res.success) {
            const { token: receivedToken, user: receivedUser } = res.data;
            localStorage.setItem('token', receivedToken);
            setToken(receivedToken);
            setUser(receivedUser);
            return res.data;
        }
        throw new Error(res.message || 'Đăng nhập Google thất bại');
    };

    // Cập nhật thông tin user trong context
    const updateUser = (updatedUserData) => {
        setUser((prev) => ({ ...prev, ...updatedUserData }));
    };

    // Tải lại thông tin mới nhất từ database
    const refreshProfile = async () => {
        try {
            const res = await userService.getProfile();
            if (res.success) {
                setUser(res.data);
            }
        } catch (error) {
            console.error('Lỗi làm mới profile:', error);
        }
    };

    // Đăng xuất
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                loginWithGoogle,
                logout,
                updateUser,
                refreshProfile,
                getAvatarUrl,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
    }
    return context;
};

export default AuthContext;
