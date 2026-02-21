const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { checkWorkspaceAdmin, checkTaskUpdatePermission, checkTaskDeletePermission } = require('../middleware/workspace.middleware');
const { createTask, getTasksByProject, getTasksByWorkspace, updateTask, deleteTask } = require('../controllers/task.controller');

// Create a task (Admin only)
router.post('/add', protect, checkWorkspaceAdmin, createTask);

// Get tasks for a project
router.get('/get/project/:projectId', protect, getTasksByProject);

// Get tasks for a workspace
router.get('/get/workspace/:workspaceId', protect, getTasksByWorkspace);

// Update a task (Admin or assigned member)
router.put('/update/:taskId', protect, checkTaskUpdatePermission, updateTask);

// Delete a task (Admin only)
router.delete('/delete/:taskId', protect, checkTaskDeletePermission, deleteTask);

module.exports = router;
