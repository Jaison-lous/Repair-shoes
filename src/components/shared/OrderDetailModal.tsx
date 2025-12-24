import { Order } from "@/lib/types";
import { cn, POINTS_TO_CURRENCY, openWhatsApp } from "@/lib/utils";
import { X, User, Phone, Calendar, Tag, MessageCircle, Hash, DollarSign } from "lucide-react";
import { useState } from "react";

interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
    userRole?: 'store' | 'hub';
    allowPriceEdit?: boolean;
    onPriceUpdate?: (orderId: string, newPrice: number) => void;
    onExpenseUpdate?: (orderId: string, newExpense: number) => void;
}

export function OrderDetailModal({ order, onClose, userRole = 'store', allowPriceEdit, onPriceUpdate, onExpenseUpdate }: OrderDetailModalProps) {
    const [editedStorePrice, setEditedStorePrice] = useState<string>("");
    const [editedHubPrice, setEditedHubPrice] = useState<string>("");
    const [editedExpense, setEditedExpense] = useState<string>("");
    const [isEditingStore, setIsEditingStore] = useState(false);
    const [isEditingHub, setIsEditingHub] = useState(false);
    const [isEditingExpense, setIsEditingExpense] = useState(false);

    // Optimistic UI state - use this for display to make updates instant
    const [optimisticOrder, setOptimisticOrder] = useState<Order>(order);

    // Update optimistic state when order prop changes
    useState(() => {
        setOptimisticOrder(order);
    });

    const profit = (optimisticOrder.total_price || 0) - (optimisticOrder.hub_price || 0) - (optimisticOrder.expense || 0);
    const balanceDue = (optimisticOrder.total_price || 0) - (optimisticOrder.advance_amount || 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-white">{order.shoe_model}</h3>
                        <p className="text-sm text-slate-400 mt-1">Order Details</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Customer Information */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Customer Information</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/20 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase mb-1">
                                <User size={12} />
                                <span>Customer Name</span>
                            </div>
                            <p className="text-sm text-white font-medium">{order.customer_name}</p>
                        </div>
                        <div className="bg-black/20 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase mb-1">
                                <Phone size={12} />
                                <span>WhatsApp</span>
                            </div>
                            <p className="text-sm text-white font-mono">{order.whatsapp_number}</p>
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Order Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {order.serial_number && (
                            <div className="bg-black/20 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-xs text-slate-500 uppercase mb-1">
                                    <Hash size={12} />
                                    <span>Serial Number</span>
                                </div>
                                <p className="text-sm text-cyan-400 font-mono">{order.serial_number}</p>
                            </div>
                        )}
                        <div className="bg-black/20 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase mb-1">
                                <Calendar size={12} />
                                <span>Expected Return</span>
                            </div>
                            <p className="text-sm text-white">{new Date(order.expected_return_date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-black/20 p-3 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase mb-1">Status</p>
                        <p className="text-sm text-cyan-400 capitalize font-medium">{order.status.replace('_', ' ')}</p>
                    </div>

                    {/* Services/Complaints */}
                    <div className="bg-black/20 p-3 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase mb-2">Services Requested</p>
                        <div className="flex flex-wrap gap-2">
                            {order.complaints && order.complaints.length > 0 ? (
                                order.complaints.map(c => (
                                    <span key={c.id} className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                                        <Tag size={10} />
                                        {c.description}
                                    </span>
                                ))
                            ) : null}
                            {order.custom_complaint && (
                                <span className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1 italic">
                                    <MessageCircle size={10} />
                                    {order.custom_complaint}
                                </span>
                            )}
                            {(!order.complaints || order.complaints.length === 0) && !order.custom_complaint && (
                                <span className="text-xs text-slate-600 italic">No specific services listed</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pricing Information */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Pricing</h4>

                    {/* Store Price - Only in Store View */}
                    {userRole === 'store' && (
                        <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg">
                            <p className="text-xs text-cyan-300 uppercase font-semibold mb-2">Store Price (Customer)</p>
                            {allowPriceEdit && onPriceUpdate ? (
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        value={editedStorePrice || optimisticOrder.total_price || ""}
                                        onChange={(e) => {
                                            setEditedStorePrice(e.target.value);
                                            setIsEditingStore(true);
                                        }}
                                        onFocus={() => {
                                            setEditedStorePrice(optimisticOrder.total_price.toString());
                                            setIsEditingStore(false);
                                        }}
                                        className="w-full bg-black/30 border border-cyan-500/30 rounded-lg px-3 py-2 text-xl font-mono text-white font-bold focus:outline-none focus:border-cyan-500/70"
                                        placeholder="0"
                                    />
                                    {isEditingStore && (
                                        <button
                                            onClick={() => {
                                                const val = parseFloat(editedStorePrice);
                                                if (!isNaN(val) && val !== optimisticOrder.total_price) {
                                                    // Optimistic update - update UI immediately
                                                    setOptimisticOrder({ ...optimisticOrder, total_price: val });
                                                    // Then update database in background
                                                    onPriceUpdate(order.id, val);
                                                }
                                                setIsEditingStore(false);
                                                setEditedStorePrice("");
                                            }}
                                            className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-all"
                                        >
                                            Save Store Price
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-2xl font-mono text-white font-bold">
                                    {optimisticOrder.is_price_unknown ? "TBD" : POINTS_TO_CURRENCY(optimisticOrder.total_price)}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Expense - Only in Store View */}
                    {userRole === 'store' && (
                        <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg">
                            <p className="text-xs text-orange-300 uppercase font-semibold mb-2">Expense</p>
                            {allowPriceEdit && onExpenseUpdate ? (
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        value={editedExpense || optimisticOrder.expense || ""}
                                        onChange={(e) => {
                                            setEditedExpense(e.target.value);
                                            setIsEditingExpense(true);
                                        }}
                                        onFocus={() => {
                                            setEditedExpense((optimisticOrder.expense || 0).toString());
                                            setIsEditingExpense(false);
                                        }}
                                        className="w-full bg-black/30 border border-orange-500/30 rounded-lg px-3 py-2 text-xl font-mono text-white font-bold focus:outline-none focus:border-orange-500/70"
                                        placeholder="0"
                                    />
                                    {isEditingExpense && (
                                        <button
                                            onClick={() => {
                                                const val = parseFloat(editedExpense);
                                                if (!isNaN(val) && val !== (optimisticOrder.expense || 0)) {
                                                    // Optimistic update - update UI immediately
                                                    setOptimisticOrder({ ...optimisticOrder, expense: val });
                                                    // Then update database in background
                                                    onExpenseUpdate(order.id, val);
                                                }
                                                setIsEditingExpense(false);
                                                setEditedExpense("");
                                            }}
                                            className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition-all"
                                        >
                                            Save Expense
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-2xl font-mono text-white font-bold">
                                    {POINTS_TO_CURRENCY(optimisticOrder.expense || 0)}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Hub Price */}
                    <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
                        <p className="text-xs text-purple-300 uppercase font-semibold mb-2">Hub Price</p>
                        {allowPriceEdit && onPriceUpdate && userRole === 'hub' ? (
                            <div className="space-y-2">
                                <input
                                    type="number"
                                    value={editedHubPrice || optimisticOrder.hub_price || ""}
                                    onChange={(e) => {
                                        setEditedHubPrice(e.target.value);
                                        setIsEditingHub(true);
                                    }}
                                    onFocus={() => {
                                        setEditedHubPrice((optimisticOrder.hub_price || 0).toString());
                                        setIsEditingHub(false);
                                    }}
                                    className="w-full bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2 text-xl font-mono text-white font-bold focus:outline-none focus:border-purple-500/70"
                                    placeholder="0"
                                />
                                {isEditingHub && (
                                    <button
                                        onClick={() => {
                                            const val = parseFloat(editedHubPrice);
                                            if (!isNaN(val) && val !== (optimisticOrder.hub_price || 0)) {
                                                // Optimistic update - update UI immediately
                                                setOptimisticOrder({ ...optimisticOrder, hub_price: val });
                                                // Then update database in background
                                                onPriceUpdate(order.id, val);
                                            }
                                            setIsEditingHub(false);
                                            setEditedHubPrice("");
                                        }}
                                        className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all"
                                    >
                                        Save Hub Price
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="text-2xl font-mono text-white font-bold">
                                {POINTS_TO_CURRENCY(optimisticOrder.hub_price || 0)}
                            </p>
                        )}
                    </div>

                    {/* Profit Calculation - Only in Store View */}
                    {userRole === 'store' && (
                        <div className={cn(
                            "border p-4 rounded-lg",
                            profit >= 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
                        )}>
                            <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Profit</p>
                            <div className="space-y-1 text-sm mb-3">
                                <div className="flex justify-between text-slate-400">
                                    <span>Customer Price:</span>
                                    <span className="text-cyan-300 font-mono">{POINTS_TO_CURRENCY(optimisticOrder.total_price)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Hub Cost:</span>
                                    <span className="text-red-300 font-mono">- {POINTS_TO_CURRENCY(optimisticOrder.hub_price || 0)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Expenses:</span>
                                    <span className="text-orange-300 font-mono">- {POINTS_TO_CURRENCY(optimisticOrder.expense || 0)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-white/10">
                                <span className="text-white font-semibold">Net Profit:</span>
                                <span className={cn(
                                    "text-2xl font-mono font-bold",
                                    profit >= 0 ? "text-emerald-400" : "text-red-400"
                                )}>
                                    {POINTS_TO_CURRENCY(profit)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Advance Payment Information */}
                    {optimisticOrder.advance_amount && optimisticOrder.advance_amount > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                            <p className="text-xs text-blue-300 uppercase font-semibold mb-2">Advance Payment</p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">Amount Paid:</span>
                                    <span className="text-xl font-mono text-white font-bold">
                                        {POINTS_TO_CURRENCY(optimisticOrder.advance_amount)}
                                    </span>
                                </div>
                                {optimisticOrder.payment_method && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Payment Method:</span>
                                        <span className="text-sm text-blue-300 font-medium">
                                            {optimisticOrder.payment_method}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-blue-500/20">
                                    <span className="text-sm text-slate-300 font-semibold">Balance Due:</span>
                                    <span className={cn(
                                        "text-xl font-mono font-bold",
                                        balanceDue <= 0 ? "text-emerald-400" : "text-orange-400"
                                    )}>
                                        {POINTS_TO_CURRENCY(Math.max(0, balanceDue))}
                                    </span>
                                </div>
                                {balanceDue <= 0 && (
                                    <div className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 text-center">
                                        ✓ Fully Paid
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={() => openWhatsApp(order.whatsapp_number, `Hi ${order.customer_name}, regarding your ${order.shoe_model} repair...`)}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={16} />
                        WhatsApp Customer
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
