const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const projectMemberSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, ref: 'User', required: true },
    projectId: { type: String, ref: 'Project', required: true },
}, { timestamps: true });

// prevent duplicate membership
projectMemberSchema.index({ userId: 1, projectId: 1 }, { unique: true });

const ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);

module.exports = ProjectMember;
