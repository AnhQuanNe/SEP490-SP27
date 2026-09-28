import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, ShieldCheck, ChevronDown, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, logout, getAvatarUrl } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/login');
    };

    const avatarSrc = user ? getAvatarUrl(user.avatar) : null;

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo & Brand */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                S
                            </div>
                            <div>
                                <span className="text-xl font-bold text-gray-900 tracking-tight">HeartSign</span>
                                <span className="ml-1 text-xs px-2 py-0.5 bg-blue-50 text-blue-700 font-medium rounded-full">SEP490</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">


                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                                >
                                    {avatarSrc ? (
                                        <img
                                            src={avatarSrc}
                                            alt={user?.name}
                                            className="w-9 h-9 rounded-full object-cover border-2 border-blue-500"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border-2 border-blue-200">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                    <div className="text-left hidden lg:block pr-1">
                                        <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                                        onMouseLeave={() => setDropdownOpen(false)}
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-xs text-gray-500 font-medium">Đăng nhập với</p>
                                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                        >
                                            <User className="w-4 h-4 mr-3 text-gray-400" />
                                            Hồ sơ & Đổi mật khẩu
                                        </Link>

                                        {user?.role === 'admin' && (
                                            <div className="flex items-center px-4 py-2.5 text-sm text-purple-600 bg-purple-50">
                                                <ShieldCheck className="w-4 h-4 mr-3" />
                                                Quyền Quản trị viên
                                            </div>
                                        )}

                                        <div className="border-t border-gray-100 my-1"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 text-red-500" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-2">
                    <Link
                        to="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Trang chủ
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <div className="px-3 py-2 border-t border-gray-100 flex items-center space-x-3">
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="" className="w-9 h-9 rounded-full object-cover" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                        {user?.name?.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                            <Link
                                to="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Hồ sơ cá nhân & Đổi mật khẩu
                            </Link>
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                            >
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full text-center py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full text-center py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
