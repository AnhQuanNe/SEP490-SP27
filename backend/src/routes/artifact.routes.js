const express = require('express');
const router = express.Router();
const artifactController = require('../controllers/artifact.controller');

// Public endpoints
router.get('/', artifactController.getAllArtifacts);

// AI Real 100%: Sinh 3 câu hỏi trắc nghiệm tương tác cho bảo vật
router.post('/ai-generate-quiz', artifactController.generateQuizWithAI);
router.post('/:slug/ai-quiz', artifactController.generateQuizWithAI);

// AI Real 100%: Kính Lúp Di Sản AI mổ xẻ chuyên sâu điểm chạm khảo cứu
router.post('/ai-inspect-hotspot', artifactController.inspectHotspotWithAI);

router.get('/:slug', artifactController.getArtifactBySlug);

// Endpoint cập nhật bảo vật & kịch bản thuyết minh (Admin / CMS)
router.put('/:idOrSlug', artifactController.updateArtifact);

module.exports = router;
