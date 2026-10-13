const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const learningRoutes = require('./learning.routes');
const educatorRoutes = require('./educator.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/learning', learningRoutes);
router.use('/educator', educatorRoutes);

module.exports = router;
