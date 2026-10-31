import { CheckCircle2, Clock, XCircle, FileCheck, ShieldAlert } from 'lucide-react';

const SubmissionRateChart = ({ submissionsStats = {} }) => {
    const total = submissionsStats.total || 0;
    const pending = submissionsStats.pending || 0;
    const approved = submissionsStats.approved || 0;
    const rejected = submissionsStats.rejected || 0;

    const baseTotal = total > 0 ? total : 1;
    const approvedRate = Math.round((approved / baseTotal) * 100);
    const pendingRate = Math.round((pending / baseTotal) * 100);
    const rejectedRate = Math.max(0, 100 - approvedRate - pendingRate);

    return (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-bold text-slate-100 font-heritage tracking-wide">
                            Hiệu Quả Thẩm Định Đóng Góp
                        </h3>
                    </div>
                    <p className="text-xs text-slate-400">
                        Tiến độ và tỷ lệ duyệt các tác phẩm do sĩ tử đề xuất
                    </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-slate-400">Tỷ lệ xuất bản:</span>
                    <strong className="text-emerald-400 font-mono text-sm">{approvedRate}%</strong>
                </div>
            </div>

            {/* Thanh tiến độ đa đoạn (Multi-segment Progress Bar) */}
            <div className="space-y-2">
                <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 flex gap-0.5 shadow-inner">
                    {/* Đoạn 1: Đã duyệt */}
                    <div
                        style={{ width: `${approvedRate}%` }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-l-full transition-all duration-500"
                        title={`Đã duyệt: ${approved} bài (${approvedRate}%)`}
                    />
                    {/* Đoạn 2: Chờ duyệt */}
                    <div
                        style={{ width: `${pendingRate}%` }}
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500"
                        title={`Chờ duyệt: ${pending} bài (${pendingRate}%)`}
                    />
                    {/* Đoạn 3: Từ chối */}
                    <div
                        style={{ width: `${rejectedRate}%` }}
                        className="h-full bg-gradient-to-r from-rose-700 to-rose-600 rounded-r-full transition-all duration-500"
                        title={`Từ chối: ${rejected} bài (${rejectedRate}%)`}
                    />
                </div>

                {/* Nhãn tỷ lệ dưới thanh */}
                <div className="flex justify-between text-[11px] text-slate-500 font-mono px-1">
                    <span>Đã duyệt ({approvedRate}%)</span>
                    <span>Đang chờ ({pendingRate}%)</span>
                    <span>Từ chối ({rejectedRate}%)</span>
                </div>
            </div>

            {/* 3 Thẻ thống kê chi tiết */}
            <div className="grid grid-cols-3 gap-3 pt-2">
                {/* Đã duyệt */}
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã Duyệt</span>
                    </div>
                    <p className="text-xl font-extrabold text-emerald-300 font-heritage">
                        {approved}
                    </p>
                    <p className="text-[10px] text-slate-400">Xuất bản thành công</p>
                </div>

                {/* Chờ duyệt */}
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Chờ Duyệt</span>
                    </div>
                    <p className="text-xl font-extrabold text-amber-300 font-heritage">
                        {pending}
                    </p>
                    <p className="text-[10px] text-slate-400">Đang trong hàng đợi</p>
                </div>

                {/* Từ chối */}
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1 text-rose-400 text-xs font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Từ Chối</span>
                    </div>
                    <p className="text-xl font-extrabold text-rose-300 font-heritage">
                        {rejected}
                    </p>
                    <p className="text-[10px] text-slate-400">Cần bổ sung tư liệu</p>
                </div>
            </div>
        </div>
    );
};

export default SubmissionRateChart;
