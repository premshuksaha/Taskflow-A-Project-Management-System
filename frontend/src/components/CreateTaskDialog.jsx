import { useState } from "react";
import { Calendar as CalendarIcon, Loader2Icon, LockIcon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosInstance";
import { setAuthData } from "../features/workspaceSlice";
import toast from "react-hot-toast";

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {
    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const project = currentWorkspace?.projects?.find((p) => p._id === projectId);
    
    // Calculate total tasks across all projects in workspace
    const totalTasks = currentWorkspace?.projects?.reduce((acc, p) => acc + (p.tasks?.length || 0), 0) || 0;
    const maxTasks = currentWorkspace?.plan?.maxTasks || 0;
    const isPlanExceeded = maxTasks !== 0 && totalTasks >= maxTasks;

    const teamMembers = currentWorkspace?.members || []; // Use workspace members for now if project members aren't explicitly tracked
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "TASK",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        due_date: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            toast.error("Task title is required");
            return;
        }

        setLoading(true);

        try {
            const taskData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                type: formData.type,
                status: formData.status,
                priority: formData.priority,
                projectId,
                workspaceId: currentWorkspace._id,
                // Only send if not empty
                ...(formData.assigneeId && { assigneeId: formData.assigneeId }),
                ...(formData.due_date && { due_date: formData.due_date })
            };

            await axiosInstance.post(API_PATHS.TASK.CREATE, taskData);

            // Re-fetch profile to sync all data
            const profileResponse = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
            dispatch(setAuthData(profileResponse.data));

            toast.success("Task created successfully!");
            setShowCreateTask(false);
            setFormData({
                title: "",
                description: "",
                type: "TASK",
                status: "TODO",
                priority: "MEDIUM",
                assigneeId: "",
                due_date: "",
            });
        } catch (error) {
            console.error("Error creating task:", error);
            toast.error(error.response?.data?.message || "Failed to create task");
        } finally {
            setLoading(false);
        }
    };

    return showCreateTask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-xl w-full max-w-md p-6 text-zinc-900 dark:text-white relative">
                <button className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" onClick={() => setShowCreateTask(false)} >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-xl font-bold mb-4">Create New Task</h2>

                {isPlanExceeded ? (
                    <div className="space-y-6 py-4 text-center">
                        <div className="bg-blue-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-blue-100 dark:border-zinc-800">
                            <LockIcon className="size-10 text-blue-500 mx-auto mb-3" />
                            <h3 className="font-bold text-zinc-900 dark:text-white mb-2">Task Limit Reached</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                You've reached the 10-task limit for the FREE plan. Upgrade to the PRO plan for unlimited tasks, projects, and advanced features.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Link 
                                to="/subscription" 
                                onClick={() => setShowCreateTask(false)}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-sm text-center"
                            >
                                Upgrade to PRO
                            </Link>
                            <button 
                                onClick={() => setShowCreateTask(false)}
                                className="w-full py-2.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                    <div className="space-y-1">
                        <label htmlFor="title" className="text-sm font-medium">Title</label>
                        <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Task title" className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label htmlFor="description" className="text-sm font-medium">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the task" className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* Type & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Type</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1" >
                                <option value="BUG">Bug</option>
                                <option value="FEATURE">Feature</option>
                                <option value="TASK">Task</option>
                                <option value="IMPROVEMENT">Improvement</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1"                             >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Assignee and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Assignee</label>
                            <select value={formData.assigneeId} onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })} className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1" >
                                <option value="">Unassigned</option>
                                {teamMembers.map((member) => (
                                    <option key={member?.user?._id} value={member?.user?._id}>
                                        {member?.user?.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1" >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Due Date</label>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
                            <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1" />
                        </div>
                        {formData.due_date && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {format(new Date(formData.due_date), "PPP")}
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowCreateTask(false)} className="rounded border border-zinc-300 dark:border-zinc-700 px-5 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition" >
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="rounded px-5 py-2 text-sm bg-linear-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white dark:text-zinc-200 transition flex items-center gap-2" >
                            {loading ? <Loader2Icon className="size-4 animate-spin" /> : "Create Task"}
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    ) : null;
}
