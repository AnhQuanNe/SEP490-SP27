import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Heart,
    Home,
    BookOpen,
    Globe,
    Video,
    MessageSquare,
    Volume2,
    Sparkles,
    Plus,
    PanelLeftClose,
    PanelLeft,
    CheckCircle2,
    Layers,
    GraduationCap,
    Zap,
    X
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleNavClick = () => {
        if (setMobileOpen) {
            setMobileOpen(false);
        }
    };

    const mainNav = [
        { label: 'Trang chủ', path: '/', icon: Home },
        { label: 'Cây kỹ năng', path: '/learning/skill-tree', icon: BookOpen, badge: 'XP', badgeColor: 'bg-amber-100 text-amber-700' },
        { label: 'Khám phá từ điển', path: '/dictionary', icon: Globe },
    ];

    const coreFeatures = [
        { label: 'Gương ảo AI', path: '/learning/mirror', icon: Video, badge: 'Webcam', badgeColor: 'bg-sky-50 text-sky-600 border border-sky-100' },
        { label: 'Trợ lý Dịch 2 Chiều', path: '/communicator', icon: MessageSquare, badge: 'Real-time', badgeColor: 'bg-blue-50 text-blue-600 border border-blue-100' },
        { label: 'Không gian Synset', path: '/dictionary', icon: Layers },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200/90 z-50 transition-all duration-300 flex flex-col justify-between select-none ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
            >
                {/* Top Logo & Toggle */}
                <div className="p-4 flex items-center justify-between border-b border-slate-100">
                    <Link
                        to="/"
                        onClick={handleNavClick}
                        className="flex items-center space-x-3 overflow-hidden"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 flex-shrink-0">
                            <Heart className="w-5 h-5 fill-white" />
                        </div>
                        {(!isCollapsed || mobileOpen) && (
                            <div className="flex flex-col min-w-0">
                                <span className="font-extrabold text-base text-slate-900 tracking-tight truncate">
                                    HeartSign
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-0.5">
                                    ECOSYSTEM
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition hidden lg:block"
                        title={isCollapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
                    >
                        {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Body */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                    {/* Big Primary CTA Button */}
                    <Link
                        to="/learning/mirror"
                        onClick={handleNavClick}
                        className={`w-full py-3 px-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/25 transition-all flex items-center justify-center space-x-2 text-sm ${
                            isCollapsed && !mobileOpen ? 'p-2.5' : ''
                        }`}
                        title="Luyện tập AI"
                    >
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                        {(!isCollapsed || mobileOpen) && <span>Luyện tập AI</span>}
                    </Link>

                    {/* Main Menu */}
                    <div className="space-y-1">
                        {mainNav.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={handleNavClick}
                                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                        active
                                            ? 'bg-rose-50 text-rose-600 font-bold shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                    }`}
                                    title={item.label}
                                >
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-rose-600' : 'text-slate-400'}`} />
                                        {(!isCollapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                                    </div>
                                    {(!isCollapsed || mobileOpen) && item.badge && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Core Features Section */}
                    <div className="space-y-1">
                        {(!isCollapsed || mobileOpen) && (
                            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Tính năng cốt lõi
                            </div>
                        )}
                        {coreFeatures.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    onClick={handleNavClick}
                                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                        active
                                            ? 'bg-rose-50 text-rose-600 font-bold'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                    }`}
                                    title={item.label}
                                >
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-rose-600' : 'text-slate-400'}`} />
                                        {(!isCollapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                                    </div>
                                    {(!isCollapsed || mobileOpen) && item.badge && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.badgeColor}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Status Footer */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg text-slate-500">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {(!isCollapsed || mobileOpen) && <span className="font-semibold text-slate-700">MediaPipe AI</span>}
                        </div>
                        {(!isCollapsed || mobileOpen) && <span className="text-[11px] font-medium text-slate-400">v2.0</span>}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
