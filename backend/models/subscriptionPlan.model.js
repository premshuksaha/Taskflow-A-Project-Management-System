const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // 'FREE', 'PRO'
    features: [{ type: String }], // 'ANALYTICS', 'CALENDAR', etc.
    maxProjects: { type: Number, default: 0 }, // 0 for unlimited
    maxTasks: { type: Number, default: 0 }, // 0 for unlimited
    maxMembers: { type: Number, default: 0 }, // 0 for unlimited
    isDefault: { type: Boolean, default: false },
    price: { type: Number, default: 0 }
}, { timestamps: true });

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

module.exports = SubscriptionPlan;
