const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { protect } = require('../middlewares/auth.middlewares');

// Tất cả các route yêu thích đều yêu cầu đăng nhập
router.use(protect);

router.get('/', favoriteController.getFavorites);
router.post('/:workId', favoriteController.toggleFavorite);
router.delete('/:workId', favoriteController.toggleFavorite);
router.get('/check/:workId', favoriteController.checkFavorite);

module.exports = router;
