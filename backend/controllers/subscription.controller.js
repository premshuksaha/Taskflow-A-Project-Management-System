const Workspace = require('../models/workspace.model');
const SubscriptionPlan = require('../models/subscriptionPlan.model');
const Subscription = require('../models/subscription.model');

// Upgrade or change workspace plan (Demo purpose)
const upgradeWorkspacePlan = async (req, res) => {
    try {
        const { workspaceId, planSlug } = req.body;

        const plan = await SubscriptionPlan.findOne({ slug: planSlug });
        if (!plan) {
            return res.status(404).json({ message: 'Target plan not found' });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Expire any active subscriptions for this workspace
        await Subscription.updateMany(
            { workspaceId, status: 'ACTIVE' },
            { status: 'EXPIRED', canceledAt: new Date() }
        );

        // Mock a 30-day period for demo
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() + 30);

        await Subscription.create({
            workspaceId,
            planId: plan._id,
            status: 'ACTIVE',
            periodStart: new Date(),
            periodEnd
        });

        workspace.plan = plan._id;

        await workspace.save();

        res.json({ 
            message: `Workspace plan successfully updated to ${plan.name}`,
            workspace 
        });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get available plans for the demo
const getPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find();
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    upgradeWorkspacePlan,
    getPlans
};
