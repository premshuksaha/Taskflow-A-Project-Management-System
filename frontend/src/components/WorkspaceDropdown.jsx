import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";

function WorkspaceDropdown() {

    const { workspaces } = useSelector((state) => state.workspace);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSelectWorkspace = (organizationId) => {
        dispatch(setCurrentWorkspace(organizationId))
        setIsOpen(false);
        navigate('/')
    }

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative m-4" ref={dropdownRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex items-center justify-between p-3 h-auto text-left rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold shadow">
                        {currentWorkspace?.name?.[0].toUpperCase() || "W"}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                            {currentWorkspace?.name || "Select Workspace"}
                        </p>
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400 shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg top-full left-0">
                    <div className="p-2">
                        <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
                            Workspaces
                        </p>
                        {workspaces.map((ws) => (
                            <div key={ws._id} onClick={() => onSelectWorkspace(ws._id)} className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                                <div className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                    {ws.name?.[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                            {ws.name}
                                        </p>
                                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                                            ws.role === 'ADMIN' 
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                                            : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400'
                                        }`}>
                                            {ws.role || 'MEMBER'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                        {ws.membersCount ?? 0} {ws.membersCount === 1 ? 'member' : 'members'}
                                    </p>
                                </div>
                                {currentWorkspace?._id === ws._id && (
                                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorkspaceDropdown;
