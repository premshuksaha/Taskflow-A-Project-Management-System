import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { setAuthData } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen, projectId, projectName, currentMembers = [] }) => {

    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);

    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please select a member");
            return;
        }

        setIsSubmitting(true);

        try {
            await axiosInstance.post(API_PATHS.PROJECT.ADD_MEMBER, {
                projectId: projectId,
                email: email
            });

            // Re-fetch profile to sync all data
            const profileResponse = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
            dispatch(setAuthData(profileResponse.data));

            toast.success("Member added to project successfully!");
            setIsDialogOpen(false);
            setEmail('');
        } catch (error) {
            console.error("Error adding project member:", error);
            toast.error(error.response?.data?.message || "Failed to add project member");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="size-5 text-zinc-900 dark:text-zinc-200" /> Add Member to Project
                    </h2>
                    <p className="text-sm text-zinc-700 dark:text-zinc-400">
                        Adding to Project: <span className="text-blue-600 dark:text-blue-400">{projectName}</span>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
                            {/* List All non project members from current workspace */}
                            <select value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 py-2 focus:outline-none focus:border-blue-500" required >
                                <option value="">Select a member</option>
                                {currentWorkspace?.members
                                    ?.filter((member) => member.user?.email && !currentMembers.includes(member.user.email))
                                    .map((member) => (
                                        <option key={member.user._id || member.user.id} value={member.user.email}> {member.user.email} </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-5 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition" >
                            Cancel
                        </button>
                        <button type="submit" disabled={!currentWorkspace || isSubmitting} className="px-5 py-2 text-sm rounded bg-linear-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white disabled:opacity-50 transition" >
                            {isSubmitting ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectMember;
