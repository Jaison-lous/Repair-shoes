"use client";

import { useState } from "react";
import { X, Lock, Store as StoreIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { StoreService } from "@/lib/store-service";
import { cn } from "@/lib/utils";

interface NewStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function NewStoreModal({ isOpen, onClose, onSuccess }: NewStoreModalProps) {
    const [step, setStep] = useState<'admin' | 'create'>('admin');
    const [adminPassword, setAdminPassword] = useState('');
    const [storeName, setStoreName] = useState('');
    const [storePassword, setStorePassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdminVerify = () => {
        if (StoreService.verifyAdminPassword(adminPassword)) {
            setStep('create');
            setError('');
            setAdminPassword('');
        } else {
            setError('Invalid admin password');
        }
    };

    const handleCreateStore = async () => {
        setError('');

        // Validation
        if (!storeName.trim()) {
            setError('Store name is required');
            return;
        }

        if (storeName.length < 3) {
            setError('Store name must be at least 3 characters');
            return;
        }

        if (!storePassword) {
            setError('Password is required');
            return;
        }

        if (storePassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (storePassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const store = await StoreService.createStore(storeName, storePassword);

            if (store) {
                // Success!
                setStoreName('');
                setStorePassword('');
                setConfirmPassword('');
                setStep('admin');
                onSuccess();
                onClose();
            } else {
                setError('Failed to create store. Name may already exist.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('admin');
        setAdminPassword('');
        setStoreName('');
        setStorePassword('');
        setConfirmPassword('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <StoreIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            {step === 'admin' ? 'Admin Verification' : 'Create New Store'}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Admin Password Step */}
                {step === 'admin' && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                            Enter admin password to create a new store
                        </p>

                        <div className="space-y-2">
                            <label htmlFor="admin-verify-password" className="text-sm font-medium text-slate-300">Admin Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    id="admin-verify-password"
                                    name="admin_password"
                                    autoComplete="current-password"
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => {
                                        setAdminPassword(e.target.value);
                                        setError('');
                                    }}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAdminVerify()}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                    placeholder="Enter admin password"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            onClick={handleAdminVerify}
                            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-lg transition-all"
                        >
                            Verify
                        </button>
                    </div>
                )}

                {/* Create Store Step */}
                {step === 'create' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4">
                            <CheckCircle2 size={16} />
                            <span>Admin verified! Create your store below</span>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="new-store-name" className="text-sm font-medium text-slate-300">Store Name *</label>
                            <input
                                id="new-store-name"
                                name="store_name"
                                autoComplete="off"
                                type="text"
                                value={storeName}
                                onChange={(e) => {
                                    setStoreName(e.target.value);
                                    setError('');
                                }}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                placeholder="Downtown Branch"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="new-store-password" className="text-sm font-medium text-slate-300">Store Password *</label>
                            <input
                                id="new-store-password"
                                name="new_password"
                                autoComplete="new-password"
                                type="password"
                                value={storePassword}
                                onChange={(e) => {
                                    setStorePassword(e.target.value);
                                    setError('');
                                }}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                placeholder="Minimum 6 characters"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirm-store-password" className="text-sm font-medium text-slate-300">Confirm Password *</label>
                            <input
                                id="confirm-store-password"
                                name="confirm_password"
                                autoComplete="new-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError('');
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateStore()}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                placeholder="Re-enter password"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setStep('admin');
                                    setStoreName('');
                                    setStorePassword('');
                                    setConfirmPassword('');
                                    setError('');
                                }}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-all border border-white/10"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCreateStore}
                                disabled={loading}
                                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Store'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
