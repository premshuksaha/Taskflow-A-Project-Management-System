const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const workspaceMemberSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, ref: 'User', required: true },
    workspaceId: { type: String, ref: 'Workspace', required: true },
    role: { 
        type: String, 
        enum: ['ADMIN', 'MEMBER'], 
        default: 'MEMBER' 
    }
}, { timestamps: true });

// prevent duplicate membership
workspaceMemberSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

const WorkspaceMember = mongoose.model('WorkspaceMember', workspaceMemberSchema);

module.exports = WorkspaceMember;
