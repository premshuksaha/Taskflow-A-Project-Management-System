const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    workspaceId: { type: String, ref: 'Workspace', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    status: { type: String, enum: ['ACTIVE', 'EXPIRED'], default: 'ACTIVE' },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date },
    canceledAt: { type: Date }
}, { timestamps: true });

subscriptionSchema.index({ workspaceId: 1, status: 1 });
subscriptionSchema.index({ workspaceId: 1, periodEnd: -1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
