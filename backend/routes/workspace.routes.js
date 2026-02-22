const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { checkWorkspaceAdmin, checkWorkspaceMember } = require('../middleware/workspace.middleware');
const { requireActiveSubscription } = require('../middleware/subscription.middleware');
const { getWorkspacesByUser, updateWorkspace, deleteWorkspace, addMember, sendInvite, acceptInvite, getInviteDetails } = require('../controllers/workspace.controller');

// Invite management
router.post('/invite/send', protect, requireActiveSubscription, checkWorkspaceAdmin, sendInvite);
router.post('/invite/accept', acceptInvite);
router.get('/invite/:token', getInviteDetails);

// Legacy route (now redirects to sendInvite)
router.post('/add-member', protect, checkWorkspaceAdmin, addMember);

// Get workspaces by user (can only access own workspaces unless admin)
router.get('/user/:userId', protect, getWorkspacesByUser);

// Update a workspace
router.put('/update/:id', protect, checkWorkspaceAdmin, updateWorkspace);

// Delete a workspace
router.delete('/delete/:id', protect, checkWorkspaceAdmin, deleteWorkspace);

module.exports = router;
