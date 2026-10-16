const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const literatureRoutes = require('./literature.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/literature', literatureRoutes);

module.exports = router;
