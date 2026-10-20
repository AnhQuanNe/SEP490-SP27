const crypto = require('crypto');
const GuestUsage = require('../models/GuestUsage');

const GUEST_AI_DAILY_LIMIT = 5;

/**
 * Lấy chuỗi ngày YYYY-MM-DD theo múi giờ Việt Nam (Asia/Ho_Chi_Minh)
 */
function getVietnamDateString() {
    try {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date());
    } catch {
        return new Date().toISOString().slice(0, 10);
    }
}

/**
 * Lấy IP và tạo định danh duy nhất cho Guest
 */
function getClientIdentifier(req) {
    let clientIp =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.ip ||
        req.socket?.remoteAddress ||
        '127.0.0.1';

    // Chuẩn hóa IPv6 loopback
    if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1') {
        clientIp = '127.0.0.1';
    }

    const userAgent = req.headers['user-agent'] || 'unknown';
    const identifier = crypto
        .createHash('sha256')
        .update(`${clientIp}::${userAgent}`)
        .digest('hex');

    return { clientIp, identifier };
}

/**
 * Middleware kiểm tra và trừ lượt quota AI của Guest (5 lượt/ngày)
 * Nếu là Registered User (đã đăng nhập) -> Bỏ qua, không giới hạn
 */
const checkGuestQuota = async (req, res, next) => {
    // Nếu người dùng đã đăng nhập thì không giới hạn lượt
    if (req.user) {
        res.setHeader('X-Guest-Remaining-Quota', 'unlimited');
        return next();
    }

    try {
        const { clientIp, identifier } = getClientIdentifier(req);
        const today = getVietnamDateString();

        const usage = await GuestUsage.findOne({ identifier, date: today });
        const currentCount = usage ? usage.count : 0;

        if (currentCount >= GUEST_AI_DAILY_LIMIT) {
            return res.status(429).json({
                success: false,
                code: 'GUEST_QUOTA_EXCEEDED',
                message: `Bạn đã sử dụng hết ${GUEST_AI_DAILY_LIMIT} lượt trải nghiệm AI miễn phí hôm nay. Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục trò chuyện và tra cứu không giới hạn!`,
                limit: GUEST_AI_DAILY_LIMIT,
                remaining: 0,
                used: currentCount,
            });
        }

        // Tăng số lượt đã sử dụng
        const updated = await GuestUsage.findOneAndUpdate(
            { identifier, date: today },
            {
                $inc: { count: 1 },
                $set: { lastUsedAt: new Date(), ip: clientIp },
                $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true, new: true }
        );

        const remaining = Math.max(0, GUEST_AI_DAILY_LIMIT - updated.count);
        res.setHeader('X-Guest-Remaining-Quota', remaining.toString());
        req.guestQuota = {
            limit: GUEST_AI_DAILY_LIMIT,
            remaining,
            used: updated.count,
        };

        next();
    } catch (error) {
        console.error('[GuestQuotaMiddleware] Lỗi kiểm tra quota:', error.message);
        // Trong trường hợp lỗi database, cho phép request đi tiếp để không chặn người dùng
        next();
    }
};

/**
 * API trả về trạng thái quota hiện tại (không trừ lượt)
 */
const getGuestQuotaStatus = async (req, res) => {
    if (req.user) {
        return res.status(200).json({
            success: true,
            isRegistered: true,
            limit: null,
            remaining: null,
            used: null,
        });
    }

    try {
        const { identifier } = getClientIdentifier(req);
        const today = getVietnamDateString();
        const usage = await GuestUsage.findOne({ identifier, date: today });
        const currentCount = usage ? usage.count : 0;
        const remaining = Math.max(0, GUEST_AI_DAILY_LIMIT - currentCount);

        return res.status(200).json({
            success: true,
            isRegistered: false,
            limit: GUEST_AI_DAILY_LIMIT,
            remaining,
            used: currentCount,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    GUEST_AI_DAILY_LIMIT,
    checkGuestQuota,
    getGuestQuotaStatus,
};
