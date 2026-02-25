import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { setAuthData } from "../features/workspaceSlice";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const AcceptInvite = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [inviteDetails, setInviteDetails] = useState(null);
    const [hasAccount, setHasAccount] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        confirmPassword: ""
    });
    const [acceptedSuccess, setAcceptedSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Fetch invite details on mount
    useEffect(() => {
        fetchInviteDetails();
    }, [token]);

    const fetchInviteDetails = async () => {
        try {
            setLoadingDetails(true);
            const response = await axiosInstance.get(API_PATHS.WORKSPACE.INVITE.GET_DETAILS(token));
            setInviteDetails(response.data);
            setFormData(prev => ({
                ...prev,
                email: response.data.email
            }));
        } catch (error) {
            console.error("Error fetching invite details:", error);
            toast.error(error.response?.data?.message || "Failed to load invitation");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleAcceptInvite = async (e) => {
        e.preventDefault();
        
        if (!hasAccount && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!hasAccount && formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                token,
                email: formData.email,
                ...(hasAccount ? {} : { password: formData.password, name: formData.name })
            };

            const response = await axiosInstance.post(API_PATHS.WORKSPACE.INVITE.ACCEPT, payload);

            // If new user, save the token
            if (!hasAccount && response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            setAcceptedSuccess(true);
            toast.success("Invitation accepted! Redirecting...");

            setTimeout(() => {
                // Fetch profile to sync all data
                axiosInstance.get(API_PATHS.AUTH.PROFILE)
                    .then(profileResponse => {
                        dispatch(setAuthData(profileResponse.data));
                        navigate('/');
                    })
                    .catch(() => navigate('/'));
            }, 2000);
        } catch (error) {
            console.error("Error accepting invite:", error);
            toast.error(error.response?.data?.message || "Failed to accept invitation");
        } finally {
            setLoading(false);
        }
    };

    if (loadingDetails) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="size-8 text-blue-600 animate-spin" />
                    <p className="text-zinc-600 dark:text-zinc-400">Loading invitation...</p>
                </div>
            </div>
        );
    }

    if (!inviteDetails) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl p-8 text-center">
                        <XCircle className="size-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Invalid Invitation</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                            This invitation is not valid, has expired, or has already been used.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (acceptedSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl p-8 text-center">
                        <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Welcome to {inviteDetails.workspace}!</h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            You've been successfully added as a{" "}
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{inviteDetails.role}</span>.
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">Redirecting...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                            Join {inviteDetails.workspace}
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Invited by <span className="font-semibold text-zinc-900 dark:text-white">{inviteDetails.invitedBy}</span>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAcceptInvite} className="space-y-4">
                        {/* Email (Read-only) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 text-sm"
                            />
                            <p className="text-xs text-zinc-500 dark:text-zinc-500">This is the email the invitation was sent to</p>
                        </div>

                        {/* Account Section */}
                        <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={hasAccount}
                                        onChange={() => setHasAccount(true)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        I already have an account
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!hasAccount}
                                        onChange={() => setHasAccount(false)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Create a new account
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* New Account Fields */}
                        {!hasAccount && (
                            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        required={!hasAccount}
                                        className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="At least 6 characters"
                                            required={!hasAccount}
                                            className="w-full pr-10 px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <FaRegEyeSlash className="h-4 w-4" /> : <FaRegEye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="Confirm your password"
                                            required={!hasAccount}
                                            className="w-full pr-10 px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <FaRegEyeSlash className="h-4 w-4" /> : <FaRegEye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Role Badge */}
                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Your Role</span>
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                {inviteDetails.role}
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !formData.email || (!hasAccount && (!formData.name || !formData.password || !formData.confirmPassword))}
                            className="w-full py-2.5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Accepting Invitation...
                                </>
                            ) : (
                                "Accept Invitation"
                            )}
                        </button>

                        {/* Expiration Info */}
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center pt-2">
                            This invitation expires on {new Date(inviteDetails.expiresAt).toLocaleDateString()}
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AcceptInvite;
