const Workspace = require('../models/workspace.model');
const SubscriptionPlan = require('../models/subscriptionPlan.model');
const Subscription = require('../models/subscription.model');

const isExpired = (subscription) => {
    if (!subscription?.periodEnd) return false;
    return new Date() > new Date(subscription.periodEnd);
};

const getActiveSubscription = async (workspaceId) => {
    const subscription = await Subscription.findOne({
        workspaceId,
        status: 'ACTIVE'
    }).sort({ periodEnd: -1, createdAt: -1 }).populate('planId');

    if (!subscription) return null;

    if (isExpired(subscription)) {
        subscription.status = 'EXPIRED';
        await subscription.save();
        return null;
    }

    return subscription;
};

const getWorkspacePlan = async (workspaceId) => {
    const activeSubscription = await getActiveSubscription(workspaceId);
    if (activeSubscription?.planId) return activeSubscription.planId;

    const workspace = await Workspace.findById(workspaceId).populate('plan');
    if (!workspace) return null;

    // If for some reason the workspace doesn't have a plan link, look for default
    if (!workspace.plan) {
        return await SubscriptionPlan.findOne({ isDefault: true });
    }

    return workspace.plan;
};

const isSubscriptionActive = async (workspaceId) => {
    const activeSubscription = await getActiveSubscription(workspaceId);
    if (activeSubscription) return true;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return false;

    return Boolean(workspace.plan);
};

const isFeatureAllowed = async (workspaceId, featureName) => {
    const plan = await getWorkspacePlan(workspaceId);
    if (!plan) return false;

    return plan.features.includes(featureName);
};

module.exports = {
    getWorkspacePlan,
    getActiveSubscription,
    isSubscriptionActive,
    isFeatureAllowed
};
