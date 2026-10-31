const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const crypto = require('crypto');

/**
 * Memory Cache để tái sử dụng Audio Buffer của các câu ca dao/tục ngữ thường gặp.
 * Giúp phản hồi tức thì (0ms latency) và không làm quá tải kết nối.
 */
const audioCache = new Map();
const MAX_CACHE_ITEMS = 300;

const SUPPORTED_VOICES = {
    'hoaimy': {
        name: 'vi-VN-HoaiMyNeural',
        gender: 'female',
        region: 'Bắc Bộ',
        label: 'Hoài My (Nữ - Giọng Bắc truyền cảm, ấm áp)',
    },
    'namminh': {
        name: 'vi-VN-NamMinhNeural',
        gender: 'male',
        region: 'Bắc Bộ',
        label: 'Nam Minh (Nam - Giọng Bắc trang trọng, hào hùng)',
    },
};

const MODES = {
    'recite': {
        label: 'Diễn ngâm (Thong thả, ngân vang, ngắt nhịp thơ)',
        rate: '-16%',
        pitch: '-5Hz',
    },
    'standard': {
        label: 'Đọc diễn cảm chuẩn',
        rate: '-2%',
        pitch: '0Hz',
    },
    'slow': {
        label: 'Đọc chậm học tập',
        rate: '-26%',
        pitch: '0Hz',
    },
};

/**
 * Làm sạch văn bản thô khỏi các ký tự đóng mở ngoặc kép
 */
function cleanRawText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/["'“”«»]/g, '') // Bỏ dấu ngoặc kép bọc ngoài
        .replace(/\r\n/g, '\n')
        .trim();
}

/**
 * Bộ định dạng Diễn ngâm Chuyên sâu (Advanced Folk Poetic Prosody Formatter):
 * Tự động phân tích luật thơ Việt Nam (Lục bát 6/8, Thất ngôn 7, Ngũ ngôn 5, Tục ngữ đối vế 4/4 hoặc 2/2)
 * Bổ sung điểm dừng hơi và độ ngân vang tự nhiên (...) giúp AI diễn xướng đúng hồn cốt thi ca.
 */
function formatTextForRecitation(rawText) {
    if (!rawText) return '';
    const cleaned = cleanRawText(rawText);

    // Tách dòng bởi xuống dòng HOẶC dấu gạch chéo / (rất phổ biến trong CSDL ca dao tục ngữ)
    const rawLines = cleaned.split(/[\n/]+/).map((l) => l.trim()).filter(Boolean);

    const formattedLines = rawLines.map((line) => {
        // Bỏ dấu câu ở cuối để tự điều phối nhịp ngân
        const lineWithoutEndPunct = line.replace(/[.,;:!?]+$/, '').trim();
        const words = lineWithoutEndPunct.split(/\s+/).filter(Boolean);
        const len = words.length;

        // 1. Thơ Thất ngôn (7 chữ như Nam Quốc Sơn Hà, thơ Đường luật): Nhịp 4/3 bất biến
        if (len === 7) {
            return `${words.slice(0, 4).join(' ')}... ${words.slice(4).join(' ')}...`;
        }

        // 2. Thơ Lục bát câu 6 (6 chữ): Nhịp 2/4 (hoặc 2/2/2)
        // Ví dụ: "Trăm năm... trong cõi người ta...", "Công cha... như núi Thái Sơn..."
        if (len === 6) {
            return `${words.slice(0, 2).join(' ')}... ${words.slice(2).join(' ')}...`;
        }

        // 3. Thơ Lục bát câu 8 (8 chữ): Nhịp 4/4
        // Ví dụ: "Chữ tài chữ mệnh... khéo là ghét nhau...", "Nghĩa mẹ như nước... trong nguồn chảy ra..."
        if (len === 8) {
            return `${words.slice(0, 4).join(' ')}... ${words.slice(4).join(' ')}...`;
        }

        // 4. Tục ngữ / Thành ngữ 4 chữ: Nhịp 2/2
        // Ví dụ: "Uống nước... nhớ nguồn...", "Lá lành... đùm lá rách..."
        if (len === 4) {
            return `${words.slice(0, 2).join(' ')}... ${words.slice(2).join(' ')}...`;
        }

        // 5. Thơ Ngũ ngôn (5 chữ): Nhịp 2/3
        if (len === 5) {
            return `${words.slice(0, 2).join(' ')}... ${words.slice(2).join(' ')}...`;
        }

        // 6. Dòng có sẵn dấu phẩy (như tục ngữ vế đối: "Gần mực thì đen, gần đèn thì rạng")
        if (lineWithoutEndPunct.includes(',')) {
            const parts = lineWithoutEndPunct.split(',').map((p) => p.trim()).filter(Boolean);
            return parts.map((part) => `${part}...`).join(' ');
        }

        // 7. Dòng dài tự do khác: ngắt nhịp ở vị trí giữa câu
        if (len >= 6) {
            const mid = Math.floor(len / 2);
            return `${words.slice(0, mid).join(' ')}... ${words.slice(mid).join(' ')}...`;
        }

        return `${lineWithoutEndPunct}...`;
    });

    // Kết nối các dòng thơ bằng khoảng lặng lắng đọng
    return formattedLines.join('\n');
}

