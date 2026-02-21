const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const commentSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    content: { type: String, required: true },
    userId: { type: String, ref: 'User', required: true },
    taskId: { type: String, ref: 'Task', required: true },
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
