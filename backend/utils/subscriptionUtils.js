const Workspace = require('../models/workspace.model');
const SubscriptionPlan = require('../models/subscriptionPlan.model');

const getWorkspacePlan = async (workspaceId) => {
    const workspace = await Workspace.findById(workspaceId).populate('plan');
    if (!workspace) return null;

    // If for some reason the workspace doesn't have a plan link, look for default
    if (!workspace.plan) {
        return await SubscriptionPlan.findOne({ isDefault: true });
    }

    return workspace.plan;
};

const isFeatureAllowed = async (workspaceId, featureName) => {
    const plan = await getWorkspacePlan(workspaceId);
    if (!plan) return false;

    return plan.features.includes(featureName);
};

const hasReachedLimit = async (workspaceId, limitType, currentCount) => {
    const plan = await getWorkspacePlan(workspaceId);
    if (!plan) return true; // Fail safe

    let limitValue = 0;
    if (limitType === 'max_projects') {
        limitValue = plan.maxProjects;
    } else if (limitType === 'max_members') {
        limitValue = plan.maxMembers;
    } else if (limitType === 'max_tasks') {
        limitValue = plan.maxTasks;
    }

    if (limitValue === 0) return false; // 0 means unlimited

    return currentCount >= limitValue;
};


module.exports = {
    getWorkspacePlan,
    isFeatureAllowed,
    hasReachedLimit
};