/**
 * Bộ định dạng Đọc chuẩn (Standard Expressive Formatter):
 * Chuẩn hóa ngữ pháp, chuyển đổi gạch chéo thành dấu phẩy tự nhiên,
 * giữ tốc độ mượt mà, dứt khoát và chuẩn xác 100%.
 */
function formatTextForStandard(rawText) {
    if (!rawText) return '';
    return cleanRawText(rawText)
        .replace(/[,;]?\s*[/]\s*/g, ', ') // Đổi gạch chéo thành dấu phẩy ngắt câu tự nhiên
        .replace(/\s*,\s*,+/g, ',') // Xóa dấu phẩy trùng lặp
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Sinh khóa hash cho cache
 */
function getCacheKey(text, voice, mode) {
    return crypto.createHash('sha256').update(`${voice}_${mode}_${text.trim()}`).digest('hex');
}

/**
 * Chuyển văn bản thành Audio Buffer MP3
 * @param {Object} options
 * @param {string} options.text - Đoạn ca dao, tục ngữ hoặc lời giảng
 * @param {string} [options.voice='hoaimy'] - Mã giọng ('hoaimy' | 'namminh')
 * @param {string} [options.mode='recite'] - Kiểu đọc ('recite' | 'standard' | 'slow')
 * @param {string} [options.rate] - Tùy chỉnh tốc độ
 * @param {string} [options.pitch] - Tùy chỉnh cao độ
 * @returns {Promise<Buffer>}
 */
async function synthesize({ text, voice = 'hoaimy', mode = 'recite', rate, pitch }) {
    if (!text || typeof text !== 'string' || !text.trim()) {
        throw new Error('Văn bản cần đọc không được để trống');
    }

    const cleanText = text.trim();
    const selectedVoiceConfig = SUPPORTED_VOICES[voice] || SUPPORTED_VOICES['hoaimy'];
    const selectedVoice = selectedVoiceConfig.name;
    const selectedMode = MODES[mode] || MODES['recite'];

    const effectiveRate = rate || selectedMode.rate;
    const effectivePitch = pitch || selectedMode.pitch;

    // Định dạng tiền xử lý văn bản theo từng chế độ chuyên biệt
    let processedText = cleanText;
    if (mode === 'recite') {
        processedText = formatTextForRecitation(cleanText);
    } else {
        processedText = formatTextForStandard(cleanText);
    }

    const cacheKey = getCacheKey(processedText, selectedVoice, `${effectiveRate}_${effectivePitch}`);
    if (audioCache.has(cacheKey)) {
        return audioCache.get(cacheKey);
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    return new Promise((resolve, reject) => {
        try {
            const { audioStream } = tts.toStream(processedText, {
                rate: effectiveRate,
                pitch: effectivePitch,
            });

            const chunks = [];
            audioStream.on('data', (chunk) => {
                chunks.push(chunk);
            });

            audioStream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                tts.close();

                // Lưu vào cache
                if (audioCache.size >= MAX_CACHE_ITEMS) {
                    const firstKey = audioCache.keys().next().value;
                    audioCache.delete(firstKey);
                }
                audioCache.set(cacheKey, buffer);

                resolve(buffer);
            });

            audioStream.on('error', (err) => {
                tts.close();
                reject(err);
            });
        } catch (error) {
            tts.close();
            reject(error);
        }
    });
}

function getAvailableVoices() {
    return Object.entries(SUPPORTED_VOICES).map(([key, item]) => ({
        id: key,
        voiceName: item.name,
        label: item.label,
        gender: item.gender,
        region: item.region,
    }));
}

function getAvailableModes() {
    return Object.entries(MODES).map(([key, item]) => ({
        id: key,
        label: item.label,
        rate: item.rate,
        pitch: item.pitch,
    }));
}

module.exports = {
    synthesize,
    getAvailableVoices,
    getAvailableModes,
    SUPPORTED_VOICES,
    MODES,
    formatTextForRecitation,
    formatTextForStandard,
};
