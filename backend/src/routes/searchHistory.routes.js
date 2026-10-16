const express = require('express');
const router = express.Router();
const searchHistoryController = require('../controllers/searchHistory.controller');
const { protect } = require('../middlewares/auth.middlewares');

router.use(protect);

router.get('/', searchHistoryController.getHistory);
router.delete('/', searchHistoryController.clearHistory);
router.delete('/:id', searchHistoryController.deleteHistoryItem);

module.exports = router;
