const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { checkWorkspaceMember } = require('../middleware/workspace.middleware');
const { requireActiveSubscription, requireFeature } = require('../middleware/subscription.middleware');
const { getDashboardStats } = require('../controllers/dashboard.controller');

// Get dashboard statistics
router.get('/stats/:workspaceId', protect, checkWorkspaceMember, requireActiveSubscription, requireFeature('ANALYTICS'), getDashboardStats);

module.exports = router;
