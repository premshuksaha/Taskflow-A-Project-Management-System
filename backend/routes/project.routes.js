const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { checkWorkspaceAdmin, checkProjectPermission, checkWorkspaceMember } = require('../middleware/workspace.middleware');
const { requireActiveSubscription, enforceUsageLimit } = require('../middleware/subscription.middleware');
const { createProject, getProjects, updateProject, deleteProject, addProjectMember } = require('../controllers/project.controller');

// Create a new project (Admin only)
router.post('/add', protect, requireActiveSubscription, checkWorkspaceAdmin, enforceUsageLimit('projects'), createProject);

// Get all projects for the authenticated user
router.get('/get/:workspaceId', protect, checkWorkspaceMember, getProjects);

// Update a project (Admin only)
router.put('/update/:projectId', protect, checkProjectPermission, updateProject);

// Delete a project (Admin only)
router.delete('/delete/:projectId', protect, checkProjectPermission, deleteProject);

// Add member to project (Admin only)
router.post('/add-member', protect, checkProjectPermission, addProjectMember);

module.exports = router;