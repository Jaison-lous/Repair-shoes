"use client";

import { login } from "@/app/login/actions";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Store, Layers, Lock, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginForm() {
    const searchParams = useSearchParams();
    const redirectRole = searchParams.get("role") || "store";
    const [role, setRole] = useState(redirectRole);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError("");
        const result = await login(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 mb-2">
                        Shoe Repair Manager
                    </h1>
                    <p className="text-slate-500">Please sign in to continue</p>
                </div>

                {/* Role Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                    <button
                        onClick={() => setRole('store')}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2",
                            role === 'store' ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Store size={16} />
                        <span>Store Portal</span>
                    </button>
                    <button
                        onClick={() => setRole('hub')}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2",
                            role === 'hub' ? "bg-white shadow text-violet-600" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Layers size={16} />
                        <span>Central Hub</span>
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="role" value={role} />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="Enter access code"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className={cn(
                            "w-full py-3 rounded-xl text-white font-semibold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2",
                            role === 'store' ? "bg-blue-600 hover:bg-blue-700" : "bg-violet-600 hover:bg-violet-700"
                        )}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>
                            <span>Access Portal</span>
                            <ArrowRight size={18} />
                        </>}
                    </button>
                </form>
            </div>
        </div>
    );
}
