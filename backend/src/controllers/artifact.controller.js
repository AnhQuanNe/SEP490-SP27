const Artifact = require('../models/Artifact');
const artifactAiService = require('../services/artifactAi.service');

// Lấy danh sách tất cả các bảo vật đang active
exports.getAllArtifacts = async (req, res) => {
    try {
        const artifacts = await Artifact.find({ isActive: true })
            .sort({ order: 1, createdAt: 1 })
            .lean();

        res.status(200).json({
            success: true,
            count: artifacts.length,
            data: artifacts
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách bảo vật:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải danh sách bảo vật di sản',
            error: error.message
        });
    }
};

// Lấy chi tiết một bảo vật theo slug
exports.getArtifactBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const artifact = await Artifact.findOne({ slug, isActive: true }).lean();

        if (!artifact) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bảo vật di sản yêu cầu'
            });
        }

        res.status(200).json({
            success: true,
            data: artifact
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết bảo vật:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tải bảo vật',
            error: error.message
        });
    }
};

// Cập nhật bảo vật (Dành cho Admin chỉnh sửa kịch bản thuyết minh, chi tiết khảo cứu)
exports.updateArtifact = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const updateData = req.body;

        const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
        const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

        const updated = await Artifact.findOneAndUpdate(
            query,
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bảo vật để cập nhật'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật bảo vật và kịch bản thuyết minh thành công',
            data: updated
        });
    } catch (error) {
        console.error('Lỗi cập nhật bảo vật:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật bảo vật',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/artifacts/ai-generate-quiz
 * @desc    AI Real 100%: Sinh bộ 3 câu hỏi trắc nghiệm tương tác cho bảo vật bằng Google Gemini
 * @access  Public
 */
exports.generateQuizWithAI = async (req, res, next) => {
    try {
        let artifact = req.body?.artifact;
        const slug = req.body?.slug || req.params?.slug;

        // Nếu client chỉ truyền slug hoặc id, tìm trong Database MongoDB
        if (!artifact && slug) {
            artifact = await Artifact.findOne({ slug, isActive: true }).lean();
        }

        if (!artifact) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp dữ liệu hoặc slug của bảo vật để AI tạo câu hỏi',
            });
        }

        const quizData = await artifactAiService.generateQuizForArtifact(artifact, req.body || {});

        return res.status(200).json({
            success: true,
            data: quizData,
        });
    } catch (error) {
        console.error('Lỗi sinh câu đố AI cho bảo vật:', error);
        return res.status(500).json({
            success: false,
            message: 'Không thể tạo câu hỏi trắc nghiệm AI',
            error: error.message,
        });
    }
};

/**
 * @route   POST /api/artifacts/ai-inspect-hotspot
 * @desc    AI Real 100%: Kính Lúp Di Sản AI mổ xẻ chuyên sâu điểm chạm khảo cứu
 * @access  Public
 */
exports.inspectHotspotWithAI = async (req, res, next) => {
    try {
        let { artifact, hotspot, angleTitle, slug } = req.body;

        if (!artifact && slug) {
            artifact = await Artifact.findOne({ slug, isActive: true }).lean();
        }

        if (!artifact || !hotspot) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp dữ liệu bảo vật và điểm chạm để AI phân tích',
            });
        }

        const inspectionData = await artifactAiService.inspectHotspotWithAI({
            artifact,
            hotspot,
            angleTitle
        });

        return res.status(200).json({
            success: true,
            data: inspectionData,
        });
    } catch (error) {
        console.error('Lỗi mổ xẻ điểm chạm bằng AI:', error);
        return res.status(500).json({
            success: false,
            message: 'Không thể phân tích điểm chạm bằng AI',
            error: error.message,
        });
    }
};
