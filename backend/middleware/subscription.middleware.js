const { getWorkspacePlan, isSubscriptionActive, isFeatureAllowed } = require('../utils/subscriptionUtils');
const { checkAndIncrementUsage } = require('../utils/usageUtils');

const getWorkspaceIdFromRequest = (req) => {
    return req.body?.workspaceId || req.params?.workspaceId || req.query?.workspaceId;
};

const requireActiveSubscription = async (req, res, next) => {
    try {
        const workspaceId = getWorkspaceIdFromRequest(req);
        if (!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID is required' });
        }

        const isActive = await isSubscriptionActive(workspaceId);
        if (!isActive) {
            return res.status(403).json({ message: 'Subscription is expired. Please renew to continue.' });
        }

        next();
    } catch (error) {
        console.error('Error checking subscription status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const requireFeature = (featureName) => async (req, res, next) => {
    try {
        const workspaceId = getWorkspaceIdFromRequest(req);
        if (!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID is required' });
        }

        const allowed = await isFeatureAllowed(workspaceId, featureName);
        if (!allowed) {
            return res.status(403).json({ message: 'Feature not available on your current plan.' });
        }

        next();
    } catch (error) {
        console.error('Error checking feature entitlement:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const enforceUsageLimit = (usageKey) => async (req, res, next) => {
    try {
        const workspaceId = getWorkspaceIdFromRequest(req);
        if (!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID is required' });
        }

        const plan = await getWorkspacePlan(workspaceId);
        if (!plan) {
            return res.status(403).json({ message: 'No subscription plan assigned to this workspace.' });
        }

        let limitValue = 0;
        if (usageKey === 'projects') limitValue = plan.maxProjects;
        if (usageKey === 'tasks') limitValue = plan.maxTasks;
        if (usageKey === 'members') limitValue = plan.maxMembers;

        const allowed = await checkAndIncrementUsage(workspaceId, usageKey, limitValue);
        if (!allowed) {
            return res.status(403).json({ message: 'Usage limit reached for your current plan.' });
        }

        next();
    } catch (error) {
        console.error('Error enforcing usage limit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    requireActiveSubscription,
    requireFeature,
    enforceUsageLimit
};
