const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const literatureRoutes = require('./literature.routes');
const aiRoutes = require('./ai.routes');
const quizRoutes = require('./quiz.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/literature', literatureRoutes);
router.use('/ai', aiRoutes);
router.use('/quiz', quizRoutes);

module.exports = router;
