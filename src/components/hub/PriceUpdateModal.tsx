"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import { SupabaseService as MockService } from "@/lib/supabase-service";
import { X, Check } from "lucide-react";
import { POINTS_TO_CURRENCY } from "@/lib/utils";

interface PriceUpdateModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export function PriceUpdateModal({ order, isOpen, onClose, onUpdate }: PriceUpdateModalProps) {
    const [price, setPrice] = useState(order.total_price.toString());
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setSaving(true);
        await MockService.updateOrderPrice(order.id, parseFloat(price));
        setSaving(false);
        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md glass-panel rounded-2xl shadow-2xl overflow-hidden scale-in-95 animate-in duration-200 border border-white/10">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-100">Update Order Details</h3>
                            <p className="text-sm text-slate-400">{order.shoe_model} - {order.customer_name}</p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-200 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Order Summary */}
                        <div className="bg-white/5 p-3 rounded-lg text-sm space-y-2 border border-white/5">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Current Status</span>
                                <span className="font-medium capitalize text-slate-200">{order.status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Complaint</span>
                                <span className="font-medium text-slate-200">{order.custom_complaint || "Standard Repair"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">WhatsApp</span>
                                <span className="font-medium text-slate-200">{order.whatsapp_number}</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Total Repair Cost
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    autoFocus
                                    type="number"
                                    className="flex-1 px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 text-lg font-mono text-white placeholder-slate-600"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            {order.is_price_unknown && (
                                <p className="text-xs text-orange-400 mt-2 flex items-center">
                                    * Price was marked as unknown. Please set a final price.
                                </p>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end space-x-3">
                            <button onClick={onClose} className="px-4 py-2 text-slate-400 font-medium hover:bg-white/5 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-lg flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
                            >
                                {saving ? <span>Saving...</span> : <>
                                    <Check size={16} />
                                    <span>Update Price & Notify</span>
                                </>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
