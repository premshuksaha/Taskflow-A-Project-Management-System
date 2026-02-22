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
        // Mark expired subscription
        subscription.status = 'EXPIRED';
        await subscription.save();

        // Auto-downgrade to FREE plan
        const freePlan = await SubscriptionPlan.findOne({ slug: 'FREE' });
        if (freePlan) {
            // Create new FREE subscription
            const freeSubscription = await Subscription.create({
                workspaceId,
                planId: freePlan._id,
                status: 'ACTIVE',
                periodStart: new Date(),
                periodEnd: null // FREE plan doesn't expire
            });

            // Update workspace to point to FREE plan
            await Workspace.findByIdAndUpdate(workspaceId, { plan: freePlan._id });

            // Return populated FREE subscription
            return await freeSubscription.populate('planId');
        }

        return null;
    }

    return subscription;
};

const getWorkspacePlan = async (workspaceId) => {
    const activeSubscription = await getActiveSubscription(workspaceId);
    // Active subscription always exists due to auto-downgrade to FREE on expiration
    if (activeSubscription?.planId) return activeSubscription.planId;

    // Fallback to workspace plan reference (for legacy data)
    const workspace = await Workspace.findById(workspaceId).populate('plan');
    if (!workspace) return null;

    if (!workspace.plan) {
        return await SubscriptionPlan.findOne({ isDefault: true });
    }

    return workspace.plan;
};

const isSubscriptionActive = async (workspaceId) => {
    const activeSubscription = await getActiveSubscription(workspaceId);
    // Auto-downgrade to FREE ensures there's always a subscription
    return Boolean(activeSubscription);
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
