import api from './api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Cache Blob URLs ở client để chuyển đổi qua lại giọng đọc/chế độ tức thì không cần gọi lại API
const clientBlobCache = new Map();
const MAX_CLIENT_CACHE = 50;

/**
 * Service hỗ trợ Ngâm thơ / Đọc truyền cảm văn học dân gian (Edge TTS)
 */
export const ttsService = {
    /**
     * Lấy danh sách giọng đọc và phong cách ngâm
     */
    async getVoices() {
        try {
            const res = await api.get('/tts/voices');
            return res.data || res;
        } catch (error) {
            console.warn('[TTS Service] Không thể tải danh sách giọng đọc, dùng fallback:', error);
            return {
                voices: [
                    { id: 'hoaimy', label: 'Hoài My (Nữ - Giọng Bắc truyền cảm)', gender: 'female' },
                    { id: 'namminh', label: 'Nam Minh (Nam - Giọng Bắc trầm hùng)', gender: 'male' },
                ],
                modes: [
                    { id: 'recite', label: 'Diễn ngâm (Thong thả, ngân vang)' },
                    { id: 'standard', label: 'Đọc diễn cảm chuẩn' },
                    { id: 'slow', label: 'Đọc chậm học tập' },
                ],
            };
        }
    },

    /**
     * Tạo URL trực tiếp để gán vào thẻ <audio src="...">
     */
    getDirectAudioUrl(text, voice = 'hoaimy', mode = 'recite') {
        if (!text) return '';
        const params = new URLSearchParams({
            text: text.trim(),
            voice,
            mode,
            v: '2',
        });
        return `${API_BASE}/tts/speak?${params.toString()}`;
    },

    /**
     * Tải audio buffer dạng Blob Object URL (dùng POST JSON an toàn, hỗ trợ AbortSignal & client cache)
     */
    async getAudioBlobUrl(text, voice = 'hoaimy', mode = 'recite', signal = null) {
        if (!text || !text.trim()) return '';

        const cacheKey = `${voice}_${mode}_${text.trim()}`;
        if (clientBlobCache.has(cacheKey)) {
            return clientBlobCache.get(cacheKey);
        }

        const response = await fetch(`${API_BASE}/tts/speak`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            signal,
            body: JSON.stringify({
                text: text.trim(),
                voice,
                mode,
            }),
        });

        if (!response.ok) {
            throw new Error(`TTS synthesis failed with status ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        // Lưu vào cache client
        if (clientBlobCache.size >= MAX_CLIENT_CACHE) {
            const oldestKey = clientBlobCache.keys().next().value;
            const oldestUrl = clientBlobCache.get(oldestKey);
            if (oldestUrl && oldestUrl.startsWith('blob:')) {
                URL.revokeObjectURL(oldestUrl);
            }
            clientBlobCache.delete(oldestKey);
        }
        clientBlobCache.set(cacheKey, blobUrl);

        return blobUrl;
    },
};

export default ttsService;
