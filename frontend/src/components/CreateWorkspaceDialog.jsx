import { useState } from "react";
import { XIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import { addWorkspace } from "../features/workspaceSlice";

const CreateWorkspaceDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const newWorkspace = {
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            description: null,
            settings: {},
            plan: "FREE",
            ownerId: "user_1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            members: [],
            projects: [],
        };
        dispatch(addWorkspace(newWorkspace));
        setIsDialogOpen(false);
        setName("");
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg text-zinc-900 dark:text-zinc-200 relative">
                <button
                    className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    onClick={() => setIsDialogOpen(false)}
                >
                    <XIcon className="size-5" />
                </button>

                <h2 className="text-xl font-semibold mb-1">Create Workspace</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    Create a new workspace to collaborate with your team.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Workspace Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="My Workspace"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsDialogOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                        >
                            Create Workspace
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkspaceDialog;
