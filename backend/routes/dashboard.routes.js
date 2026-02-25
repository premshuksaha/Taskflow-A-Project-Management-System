const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { checkWorkspaceMember } = require('../middleware/workspace.middleware');
const { requireActiveSubscription } = require('../middleware/subscription.middleware');
const { getDashboardStats } = require('../controllers/dashboard.controller');

// Get dashboard statistics - available to all users
router.get('/stats/:workspaceId', protect, checkWorkspaceMember, requireActiveSubscription, getDashboardStats);

module.exports = router;
