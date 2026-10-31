const ttsService = require('../services/tts.service');

/**
 * Endpoint chuyển văn bản ca dao, tục ngữ thành giọng đọc AI truyền cảm
 * Hỗ trợ cả POST (Body) lẫn GET (Query params) để tiện tích hợp vào thẻ audio trực tiếp
 */
const speak = async (req, res) => {
    try {
        const text = req.body?.text || req.query?.text;
        const voice = req.body?.voice || req.query?.voice || 'hoaimy';
        const mode = req.body?.mode || req.query?.mode || 'recite';
        const rate = req.body?.rate || req.query?.rate;
        const pitch = req.body?.pitch || req.query?.pitch;

        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp văn bản cần ngâm/đọc'
            });
        }

        if (text.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Đoạn văn bản quá dài (tối đa 1000 ký tự cho mỗi lần đọc)'
            });
        }

        const audioBuffer = await ttsService.synthesize({
            text,
            voice,
            mode,
            rate,
            pitch
        });

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
            'Cache-Control': 'public, max-age=86400',
            'Accept-Ranges': 'bytes'
        });

        return res.status(200).send(audioBuffer);
    } catch (error) {
        console.error('[TTS Controller] Lỗi phát giọng đọc:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Không thể tạo âm thanh giọng đọc'
        });
    }
};

/**
 * Lấy danh sách các giọng đọc và phong cách ngâm thơ
 */
const getVoices = (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            voices: ttsService.getAvailableVoices(),
            modes: ttsService.getAvailableModes()
        }
    });
};

module.exports = {
    speak,
    getVoices
};
