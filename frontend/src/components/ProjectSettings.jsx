import { format, isValid } from "date-fns";
import { Plus, Save, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { setAuthData } from "../features/workspaceSlice";
import AddProjectMember from "./AddProjectMember";

export default function ProjectSettings({ project }) {

    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.workspace?.currentUser);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "",
        priority: "",
        start_date: "",
        end_date: "",
        progress: 0,
    });

    // Check if current user is admin in the workspace
    const isWorkspaceAdmin = currentWorkspace?.role === 'ADMIN' || currentWorkspace?.ownerId === currentUser?._id;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axiosInstance.put(API_PATHS.PROJECT.UPDATE(project._id), {
                ...formData
            });

            // Re-fetch profile to sync all data
            const profileResponse = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
            dispatch(setAuthData(profileResponse.data));

            toast.success("Project updated successfully!");
        } catch (error) {
            console.error("Error updating project:", error);
            toast.error(error.response?.data?.message || "Failed to update project");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDateSafe = (date, pattern = "yyyy-MM-dd") => {
        if (!date) return "";
        const d = new Date(date);
        return isValid(d) ? format(d, pattern) : "";
    };

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || "",
                description: project.description || "",
                status: project.status || "PLANNING",
                priority: project.priority || "MEDIUM",
                start_date: project.start_date ? new Date(project.start_date) : "",
                end_date: project.end_date ? new Date(project.end_date) : "",
                progress: project.progress || 0,
            });
        }
    }, [project]);

    const inputClasses = "w-full px-3 py-2 rounded mt-2 border text-sm dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-300";

    const cardClasses = "rounded-lg border p-6 dark:bg-gradient-to-br dark:from-zinc-900/70 dark:to-zinc-900/40 border-zinc-300 dark:border-zinc-800";

    const labelClasses = "text-sm text-zinc-600 dark:text-zinc-400";

    // If user is not admin, show restricted access message
    if (!isWorkspaceAdmin) {
        return (
            <div className="grid lg:grid-cols-2 gap-8">
                <div className={cardClasses}>
                    <div className="flex items-center gap-3 mb-4">
                        <Lock className="size-5 text-yellow-600 dark:text-yellow-500" />
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300">Project Settings</h2>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            Only workspace admins can modify project settings. Please contact a workspace admin for changes.
                        </p>
                    </div>
                </div>

                {/* Project Members - Accessible to all roles */}
                <div className="space-y-6">
                    <div className={cardClasses}>
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">
                                Project Members <span className="text-sm text-zinc-600 dark:text-zinc-400">({project.members?.length || 0})</span>
                            </h2>
                        </div>

                        {/* Member List */}
                        {project.members && project.members.length > 0 ? (
                            <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                                {project.members.map((member, index) => (
                                    <div key={index} className="flex items-center justify-between px-3 py-2 rounded dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-300" >
                                        <span> {member?.user?.email || "Unknown"} </span>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs ${
                                                member?.workspaceRole === 'ADMIN' 
                                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' 
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {member?.workspaceRole || 'MEMBER'}
                                            </span>
                                            {project.team_lead === member?.user?._id && <span className="px-2 py-0.5 rounded-xs ring ring-zinc-200 dark:ring-zinc-600 text-xs">Team Lead</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500 mt-2">No specific members assigned to this project.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Project Details */}
            <div className={cardClasses}>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">Project Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className={labelClasses}>Project Name</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} required />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className={labelClasses}>Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClasses + " h-24"} />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={labelClasses}>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClasses} >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className={labelClasses}>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClasses} >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={labelClasses}>Start Date</label>
                            <input type="date" value={formatDateSafe(formData.start_date)} onChange={(e) => setFormData({ ...formData, start_date: e.target.value ? new Date(e.target.value) : "" })} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelClasses}>End Date</label>
                            <input type="date" value={formatDateSafe(formData.end_date)} onChange={(e) => setFormData({ ...formData, end_date: e.target.value ? new Date(e.target.value) : "" })} className={inputClasses} />
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                        <label className={labelClasses}>Progress: {formData.progress}%</label>
                        <input type="range" min="0" max="100" step="5" value={formData.progress} onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })} className="w-full accent-blue-500 dark:accent-blue-400" />
                    </div>

                    {/* Save Button */}
                    <button type="submit" disabled={isSubmitting} className="ml-auto flex items-center text-sm justify-center gap-2 bg-linear-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded" >
                        <Save className="size-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>

            {/* Project Members */}
            <div className="space-y-6">
                <div className={cardClasses}>
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">
                            Project Members <span className="text-sm text-zinc-600 dark:text-zinc-400">({project.members?.length || 0})</span>
                        </h2>
                        <button type="button" onClick={() => setIsDialogOpen(true)} className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800" >
                            <Plus className="size-4 text-zinc-900 dark:text-zinc-300" />
                        </button>
                        <AddProjectMember 
                            isDialogOpen={isDialogOpen} 
                            setIsDialogOpen={setIsDialogOpen}
                            projectId={project._id}
                            projectName={project.name}
                            currentMembers={project.members?.map((m) => m.user?.email).filter(Boolean) || []}
                        />
                    </div>

                    {/* Member List */}
                    {project.members && project.members.length > 0 ? (
                        <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                            {project.members.map((member, index) => (
                                <div key={index} className="flex items-center justify-between px-3 py-2 rounded dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-300" >
                                    <span> {member?.user?.email || "Unknown"} </span>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs ${
                                            member?.workspaceRole === 'ADMIN' 
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' 
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {member?.workspaceRole || 'MEMBER'}
                                        </span>
                                        {project.team_lead === member?.user?._id && <span className="px-2 py-0.5 rounded-xs ring ring-zinc-200 dark:ring-zinc-600 text-xs">Team Lead</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 mt-2">No specific members assigned to this project.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
