const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const crypto = require('crypto');
const https = require('https');

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
    'female': {
        name: 'vi-VN-GoogleFemale',
        gender: 'female',
        region: 'Toàn quốc',
        label: 'Giọng Nữ Diễn Cảm (Google Tiếng Việt)',
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
 * Làm sạch văn bản thô khỏi các ký tự đóng mở ngoặc kép & markdown
 */
function cleanRawText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/["'“”«»]/g, '')
        .replace(/[*#_~`]/g, '')
        .replace(/\r\n/g, '\n')
        .trim();
}

/**
 * Phân tách văn bản dài thành các đoạn nhỏ dưới 160 ký tự theo ngữ pháp
 */
function splitTextIntoGoogleChunks(text, maxLen = 160) {
    if (!text) return [];
    const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
    const chunks = [];
    let current = '';
    for (const s of sentences) {
        if ((current + ' ' + s).trim().length <= maxLen) {
            current = (current ? current + ' ' : '') + s.trim();
        } else {
            if (current) chunks.push(current);
            if (s.length > maxLen) {
                const words = s.split(/\s+/);
                let sub = '';
                for (const w of words) {
                    if ((sub + ' ' + w).length <= maxLen) {
                        sub = (sub ? sub + ' ' : '') + w;
                    } else {
                        if (sub) chunks.push(sub);
                        sub = w;
                    }
                }
                if (sub) chunks.push(sub);
                current = '';
            } else {
                current = s.trim();
            }
        }
    }
    if (current) chunks.push(current);
    return chunks.filter(Boolean);
}

/**
 * Tải từng đoạn âm thanh giọng đọc tiếng Việt chuẩn từ Google TTS
 */
function fetchGoogleTTSChunk(chunkText) {
    return new Promise((resolve, reject) => {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunkText)}&tl=vi&client=tw-ob`;
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Google TTS status code: ${res.statusCode}`));
            }
            const chunks = [];
            res.on('data', (d) => chunks.push(d));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Ghép các đoạn âm thanh giọng nữ Google Tiếng Việt trong trẻo, tự nhiên
 */
async function synthesizeGoogleFemale(text) {
    const clean = cleanRawText(text);
    const chunks = splitTextIntoGoogleChunks(clean);
    if (chunks.length === 0) return Buffer.from([]);
    const buffers = await Promise.all(chunks.map(fetchGoogleTTSChunk));
    return Buffer.concat(buffers);
}

/**
 * Bộ định dạng Diễn ngâm Chuyên sâu (Advanced Folk Poetic Prosody Formatter):
 */
function formatTextForRecitation(rawText) {
    if (!rawText) return '';
    const cleaned = cleanRawText(rawText);
    const rawLines = cleaned.split(/[\n/]+/).map((l) => l.trim()).filter(Boolean);

    const formattedLines = rawLines.map((line) => {
        const lineWithoutEndPunct = line.replace(/[.,;:!?]+$/, '').trim();
        const words = lineWithoutEndPunct.split(/\s+/).filter(Boolean);
        const len = words.length;

        if (len === 7) return `${words.slice(0, 4).join(' ')}... ${words.slice(4).join(' ')}...`;
        if (len === 6) return `${words.slice(0, 2).join(' ')}... ${words.slice(2).join(' ')}...`;
        if (len === 8) return `${words.slice(0, 4).join(' ')}... ${words.slice(4).join(' ')}...`;
        if (len === 4) return `${words.slice(0, 2).join(' ')}... ${words.slice(2).join(' ')}...`;
        if (len === 5) return `${words.slice(0, 2).join(' ')}... ${words.slice(2).join(' ')}...`;
        if (lineWithoutEndPunct.includes(',')) {
            const parts = lineWithoutEndPunct.split(',').map((p) => p.trim()).filter(Boolean);
            return parts.map((part) => `${part}...`).join(' ');
        }
        if (len >= 6) {
            const mid = Math.floor(len / 2);
            return `${words.slice(0, mid).join(' ')}... ${words.slice(mid).join(' ')}...`;
        }
        return `${lineWithoutEndPunct}...`;
    });

    return formattedLines.join('\n');
}

/**
 * Bộ định dạng Đọc chuẩn (Standard Expressive Formatter):
 */
function formatTextForStandard(rawText) {
    if (!rawText) return '';
    return cleanRawText(rawText)
        .replace(/[,;]?\s*[/]\s*/g, ', ')
        .replace(/\s*,\s*,+/g, ',')
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
 */
async function synthesize({ text, voice = 'female', mode = 'standard', rate, pitch }) {
    if (!text || typeof text !== 'string' || !text.trim()) {
        throw new Error('Văn bản cần đọc không được để trống');
    }

    const cleanText = text.trim();
    const isFemale = voice === 'female' || voice === 'hoaimy' || voice === 'google';

    const cacheKey = getCacheKey(cleanText, isFemale ? 'female_google' : voice, mode);
    if (audioCache.has(cacheKey)) {
        return audioCache.get(cacheKey);
    }

    // 1. Ưu tiên giọng Nữ tự nhiên thông qua Google TTS đa luồng siêu tốc
    if (isFemale) {
        try {
            const buf = await synthesizeGoogleFemale(cleanText);
            if (buf && buf.length > 0) {
                if (audioCache.size >= MAX_CACHE_ITEMS) {
                    const firstKey = audioCache.keys().next().value;
                    audioCache.delete(firstKey);
                }
                audioCache.set(cacheKey, buf);
                return buf;
            }
        } catch (err) {
            console.warn('[TTS] Google female fallback failed:', err.message);
        }
    }

    // 2. Dự phòng cho giọng khác
    const selectedVoiceConfig = SUPPORTED_VOICES[voice] || SUPPORTED_VOICES['hoaimy'];
    const selectedVoice = selectedVoiceConfig.name;
    const selectedMode = MODES[mode] || MODES['standard'];

    const effectiveRate = rate || selectedMode.rate;
    const effectivePitch = pitch || selectedMode.pitch;

    let processedText = cleanText;
    if (mode === 'recite') {
        processedText = formatTextForRecitation(cleanText);
    } else {
        processedText = formatTextForStandard(cleanText);
    }

    try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

        const buffer = await new Promise((resolve, reject) => {
            const { audioStream } = tts.toStream(processedText, {
                rate: effectiveRate,
                pitch: effectivePitch,
            });

            const chunks = [];
            audioStream.on('data', (chunk) => chunks.push(chunk));
            audioStream.on('end', () => resolve(Buffer.concat(chunks)));
            audioStream.on('error', reject);
        });

        if (audioCache.size >= MAX_CACHE_ITEMS) {
            const firstKey = audioCache.keys().next().value;
            audioCache.delete(firstKey);
        }
        audioCache.set(cacheKey, buffer);
        return buffer;
    } catch (edgeErr) {
        console.warn('[TTS] MsEdgeTTS error, fallback to Google TTS:', edgeErr.message);
        const buf = await synthesizeGoogleFemale(cleanText);
        audioCache.set(cacheKey, buf);
        return buf;
    }
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
