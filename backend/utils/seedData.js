const SubscriptionPlan = require('../models/subscriptionPlan.model');

const seedPlans = async () => {
    try {
        const plans = [
            {
                name: 'Free Plan',
                slug: 'FREE',
                features: ['CALENDAR', 'TASKS'],
                maxProjects: 3,
                maxTasks: 10,
                maxMembers: 10,
                isDefault: true,
                price: 0
            },
            {
                name: 'Pro Plan',
                slug: 'PRO',
                features: ['ANALYTICS', 'CALENDAR', 'TASKS', 'PRIORITY_SUPPORT'],
                maxProjects: 0, // unlimited
                maxTasks: 0, // unlimited
                maxMembers: 0, // unlimited
                isDefault: false,
                price: 29 // Example price
            },
        ];

        // Use upsert to insert new plans or update existing ones
        let createdCount = 0;
        for (const plan of plans) {
            const result = await SubscriptionPlan.findOneAndUpdate(
                { slug: plan.slug },
                plan,
                { upsert: true, returnDocument: 'after' }
            );
            // Check if this was a new document (no __v means it didn't exist before)
            if (result.createdAt === result.updatedAt) {
                createdCount++;
            }
        }
        if (createdCount > 0) {
            console.log(`${createdCount} new subscription plan(s) added.`);
        }
    } catch (error) {
        console.error('Error seeding subscription plans:', error);
    }
};

module.exports = seedPlans;
