const WorkspaceUsage = require('../models/workspaceUsage.model');
const Project = require('../models/project.model');
const Task = require('../models/task.model');
const WorkspaceMember = require('../models/workspaceMember.model');

const syncUsageCounts = async (workspaceId) => {
    const [projects, tasks, members] = await Promise.all([
        Project.countDocuments({ workspaceId }),
        Task.countDocuments({ workspaceId }),
        WorkspaceMember.countDocuments({ workspaceId })
    ]);

    const usage = await WorkspaceUsage.findOneAndUpdate(
        { workspaceId },
        {
            counts: { projects, tasks, members },
            lastSyncedAt: new Date()
        },
        { upsert: true, returnDocument: 'after' }
    );

    return usage;
};

const getUsageDoc = async (workspaceId) => {
    const existing = await WorkspaceUsage.findOne({ workspaceId });
    if (existing) return existing;
    return syncUsageCounts(workspaceId);
};

const checkAndIncrementUsage = async (workspaceId, metric, limitValue) => {
    if (!workspaceId) return false;
    if (limitValue === 0) return true; // unlimited

    await getUsageDoc(workspaceId);

    const updateResult = await WorkspaceUsage.updateOne(
        { workspaceId, [`counts.${metric}`]: { $lt: limitValue } },
        { $inc: { [`counts.${metric}`]: 1 } }
    );

    return updateResult.modifiedCount === 1;
};

const decrementUsage = async (workspaceId, metric) => {
    if (!workspaceId) return;

    await WorkspaceUsage.updateOne(
        { workspaceId, [`counts.${metric}`]: { $gt: 0 } },
        { $inc: { [`counts.${metric}`]: -1 } }
    );
};

module.exports = {
    syncUsageCounts,
    getUsageDoc,
    checkAndIncrementUsage,
    decrementUsage
};
