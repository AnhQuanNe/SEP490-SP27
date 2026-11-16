/**
 * Danh sách model Google Gemini đang hoạt động thực tế và có độ trễ cực thấp (< 1.5s).
 * Dùng chung cho toàn bộ các module AI trong backend (AI Assistant, AI Tutor, Poetry, Smart Selection).
 */
const GEMINI_MODELS = [
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
];

module.exports = { GEMINI_MODELS };
