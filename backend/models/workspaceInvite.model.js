const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const workspaceInviteSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    workspaceId: { type: String, ref: 'Workspace', required: true },
    email: { type: String, required: true, lowercase: true },
    invitedBy: { type: String, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    role: { 
        type: String, 
        enum: ['ADMIN', 'MEMBER'], 
        default: 'MEMBER',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'EXPIRED'],
        default: 'PENDING'
    },
    acceptedAt: { type: Date, default: null },
    acceptedBy: { type: String, ref: 'User', default: null },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // Auto-delete after expiry
    }
}, { timestamps: true });

// Prevent duplicate pending invites to same email for same workspace
workspaceInviteSchema.index({ 
    workspaceId: 1, 
    email: 1,
    status: 1
}, { 
    unique: true, 
    partialFilterExpression: { status: 'PENDING' }
});

const WorkspaceInvite = mongoose.model('WorkspaceInvite', workspaceInviteSchema);

module.exports = WorkspaceInvite;
