const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const projectSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true },
    description: { type: String },
    priority: { 
        type: String, 
        enum: ['LOW', 'MEDIUM', 'HIGH'], 
        default: 'MEDIUM' 
    },
    status: { 
        type: String, 
        enum: ['ACTIVE', 'PLANNING', 'COMPLETED', 'ON_HOLD', 'CANCELLED'], 
        default: 'ACTIVE' 
    },
    start_date: { type: Date },
    end_date: { type: Date },
    team_lead: { type: String, ref: 'User', required: true },
    workspaceId: { type: String, ref: 'Workspace', required: true },
    progress: { type: Number, default: 0 },
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
