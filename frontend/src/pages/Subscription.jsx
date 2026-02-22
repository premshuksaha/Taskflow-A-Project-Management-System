import React, { useEffect, useState } from "react";
import { Check, Zap, Rocket, Star, Loader2Icon } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuthData } from "../features/workspaceSlice";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const Subscription = () => {
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const isAdmin = currentWorkspace?.role === 'ADMIN';
    const currentPlanSlug = currentWorkspace?.plan?.slug || "FREE";

    // Redirect members to dashboard
    useEffect(() => {
        if (currentWorkspace && !isAdmin) {
            toast.error('Only workspace admins can access subscription settings');
            navigate('/');
        }
    }, [currentWorkspace, isAdmin, navigate]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.SUBSCRIPTION.PLANS);
                setPlans(response.data);
            } catch (error) {
                console.error("Error fetching plans:", error);
                toast.error("Failed to load subscription plans.");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handlePlanChange = async (planSlug) => {
        if (planSlug === currentPlanSlug) return;
        
        setSubmitting(true);
        const toastId = toast.loading('Processing subscription...');

        try {
            await axiosInstance.post(API_PATHS.SUBSCRIPTION.UPGRADE, {
                workspaceId: currentWorkspace._id,
                planSlug: planSlug
            });

            // Re-fetch profile to sync all data
            const profileResponse = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
            dispatch(setAuthData(profileResponse.data));

            toast.success(`Successfully switched to ${planSlug} plan!`, { id: toastId });
        } catch (error) {
            console.error("Error updating subscription:", error);
            toast.error(error.response?.data?.message || 'Error updating subscription.', { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
                <Loader2Icon className="size-8 animate-spin text-blue-600" />
                <p className="text-zinc-500 font-medium">Loading subscription plans...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                        Choose Your Plan
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Scale your team and workflow with features designed for high-performance productivity.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                    {plans.map((plan) => {
                        const isCurrentPlan = currentPlanSlug === plan.slug;
                        const isPro = plan.slug === "PRO";

                        return (
                            <div 
                                key={plan._id} 
                                className={`relative bg-white dark:bg-zinc-900/50 rounded-3xl shadow-xl border-2 p-10 flex flex-col transition-all duration-300 transform hover:-translate-y-1 ${
                                    isPro ? 'border-blue-500 shadow-blue-500/10' : 'border-zinc-200 dark:border-zinc-800'
                                }`}
                            >
                                {isPro && (
                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                                        Best Value
                                    </span>
                                )}
                                
                                <div className="mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${isPro ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-zinc-50 dark:bg-zinc-800'}`}>
                                        {isPro ? <Zap className="w-8 h-8 text-blue-600" /> : <Star className="w-8 h-8 text-zinc-400" />}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">₹ {plan.price}</span>
                                        <span className="text-zinc-500 dark:text-zinc-500 font-medium">/month</span>
                                    </div>
                                    <p className="mt-4 text-zinc-600 dark:text-zinc-400 font-medium line-clamp-2">
                                        {isPro ? "Full access to all advanced analytics and unlimited capacity." : "Individual tools to manage your personal workspace efficiently."}
                                    </p>
                                </div>

                                <ul className="space-y-2 mb-10 grow">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="mt-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full p-1">
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            </div>
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 capitalize">{feature.toLowerCase().replace('_', ' ')}</span>
                                        </li>
                                    ))}
                                    <li className="flex items-start gap-3">
                                       <div className="mt-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full p-1">
                                           <Check className="w-3.5 h-3.5 text-emerald-600" />
                                       </div>
                                       <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            {plan.maxProjects === 0 ? "Unlimited" : plan.maxProjects} Projects
                                       </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                       <div className="mt-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full p-1">
                                           <Check className="w-3.5 h-3.5 text-emerald-600" />
                                       </div>
                                       <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            {plan.maxTasks === 0 ? "Unlimited" : plan.maxTasks} Tasks
                                       </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                       <div className="mt-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full p-1">
                                           <Check className="w-3.5 h-3.5 text-emerald-600" />
                                       </div>
                                       <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            {plan.maxMembers === 0 ? "Unlimited" : plan.maxMembers} Members
                                       </span>
                                    </li>
                                </ul>

                                <button 
                                    onClick={() => handlePlanChange(plan.slug)}
                                    disabled={isCurrentPlan || submitting}
                                    className={`w-full py-4 rounded-2xl font-bold transition-all text-sm uppercase tracking-widest ${
                                        isCurrentPlan 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 cursor-default border-2 border-emerald-500/20' 
                                        : isPro
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200'
                                    }`}
                                >
                                    {isCurrentPlan ? "Active Now" : `Switch to ${plan.name}`}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Subscription;
     
