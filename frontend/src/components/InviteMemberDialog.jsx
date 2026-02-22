import { useState } from "react";
import { Mail, UserPlus, Loader2Icon, LockIcon, XIcon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { setAuthData } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [loading, setLoading] = useState(false);
    
    const memberCount = (currentWorkspace?.members?.length || 0);
    const maxMembers = currentWorkspace?.plan?.maxMembers || 0;
    const isLimitReached = maxMembers !== 0 && memberCount >= maxMembers;

    const [formData, setFormData] = useState({
        email: "",
        role: "org:member",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLimitReached) {
            toast.error("Team member limit reached. Please upgrade to PRO.");
            return;
        }
        setLoading(true);

        try {
            const inviteData = {
                workspaceId: currentWorkspace._id,
                email: formData.email,
                role: formData.role === 'org:admin' ? 'ADMIN' : 'MEMBER'
            };

            await axiosInstance.post(API_PATHS.WORKSPACE.INVITE.SEND, inviteData);

            // Re-fetch profile to sync all data
            const profileResponse = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
            dispatch(setAuthData(profileResponse.data));

            toast.success("Invitation sent successfully!");
            setIsDialogOpen(false);
            setFormData({
                email: "",
                role: "org:member",
            });
        } catch (error) {
            console.error("Error inviting member:", error);
            toast.error(error.response?.data?.message || "Failed to invite member");
        } finally {
            setLoading(false);
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200 relative shadow-xl">
                 <button className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" onClick={() => setIsDialogOpen(false)} >
                    <XIcon className="size-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                        <UserPlus className="size-5 text-blue-600 dark:text-blue-400" /> Invite Team Member
                    </h2>
                    {currentWorkspace && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                             Workspace: <span className="font-medium text-zinc-900 dark:text-zinc-200">{currentWorkspace.name}</span>
                             {maxMembers !== -1 && <span className="ml-2 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] uppercase font-bold tracking-wider">{memberCount}/{maxMembers} USED</span>}
                        </p>
                    )}
                </div>

                {isLimitReached ? (
                    <div className="space-y-6 py-4 text-center">
                        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50">
                            <LockIcon className="size-10 text-amber-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-1">Member Limit Reached</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Your current plan allows up to {maxMembers} team members. Upgrade to PRO for unlimited collaboration.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                           <button 
                                onClick={() => { navigate('/subscription'); setIsDialogOpen(false); }}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
                            >
                                Compare Plans
                            </button>
                            <button 
                                onClick={() => setIsDialogOpen(false)}
                                className="w-full py-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition text-sm"
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Form from original code */
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="colleague@example.com" className="pl-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-200 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" required />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-200">Role</label>
                            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-200 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all shadow-sm" >
                                <option value="org:member">Member (Can edit tasks)</option>
                                <option value="org:admin">Admin (Full Control)</option>
                            </select>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-6">
                            <button type="button" onClick={() => setIsDialogOpen(false)} className="px-5 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition" >
                                Cancel
                            </button>
                            <button type="submit" disabled={!currentWorkspace || loading} className="px-6 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition flex items-center gap-2 shadow-sm" >
                                {loading ? <Loader2Icon className="size-4 animate-spin" /> : "Invite Member"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default InviteMemberDialog;
