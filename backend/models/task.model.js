const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const taskSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    projectId: { type: String, ref: 'Project', required: true },
    workspaceId: { type: String, ref: 'Workspace', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { 
        type: String, 
        enum: ['TODO', 'IN_PROGRESS', 'DONE'], 
        default: 'TODO' 
    },
    type: { 
        type: String, 
        enum: ['TASK', 'BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER'], 
        default: 'TASK' 
    },
    priority: { 
        type: String, 
        enum: ['LOW', 'MEDIUM', 'HIGH'], 
        default: 'MEDIUM' 
    },
    assigneeId: { type: String, ref: 'User' },
    due_date: { type: Date },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
