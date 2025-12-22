"use client";

import { login } from "@/app/login/actions";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Store, Layers, Lock, ArrowRight, Loader2, Plus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewStoreModal } from "@/components/login/NewStoreModal";

export function LoginForm() {
    const searchParams = useSearchParams();
    const redirectRole = searchParams.get("role") || "store";
    const [role, setRole] = useState(redirectRole);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showNewStoreModal, setShowNewStoreModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError("");
        const result = await login(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    };

    const handleStoreCreated = () => {
        setSuccessMessage("Store created successfully! You can now log in with the store password.");
        setTimeout(() => setSuccessMessage(""), 5000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative overflow-hidden">
                {/* Decorative glow behind the card */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px]" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-[80px]" />

                <div className="text-center mb-8 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1" />
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 neon-text">
                            Shoe Repair
                        </h1>
                        <div className="flex-1 flex justify-end">
                            <button
                                onClick={() => setShowNewStoreModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 transition-all text-sm font-medium"
                                type="button"
                            >
                                <Plus size={16} />
                                <span>New Store</span>
                            </button>
                        </div>
                    </div>
                    <p className="text-slate-400">Access the Management Portal</p>
                </div>

                {/* Role Switcher */}
                <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/10 backdrop-blur-md">
                    <button
                        onClick={() => setRole('store')}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2",
                            role === 'store' ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25" : "text-slate-400 hover:text-slate-200"
                        )}
                    >
                        <Store size={16} />
                        <span>Store Portal</span>
                    </button>
                    <button
                        onClick={() => setRole('hub')}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2",
                            role === 'hub' ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25" : "text-slate-400 hover:text-slate-200"
                        )}
                    >
                        <Layers size={16} />
                        <span>Central Hub</span>
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-5 relative z-10">
                    <input type="hidden" name="role" value={role} />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Access Code</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="Enter password"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                            />
                        </div>
                    </div>

                    {successMessage && (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                            <CheckCircle2 size={16} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className={cn(
                            "w-full py-3.5 rounded-xl text-white font-bold tracking-wide shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mt-4",
                            role === 'store'
                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20 border border-cyan-400/20"
                                : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 shadow-purple-500/20 border border-purple-400/20"
                        )}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>
                            <span>Authenticate</span>
                            <ArrowRight size={18} />
                        </>}
                    </button>
                </form>

                {/* New Store Modal */}
                <NewStoreModal
                    isOpen={showNewStoreModal}
                    onClose={() => setShowNewStoreModal(false)}
                    onSuccess={handleStoreCreated}
                />
            </div>
        </div>
    );
}
