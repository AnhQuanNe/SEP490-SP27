const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const learningRoutes = require('./learning.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/learning', learningRoutes);

module.exports = router;
