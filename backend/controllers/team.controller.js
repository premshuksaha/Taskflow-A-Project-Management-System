const WorkspaceMember = require('../models/workspaceMember.model');

const getTeamMembers = async (req, res) => {
    const { workspaceId } = req.params;

    try {
        // Check if the user is a member of the workspace
        const membership = await WorkspaceMember.findOne({ workspaceId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get all members of the workspace
        const members = await WorkspaceMember.find({ workspaceId }).populate('userId', 'name email');
        res.json(members);
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getTeamMembers };