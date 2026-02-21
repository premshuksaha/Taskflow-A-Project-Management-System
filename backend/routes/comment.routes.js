const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { 
    getCommentsByTask, 
    createComment, 
    updateComment, 
    deleteComment 
} = require('../controllers/comment.controller');

// Get all comments for a task
router.get('/task/:taskId', protect, getCommentsByTask);

// Create a comment
router.post('/add', protect, createComment);

// Update a comment
router.put('/update/:commentId', protect, updateComment);

// Delete a comment
router.delete('/delete/:commentId', protect, deleteComment);

module.exports = router;
