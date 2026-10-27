const express = require('express');
const router = express.Router();
const artifactController = require('../controllers/artifact.controller');

// Public endpoints
router.get('/', artifactController.getAllArtifacts);
router.get('/:slug', artifactController.getArtifactBySlug);

// Endpoint cập nhật bảo vật & kịch bản thuyết minh (Admin / CMS)
router.put('/:idOrSlug', artifactController.updateArtifact);

module.exports = router;
