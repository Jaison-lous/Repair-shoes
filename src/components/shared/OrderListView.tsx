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
    // Determine price to display based on role (default to store for now as it's used in StorePage)
    // Actually, OrderListView is currently only used in StorePage.

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
                    className="bg-white/5 border border-white/10 rounded-xl p-4 active:scale-[0.99] transition-all hover:border-cyan-500/30 group relative"
                >
                    {/* Header: SN (Large/White), Date and Status Select */}
                    <div className="flex justify-between items-start mb-3">
                        <div onClick={() => onCardClick?.(order)} className="cursor-pointer">
                            <span className="font-mono text-xl font-bold text-white/90">#{order.serial_number || '---'}</span>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Clock size={10} />
                                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                            </div>
                        </div>

                        {/* Status Select for List View Only */}
                        {!readOnly && onOrderMove && (
                            <div className="relative group/select min-w-[110px]">
                                <select
                                    value={order.status}
                                    onChange={(e) => onOrderMove(order.id, e.target.value as OrderStatus)}
                                    className={cn(
                                        "w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-cyan-500/50 appearance-none transition-colors",
                                        STATUS_OPTIONS.find(s => s.id === order.status)?.color?.replace('/20', '/40') || "text-slate-300"
                                    )}
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status.id} value={status.id} className="bg-slate-900 text-slate-300">
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Customer Name (Small/Cyan) */}
                    <div
                        onClick={() => onCardClick?.(order)}
                        className="flex items-center gap-2 text-sm text-cyan-400/90 font-medium cursor-pointer"
                    >
                        <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-[10px] text-cyan-500 border border-cyan-500/20">
                            {order.customer_name?.charAt(0) || 'U'}
                        </div>
                        <span>{order.customer_name}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

