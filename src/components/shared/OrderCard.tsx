"use client";

import { Order, OrderStatus } from "@/lib/types";
import { cn, POINTS_TO_CURRENCY } from "@/lib/utils";
import { Calendar, User, Phone, Tag, ChevronLeft, ChevronRight } from "lucide-react";

interface OrderCardProps {
    order: Order;
    onClick?: () => void;
    onMoveNext?: () => void;
    onMoveBack?: () => void;
}

const statusColors: Record<OrderStatus, string> = {
    submitted: "bg-blue-100 text-blue-700 border-blue-200",
    received: "bg-yellow-100 text-yellow-700 border-yellow-200",
    completed: "bg-purple-100 text-purple-700 border-purple-200",
    departure: "bg-orange-100 text-orange-700 border-orange-200",
    in_store: "bg-green-100 text-green-700 border-green-200",
};

export function OrderCard({ order, onClick, onMoveBack, onMoveNext }: OrderCardProps) {
    return (
        <div
            onClick={onClick}
            className="bg-white p-4 rounded-xl border border-slate-100 transition-all group"
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                        {order.shoe_model}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                        <User size={12} />
                        <span>{order.customer_name}</span>
                    </div>
                </div>
                <span className={cn("px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border", statusColors[order.status])}>
                    {order.status.replace('_', ' ')}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1.5 text-slate-500">
                        <Calendar size={14} />
                        <span className="text-xs">{new Date(order.expected_return_date).toLocaleDateString()}</span>
                    </div>

                    <div className="font-semibold text-slate-700">
                        {order.is_price_unknown ? (
                            <span className="text-orange-500 text-xs bg-orange-50 px-2 py-0.5 rounded">To Quote</span>
                        ) : (
                            POINTS_TO_CURRENCY(order.total_price)
                        )}
                    </div>
                </div>

                {order.custom_complaint && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                        "{order.custom_complaint}"
                    </div>
                )}
            </div>

            {(onMoveBack || onMoveNext) && (
                <div className="mt-3 flex justify-between items-center pt-3 border-t border-slate-50">
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveBack?.(); }}
                        disabled={!onMoveBack}
                        className={cn("p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600", !onMoveBack && "invisible")}
                        title="Move Back"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <span className="text-[10px] text-slate-300 font-medium uppercase tracking-widest">
                        Move
                    </span>

                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveNext?.(); }}
                        disabled={!onMoveNext}
                        className={cn("p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600", !onMoveNext && "invisible")}
                        title="Move Next"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
