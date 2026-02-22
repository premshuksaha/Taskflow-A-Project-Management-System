const mongoose = require('mongoose');

const workspaceUsageSchema = new mongoose.Schema({
    workspaceId: { type: String, ref: 'Workspace', required: true, unique: true },
    counts: {
        projects: { type: Number, default: 0 },
        tasks: { type: Number, default: 0 },
        members: { type: Number, default: 0 }
    },
    lastSyncedAt: { type: Date }
}, { timestamps: true });

const WorkspaceUsage = mongoose.model('WorkspaceUsage', workspaceUsageSchema);

module.exports = WorkspaceUsage;
