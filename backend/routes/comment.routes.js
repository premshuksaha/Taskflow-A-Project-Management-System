const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { checkTaskMember } = require('../middleware/workspace.middleware');
const { 
    getCommentsByTask, 
    createComment, 
    updateComment, 
    deleteComment 
} = require('../controllers/comment.controller');

// Get all comments for a task
router.get('/task/:taskId', protect, checkTaskMember, getCommentsByTask);

// Create a comment
router.post('/add', protect, checkTaskMember, createComment);

// Update a comment
router.put('/update/:commentId', protect, checkTaskMember, updateComment);

// Delete a comment
router.delete('/delete/:commentId', protect, checkTaskMember, deleteComment);

module.exports = router;
