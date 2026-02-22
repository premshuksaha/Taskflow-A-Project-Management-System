const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { checkWorkspaceAdmin } = require('../middleware/workspace.middleware');
const { upgradeWorkspacePlan, getPlans } = require('../controllers/subscription.controller');

router.post('/upgrade', protect, checkWorkspaceAdmin, upgradeWorkspacePlan);
router.get('/plans', protect, getPlans);

module.exports = router;
