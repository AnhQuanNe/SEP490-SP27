const express = require('express');
const router = express.Router();
const ttsController = require('../controllers/tts.controller');

// Hỗ trợ cả GET và POST để linh hoạt:
// POST /api/tts/speak (hoặc POST /api/tts) với body JSON { text, voice, mode }
// GET /api/tts/speak?text=...&voice=...&mode=... (tiện dùng thẳng vào <audio src="...">)
router.all('/', ttsController.speak);
router.all('/speak', ttsController.speak);
router.get('/voices', ttsController.getVoices);

module.exports = router;
