const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getDashboardStats } = require('../controllers/dashboard.controller');

// Get dashboard statistics
router.get('/stats/:workspaceId', protect, getDashboardStats);

module.exports = router;
