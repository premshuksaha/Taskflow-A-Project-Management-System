const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getTeamMembers } = require('../controllers/team.controller');

// Get all members of a workspace
router.get('/:workspaceId', protect, getTeamMembers);

module.exports = router;
