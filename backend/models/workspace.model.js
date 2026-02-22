const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const workspaceSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    ownerId: { type: String, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
}, { timestamps: true });

workspaceSchema.pre('save', async function() {
    if (this.isNew && !this.plan) {
        const SubscriptionPlan = mongoose.model('SubscriptionPlan');
        const defaultPlan = await SubscriptionPlan.findOne({ isDefault: true });
        if (defaultPlan) {
            this.plan = defaultPlan._id;
        }
    };
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
