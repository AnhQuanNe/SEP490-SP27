import React from 'react';
import { AlertTriangle, RefreshCw, Home, Trash2 } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleClearCacheAndReload = () => {
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) {
            console.error('Error clearing storage:', e);
        }
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#faf6ed] flex items-center justify-center p-4 font-vietnam text-stone-800">
                    <div className="max-w-xl w-full bg-[#fffdfa] rounded-3xl border-2 border-amber-700/30 shadow-2xl p-6 sm:p-8 text-center space-y-6">
                        {/* Icon cảnh báo */}
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shadow-inner">
                            <AlertTriangle className="w-8 h-8 text-amber-700" />
                        </div>

                        {/* Tiêu đề & Thông điệp */}
                        <div className="space-y-2">
                            <h2 className="text-2xl font-extrabold text-stone-900 font-heritage">
                                Đã Có Sự Cố Khi Hiển Thị Giao Diện
                            </h2>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                Hệ thống VietHeritage AI đã tự động cách ly sự cố để bảo vệ dữ liệu của bạn.
                                Bạn có thể tải lại trang hoặc khôi phục về trạng thái ban đầu.
                            </p>
                        </div>

                        {/* Danh sách hành động khắc phục */}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="px-5 py-2.5 bg-red-900 hover:bg-red-800 text-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                            >
                                <RefreshCw className="w-4 h-4 text-amber-300" />
                                <span>Tải lại trang</span>
                            </button>
                            <button
                                type="button"
                                onClick={this.handleGoHome}
                                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-stone-300 cursor-pointer"
                            >
                                <Home className="w-4 h-4 text-stone-600" />
                                <span>Về Trang Chủ</span>
                            </button>
                            <button
                                type="button"
                                onClick={this.handleClearCacheAndReload}
                                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-300 cursor-pointer"
                                title="Xóa dữ liệu tạm và làm mới hoàn toàn"
                            >
                                <Trash2 className="w-3.5 h-3.5 text-amber-700" />
                                <span>Làm mới bộ nhớ đệm</span>
                            </button>
                        </div>

                        {/* Chi tiết kỹ thuật (Thu gọn) */}
                        <div className="pt-4 border-t border-stone-200 text-left">
                            <button
                                type="button"
                                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                                className="text-xs text-stone-500 hover:text-stone-800 underline font-medium cursor-pointer"
                            >
                                {this.state.showDetails ? 'Ẩn chi tiết kỹ thuật' : 'Xem chi tiết lỗi kỹ thuật'}
                            </button>

                            {this.state.showDetails && (
                                <div className="mt-3 p-3 bg-stone-900 text-amber-300 rounded-xl text-[11px] font-mono overflow-auto max-h-48 whitespace-pre-wrap">
                                    <div className="font-bold text-red-400 mb-1">
                                        {this.state.error?.toString()}
                                    </div>
                                    <div className="text-stone-400">
                                        {this.state.errorInfo?.componentStack}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

