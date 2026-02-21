const Workspace = require('../models/workspace.model');
const SubscriptionPlan = require('../models/subscriptionPlan.model');

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

        workspace.plan = plan._id;
        // Mock a 30-day period for demo
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() + 30);
        workspace.subscriptionPeriodEnd = periodEnd;

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
