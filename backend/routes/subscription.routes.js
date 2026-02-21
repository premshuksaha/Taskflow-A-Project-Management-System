const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { upgradeWorkspacePlan, getPlans } = require('../controllers/subscription.controller');

router.post('/upgrade', protect, upgradeWorkspacePlan);
router.get('/plans', protect, getPlans);

module.exports = router;
