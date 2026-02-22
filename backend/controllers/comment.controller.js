const Comment = require('../models/comment.model');
const Task = require('../models/task.model');
const User = require('../models/user.model');

/**
 * Get all comments for a task
 */
exports.getCommentsByTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!taskId) {
            return res.status(400).json({ message: 'Task ID is required' });
        }

        const comments = await Comment.find({ taskId })
            .populate('userId', 'name email image')
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Create a new comment on a task
 */
exports.createComment = async (req, res) => {
    try {
        const { taskId, content } = req.body;
        const userId = req.user._id;

        if (!taskId || !content || !content.trim()) {
            return res.status(400).json({ message: 'Task ID and content are required' });
        }

        // Verify task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const newComment = new Comment({
            content: content.trim(),
            userId,
            taskId
        });

        await newComment.save();

        // Populate user info for response
        await newComment.populate('userId', 'name email image');

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Update a comment
 */
exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Only comment creator can edit
        if (comment.userId !== userId) {
            return res.status(403).json({ message: 'You can only edit your own comments' });
        }

        // Verify user is still a member of the task's workspace
        const task = await Task.findById(comment.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const Workspace = require('../models/workspace.model');
        const WorkspaceMember = require('../models/workspaceMember.model');

        const workspace = await Workspace.findOne({
            _id: task.workspaceId,
            ownerId: userId
        });

        if (!workspace) {
            const membership = await WorkspaceMember.findOne({
                workspaceId: task.workspaceId,
                userId
            });

            if (!membership) {
                return res.status(403).json({ message: 'You are not a member of this workspace' });
            }
        }

        comment.content = content.trim();
        await comment.save();
        await comment.populate('userId', 'name email image');

        res.json(comment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Delete a comment
 */
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Only comment creator can delete
        if (comment.userId !== userId) {
            return res.status(403).json({ message: 'You can only delete your own comments' });
        }

        // Verify user is still a member of the task's workspace
        const task = await Task.findById(comment.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const Workspace = require('../models/workspace.model');
        const WorkspaceMember = require('../models/workspaceMember.model');

        const workspace = await Workspace.findOne({
            _id: task.workspaceId,
            ownerId: userId
        });

        if (!workspace) {
            const membership = await WorkspaceMember.findOne({
                workspaceId: task.workspaceId,
                userId
            });

            if (!membership) {
                return res.status(403).json({ message: 'You are not a member of this workspace' });
            }
        }

        await Comment.findByIdAndDelete(commentId);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
