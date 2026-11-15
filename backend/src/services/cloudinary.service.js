const cloudinary = require('cloudinary').v2;

/**
 * Cấu hình Cloudinary từ biến môi trường
 */
function getCloudinaryClient() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        return null;
    }

    cloudinary.config({
        cloud_name: cloudName.trim(),
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
    });

    return cloudinary;
}

/**
 * Tải file âm thanh buffer lên Cloudinary
 * Lưu ý: Cloudinary quản lý file audio (mp3, m4a, wav) dưới nhóm resource_type: 'video'
 * 
 * @param {Buffer} buffer - Buffer dữ liệu âm thanh từ multer memoryStorage
 * @param {string} originalName - Tên file gốc người dùng tải lên
 * @returns {Promise<{ url: string, secure_url: string, duration: number, public_id: string }>}
 */
const uploadAudioBuffer = (buffer, originalName = 'audio_recitation') => {
    return new Promise((resolve, reject) => {
        const client = getCloudinaryClient();
        if (!client) {
            return reject(
                new Error(
                    'Hệ thống lưu trữ đám mây chưa được cấu hình. Vui lòng kiểm tra biến môi trường trong file backend/.env'
                )
            );
        }

        const safeBaseName = (originalName || 'recitation')
            .replace(/\.[^/.]+$/, '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '_');

        const uploadStream = client.uploader.upload_stream(
            {
                resource_type: 'video', // BẮT BUỘC cho audio trên Cloudinary
                folder: 'heritage_audio',
                public_id: `${safeBaseName}_${Date.now()}`,
                overwrite: true,
            },
            (error, result) => {
                if (error) {
                    console.error('[Storage] Lỗi tải lên file âm thanh:', error);
                    return reject(new Error(error.message || 'Lỗi khi tải file âm thanh lên hệ thống lưu trữ'));
                }
                resolve(result);
            }
        );

        uploadStream.end(buffer);
    });
};

module.exports = {
    getCloudinaryClient,
    uploadAudioBuffer,
};
