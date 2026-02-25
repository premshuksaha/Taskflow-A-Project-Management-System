const Workspace = require('../models/workspace.model');
const WorkspaceMember = require('../models/workspaceMember.model');
const WorkspaceInvite = require('../models/workspaceInvite.model');
const User = require('../models/user.model');
const { getWorkspacePlan, isSubscriptionActive } = require('../utils/subscriptionUtils');
const { checkAndIncrementUsage, getUsageDoc } = require('../utils/usageUtils');
const { sendInviteEmail } = require('../utils/emailService');
const { generateInviteToken, calculateExpirationDate } = require('../utils/inviteTokenUtils');

// Send invite to a new member
exports.sendInvite = async (req, res) => {
    try {
        const { workspaceId, email, role } = req.body;
        const inviterId = req.user._id;

        // Validate inputs
        if (!workspaceId || !email || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!['ADMIN', 'MEMBER'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Check if requester is admin of the workspace
        const requesterMembership = await WorkspaceMember.findOne({ 
            workspaceId, 
            userId: inviterId 
        });
        
        if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Only workspace admins can invite members' });
        }

        // Get workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        const plan = await getWorkspacePlan(workspaceId);
        if (!plan) {
            return res.status(403).json({ message: 'No subscription plan assigned to this workspace.' });
        }

        const usage = await getUsageDoc(workspaceId);
        if (plan.maxMembers !== 0 && usage.counts.members >= plan.maxMembers) {
            return res.status(403).json({ message: 'Member limit reached for your current subscription plan.' });
        }

        // Check if email already a member
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const existingMember = await WorkspaceMember.findOne({ 
                userId: existingUser._id, 
                workspaceId 
            });
            if (existingMember) {
                return res.status(400).json({ message: 'User is already a member of this workspace' });
            }
        }

        // Check for existing pending invitation
        const existingInvite = await WorkspaceInvite.findOne({
            workspaceId,
            email: email.toLowerCase(),
            status: 'PENDING'
        });

        if (existingInvite) {
            return res.status(400).json({ message: 'An invitation is already pending for this email' });
        }

        // Generate token and expiration
        const token = generateInviteToken();
        const expiresAt = calculateExpirationDate(7);

        // Create invite record
        const invite = new WorkspaceInvite({
            workspaceId,
            email: email.toLowerCase(),
            invitedBy: inviterId,
            token,
            role,
            expiresAt
        });

        await invite.save();

        // Send email
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite/${token}`;
        const inviterUser = await User.findById(inviterId);

        try {
            await sendInviteEmail(email, inviteLink, inviterUser.name, workspace.name);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Delete the invite if email fails
            await WorkspaceInvite.deleteOne({ _id: invite._id });
            return res.status(500).json({ message: 'Failed to send invite email. Please try again.' });
        }

        res.status(201).json({ 
            message: 'Invitation sent successfully',
            invite: {
                _id: invite._id,
                email: invite.email,
                role: invite.role,
                status: invite.status
            }
        });
    } catch (error) {
        console.error('Error sending invite:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Validate and accept invite
exports.acceptInvite = async (req, res) => {
    try {
        const { token, email, password, name } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Invalid or missing token' });
        }

        // Find invite
        const invite = await WorkspaceInvite.findOne({ token }).populate('workspaceId invitedBy');
        
        if (!invite) {
            return res.status(404).json({ message: 'Invite not found or expired' });
        }

        if (invite.status !== 'PENDING') {
            return res.status(400).json({ message: `This invitation has already been ${invite.status.toLowerCase()}` });
        }

        if (new Date() > invite.expiresAt) {
            invite.status = 'EXPIRED';
            await invite.save();
            return res.status(410).json({ message: 'Invitation has expired' });
        }

        if (!await isSubscriptionActive(invite.workspaceId._id)) {
            return res.status(403).json({ message: 'Subscription is expired. Please renew to continue.' });
        }

        // Check if invited email matches
        if (invite.email.toLowerCase() !== email.toLowerCase()) {
            return res.status(400).json({ message: 'Email does not match invitation' });
        }

        // Look for existing user
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Create new user if doesn't exist
            if (!password || !name) {
                return res.status(400).json({ message: 'Password and name required for new account' });
            }

            // Validate password
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters' });
            }

            user = new User({
                name,
                email: email.toLowerCase(),
                password
            });
            await user.save();
        } else {
            // User exists, check if already a member
            const existingMember = await WorkspaceMember.findOne({
                userId: user._id,
                workspaceId: invite.workspaceId._id
            });

            if (existingMember) {
                return res.status(400).json({ message: 'User is already a member of this workspace' });
            }
        }

        const plan = await getWorkspacePlan(invite.workspaceId._id);
        if (!plan) {
            return res.status(403).json({ message: 'No subscription plan assigned to this workspace.' });
        }

        const memberAllowed = await checkAndIncrementUsage(invite.workspaceId._id, 'members', plan.maxMembers);
        if (!memberAllowed) {
            return res.status(403).json({ message: 'Member limit reached for your current subscription plan.' });
        }

        // Add user to workspace
        const member = new WorkspaceMember({
            userId: user._id,
            workspaceId: invite.workspaceId._id,
            role: invite.role
        });
        await member.save();

        // Mark invite as accepted
        invite.status = 'ACCEPTED';
        invite.acceptedAt = new Date();
        invite.acceptedBy = user._id;
        await invite.save();

        res.status(200).json({
            message: 'Invitation accepted successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            workspace: {
                _id: invite.workspaceId._id,
                name: invite.workspaceId.name
            }
        });
    } catch (error) {
        console.error('Error accepting invite:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get invite details (for validation before accepting)
exports.getInviteDetails = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const invite = await WorkspaceInvite.findOne({ token })
            .populate('workspaceId', 'name')
            .populate('invitedBy', 'name email');

        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        if (invite.status !== 'PENDING') {
            return res.status(400).json({ 
                message: `This invitation has already been ${invite.status.toLowerCase()}`,
                status: invite.status
            });
        }

        if (new Date() > invite.expiresAt) {
            invite.status = 'EXPIRED';
            await invite.save();
            return res.status(410).json({ message: 'Invitation has expired' });
        }

        res.json({
            email: invite.email,
            workspace: invite.workspaceId?.name,
            invitedBy: invite.invitedBy?.name,
            role: invite.role,
            expiresAt: invite.expiresAt
        });
    } catch (error) {
        console.error('Error getting invite details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.addMember = async (req, res) => {
    return exports.sendInvite(req, res);
}

exports.getWorkspacesByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const requesterId = req.user._id;

        // Only allow users to access their own workspaces, or allow admins to access any user's workspaces
        if (userId !== requesterId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Return workspaces where user is owner or member
        const ownedWorkspaces = await Workspace.find({ ownerId: userId }).populate('plan');
        
        const memberships = await WorkspaceMember.find({ userId }).populate('workspaceId');
        const memberWorkspaces = memberships.map(m => m.workspaceId);

        const allWorkspaces = [...ownedWorkspaces, ...memberWorkspaces];

        res.json(allWorkspaces);
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.updateWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        const workspace = await Workspace.findByIdAndUpdate(id, { name }, { new: true });
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
        
        res.json(workspace);
    } catch (error) {
        console.error('Error updating workspace:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.deleteWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        await Workspace.findByIdAndDelete(id);
        res.json({ message: 'Workspace deleted successfully' });
    } catch (error) {
        console.error('Error deleting workspace:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
