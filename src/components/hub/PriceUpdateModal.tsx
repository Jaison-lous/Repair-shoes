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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden scale-in-95 animate-in duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Update Order Details</h3>
                            <p className="text-sm text-slate-500">{order.shoe_model} - {order.customer_name}</p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Order Summary */}
                        <div className="bg-slate-50 p-3 rounded-lg text-sm space-y-2 border border-slate-100">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Current Status</span>
                                <span className="font-medium capitalize">{order.status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Complaint</span>
                                <span className="font-medium">{order.custom_complaint || "Standard Repair"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">WhatsApp</span>
                                <span className="font-medium">{order.whatsapp_number}</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Total Repair Cost
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    autoFocus
                                    type="number"
                                    className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 text-lg font-mono"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            {order.is_price_unknown && (
                                <p className="text-xs text-orange-600 mt-2 flex items-center">
                                    * Price was marked as unknown. Please set a final price.
                                </p>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end space-x-3">
                            <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center space-x-2 shadow-lg shadow-blue-600/20"
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
