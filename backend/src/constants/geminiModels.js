/**
 * Danh sách model Google Gemini đang hoạt động thực tế (sắp xếp theo độ ổn định & tốc độ).
 * Dùng chung cho toàn bộ các module AI trong backend để tránh lặp lại danh sách model lỗi thời.
 */
const GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
];

module.exports = { GEMINI_MODELS };

