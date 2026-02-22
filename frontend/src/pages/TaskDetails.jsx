import { format, isValid } from "date-fns";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon } from "lucide-react";
import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosInstance";
import { setAuthData } from "../features/workspaceSlice";

const TaskDetails = () => {

    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        status: "",
        type: "",
        priority: "",
        assigneeId: "",
        due_date: "",
    });

    const { currentWorkspace, currentUser } = useSelector((state) => state.workspace);

    const handleUpdateTask = async () => {
        try {
            toast.loading("Updating task...");
            await axiosInstance.put(API_PATHS.TASK.UPDATE(taskId), editFormData);
            
            // Re-fetch profile to sync state
            const profileResponse = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
            dispatch(setAuthData(profileResponse.data));

            toast.dismiss();
            toast.success("Task updated successfully!");
            setIsEditing(false);
            fetchTaskDetails(); // Re-load local state
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || "Failed to update task");
            console.error(error);
        }
    };

    const fetchComments = async () => {
        if (!taskId) return;

        try {
            const response = await axiosInstance.get(API_PATHS.COMMENT.GET_BY_TASK(taskId));
            setComments(response.data || []);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const fetchTaskDetails = async () => {
        if (!projectId || !taskId) return;
        setLoading(true);

        try {
            // Priority 1: Check currentWorkspace projects
            if (currentWorkspace?.projects) {
                const proj = currentWorkspace.projects.find((p) => p._id === projectId);
                if (proj) {
                    const tsk = proj.tasks?.find((t) => t._id === taskId);
                    if (tsk) {
                        setTask(tsk);
                        setProject(proj);
                        setEditFormData({
                            title: tsk.title || "",
                            description: tsk.description || "",
                            status: tsk.status || "TODO",
                            type: tsk.type || "TASK",
                            priority: tsk.priority || "MEDIUM",
                            assigneeId: tsk.assigneeId?._id || tsk.assigneeId || "",
                            due_date: tsk.due_date ? new Date(tsk.due_date).toISOString().split('T')[0] : "",
                        });
                        setLoading(false);
                        return;
                    }
                }
            }

            // Priority 2: Fallback to direct API fetch
            const response = await axiosInstance.get(API_PATHS.TASK.GET_BY_PROJECT(projectId));
            const projectTasks = response.data;
            const tsk = projectTasks.find((t) => t._id === taskId);
            
            if (tsk) {
                setTask(tsk);
                const projInState = currentWorkspace?.projects?.find(p => p._id === projectId);
                if (projInState) {
                    setProject(projInState);
                }
                setEditFormData({
                    title: tsk.title || "",
                    description: tsk.description || "",
                    status: tsk.status || "TODO",
                    type: tsk.type || "TASK",
                    priority: tsk.priority || "MEDIUM",
                    assigneeId: tsk.assigneeId?._id || tsk.assigneeId || "",
                    due_date: tsk.due_date ? new Date(tsk.due_date).toISOString().split('T')[0] : "",
                });
            }
        } catch (error) {
            console.error("TaskDetails fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const response = await axiosInstance.post(API_PATHS.COMMENT.CREATE, {
                taskId,
                content: newComment.trim()
            });

            setComments((prev) => [...prev, response.data]);
            setNewComment("");
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchTaskDetails(); }, [taskId, projectId, currentWorkspace?._id]);

    useEffect(() => {
        if (taskId && task) {
            fetchComments();
            const interval = setInterval(() => { fetchComments(); }, 10000);
            return () => clearInterval(interval);
        }
    }, [taskId, task]);

    if(loading && !task) return <div className="text-gray-500 dark:text-zinc-400 px-4 py-6">Loading task details...</div>;
    if (!task) return <div className="text-red-500 px-4 py-6 text-center mt-20">Task not found.</div>;

    const formatDateSafe = (dateStr, pattern = "dd MMM yyyy") => {
        if (!dateStr) return "Not set";
        const date = new Date(dateStr);
        return isValid(date) ? format(date, pattern) : "Invalid date";
    };

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 sm:p-4 text-gray-900 dark:text-zinc-100 max-w-6xl mx-auto">
            {/* Left: Comments / Chatbox */}
            <div className="w-full lg:w-2/3">
                <div className="p-5 rounded-md  border border-gray-300 dark:border-zinc-800  flex flex-col lg:h-[80vh]">
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                        <MessageCircle className="size-5" /> Task Discussion ({comments.length})
                    </h2>

                    <div className="flex-1 md:overflow-y-scroll no-scrollbar">
                        {comments.length > 0 ? (
                            <div className="flex flex-col gap-4 mb-6 mr-2">
                                {comments.map((comment) => (
                                    <div key={comment._id} className={`sm:max-w-4/5 dark:bg-linear-to-br dark:from-zinc-800 dark:to-zinc-900 border border-gray-300 dark:border-zinc-700 p-3 rounded-md ${comment.userId?._id === currentUser?._id ? "ml-auto" : "mr-auto"}`} >
                                        <div className="flex items-center gap-2 mb-1 text-sm text-gray-500 dark:text-zinc-400">
                                            {comment.userId?.image && <img src={comment.userId.image} alt="avatar" className="size-5 rounded-full" />}
                                            <span className="font-medium text-gray-900 dark:text-white">{comment.userId?.name || 'Unknown'}</span>
                                            <span className="text-xs text-gray-400 dark:text-zinc-600">
                                                • {formatDateSafe(comment.createdAt, "dd MMM yyyy, HH:mm")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 dark:text-zinc-200">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-zinc-500 mb-4 text-sm">No comments yet. Be the first!</p>
                        )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                            rows={3}
                        />
                        <button onClick={handleAddComment} className="bg-linear-to-l from-blue-500 to-blue-600 transition-colors text-white text-sm px-5 py-2 rounded " >
                            Post
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Task + Project Info */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6 ">
                <div className="flex justify-end -mb-4">
                    {currentWorkspace?.role === "ADMIN" && (
                        <button onClick={() => setIsEditing(!isEditing)} className="text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1 rounded" >
                            {isEditing ? "Cancel Edit" : "Edit Task"}
                        </button>
                    )}
                </div>
                {/* Task Info */}
                <div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 ">
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500">Title</label>
                                <input type="text" value={editFormData.title} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} className="w-full mt-1 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 rounded outline-none text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500">Description</label>
                                <textarea rows={2} value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} className="w-full mt-1 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 rounded outline-none text-sm resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-zinc-500">Status</label>
                                    <select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full mt-1 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 rounded outline-none text-sm" >
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="DONE">Done</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">Priority</label>
                                    <select value={editFormData.priority} onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })} className="w-full mt-1 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 rounded outline-none text-sm" >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-zinc-500">Assignee</label>
                                    <select value={editFormData.assigneeId} onChange={(e) => setEditFormData({ ...editFormData, assigneeId: e.target.value })} className="w-full mt-1 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 rounded outline-none text-sm" >
                                        <option value="">Unassigned</option>
                                        {project?.members?.map((m) => (
                                            <option key={m.user?._id || m._id} value={m.user?._id || m.userId?._id}>{m.user?.name || m.userId?.name || 'Unknown'}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">Due Date</label>
                                    <input type="date" value={editFormData.due_date} onChange={(e) => setEditFormData({ ...editFormData, due_date: e.target.value })} className="w-full mt-1 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 rounded outline-none text-sm" />
                                </div>
                            </div>
                            <button onClick={handleUpdateTask} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition-colors mt-2" >
                                Update Task Details
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-3">
                                <h1 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{task.title}</h1>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-300 text-xs text-uppercase">
                                        {task.status}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-300 text-xs">
                                        {task.type}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-green-200 dark:bg-emerald-900 text-green-900 dark:text-emerald-300 text-xs">
                                        {task.priority}
                                    </span>
                                </div>
                            </div>

                            {task.description && (
                                <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">{task.description}</p>
                            )}

                            <hr className="border-zinc-200 dark:border-zinc-700 my-3" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-zinc-300">
                                <div className="flex items-center gap-2">
                                    {task.assigneeId?.image && <img src={task.assigneeId.image} className="size-5 rounded-full" alt="avatar" />}
                                    {task.assigneeId?.name || "Unassigned"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="size-4 text-gray-500 dark:text-zinc-500" />
                                    Due : {formatDateSafe(task.due_date)}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Project Info */}
                {project && (
                    <div className="p-4 rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-800 ">
                        <p className="text-xl font-medium mb-4">{project.name}</p>
                        <h2 className="text-gray-900 dark:text-zinc-100 flex items-center gap-2">{project.description}</h2>
                        <p className="text-xs mt-3">Project Start Date: {formatDateSafe(project.start_date)}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-3">
                            <span>Status: {project.status}</span>
                            <span>Priority: {project.priority}</span>
                            <span>Progress: {project.progress || 0}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetails;
