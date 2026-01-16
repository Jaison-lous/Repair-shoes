"use client";

import { Order, OrderStatus } from "@/lib/types";
import { cn, POINTS_TO_CURRENCY } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, Clock, User, Phone, CheckCircle2 } from "lucide-react";

interface OrderListViewProps {
    orders: Order[];
    onOrderMove?: (orderId: string, newStatus: OrderStatus) => void;
    onCardClick?: (order: Order) => void;
    readOnly?: boolean;
}

const STATUS_OPTIONS: { id: OrderStatus; label: string; color: string }[] = [
    { id: 'submitted', label: 'Submitted', color: 'bg-slate-500/20 text-slate-300 border-slate-500/50' },
    { id: 'shipped', label: 'Shipped', color: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
    { id: 'received', label: 'Received', color: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
    { id: 'in_store', label: 'In Store', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' },
    { id: 'completed', label: 'Completed', color: 'bg-green-500/20 text-green-300 border-green-500/50' },
    { id: 'reshipped', label: 'Reshipped', color: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
];

export function OrderListView({ orders, onOrderMove, onCardClick, readOnly }: OrderListViewProps) {
    // Filter out completed orders (consistent with KanbanBoard default view, unless we want to show them)
    // The user asked for a list view to manage statuses, usually active ones.
    const activeOrders = orders.filter(o => !o.is_completed);

    if (activeOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-3">
                <CheckCircle2 size={48} className="opacity-20" />
                <p>No active orders found</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-20">
            {activeOrders.map((order) => (
                <div 
                    key={order.id} 
                    className="bg-white/5 border border-white/10 rounded-xl p-4 active:scale-[0.99] transition-all"
                >
                    {/* Header: ID and Date */}
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-xs text-slate-500">#{order.serial_number || '---'}</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock size={10} />
                            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                        </span>
                    </div>

                    {/* Main Content: Clickable */}
                    <div 
                        onClick={() => onCardClick?.(order)}
                        className="cursor-pointer mb-4"
                    >
                        <h3 className="font-bold text-slate-200 text-lg mb-1">{order.shoe_model}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-400 mb-1">
                            <div className="flex items-center gap-1">
                                <User size={12} />
                                <span>{order.customer_name}</span>
                            </div>
                        </div>
                        <div className="text-cyan-400 font-mono font-bold">
                            {POINTS_TO_CURRENCY(order.total_price)}
                        </div>
                    </div>

                    {/* Actions: Status Dropdown */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                        <label className="text-xs text-slate-500 font-medium">Status:</label>
                        {!readOnly && onOrderMove ? (
                            <select
                                value={order.status}
                                onChange={(e) => onOrderMove(order.id, e.target.value as OrderStatus)}
                                className={cn(
                                    "flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50 appearance-none",
                                    // Dynamic color for text based on status
                                    STATUS_OPTIONS.find(s => s.id === order.status)?.color || "text-slate-300"
                                )}
                            >
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status.id} value={status.id} className="bg-slate-900 text-slate-300">
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span 
                                className={cn(
                                    "px-3 py-1 text-xs rounded-full border",
                                    STATUS_OPTIONS.find(s => s.id === order.status)?.color
                                )}
                            >
                                {STATUS_OPTIONS.find(s => s.id === order.status)?.label || order.status}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
