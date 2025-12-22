import { Order, OrderStatus } from "@/lib/types";
import { cn, POINTS_TO_CURRENCY } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { motion } from "framer-motion";

interface OrderCardProps {
    order: Order;
    onClick?: () => void;
    onMoveNext?: () => void;
    onMoveBack?: () => void;
    allowPriceEdit?: boolean;
    onPriceUpdate?: (orderId: string, newPrice: number) => void;
    onExpenseUpdate?: (orderId: string, newExpense: number) => void;
    userRole?: 'store' | 'hub';

    // Selection Props
    selectable?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;

    // Completion Props
    onCompletionToggle?: (orderId: string, isCompleted: boolean) => void;

    // Store Badge
    showStoreBadge?: boolean;
}

const statusColors: Record<OrderStatus, string> = {
    submitted: "bg-blue-500",
    shipped: "bg-indigo-500",
    received: "bg-yellow-500",
    completed: "bg-purple-500",
    reshipped: "bg-orange-500",
    in_store: "bg-emerald-500",
};

export function OrderCard({ order, onClick, onMoveBack, onMoveNext, userRole = 'store', selectable, isSelected, onSelect, onCompletionToggle, showStoreBadge = false }: OrderCardProps) {
    // Determine price to display based on role
    const displayPrice = userRole === 'hub' ? (order.hub_price || 0) : order.total_price;
    const priceLabel = userRole === 'hub' ? "Hub" : "Store";

    // Handle click - if selectable, trigger selection, otherwise trigger normal onClick
    const handleCardClick = () => {
        if (selectable && onSelect) {
            onSelect();
        } else if (onClick) {
            onClick();
        }
    };

    // Show completion checkbox only for store view in final stage
    const showCompletionCheckbox = userRole === 'store' && order.status === 'in_store' && !selectable && onCompletionToggle;

    // Debug logging
    if (order.status === 'in_store') {
        console.log('In Store Order:', {
            orderId: order.id,
            userRole,
            status: order.status,
            selectable,
            hasToggle: !!onCompletionToggle,
            showCheckbox: showCompletionCheckbox
        });
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.15 }}
            onClick={handleCardClick}
            className={cn(
                "glass-panel p-3 rounded-lg cursor-pointer group hover:shadow-cyan-500/10 hover:border-cyan-500/20 transition-all border relative overflow-hidden active:scale-[0.98]",
                isSelected
                    ? "border-cyan-500 ring-2 ring-cyan-500/50 bg-cyan-500/5"
                    : "border-white/5"
            )}
        >
            {/* Status Indicator Stripe */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", statusColors[order.status])} />

            {/* Selection Checkbox */}
            {selectable && (
                <div className="absolute right-2 top-2 z-10">
                    <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                        isSelected
                            ? "bg-cyan-500 border-cyan-500 text-white"
                            : "bg-black/40 border-white/20 hover:border-white/40"
                    )}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                </div>
            )}

            {/* Store Badge */}
            {showStoreBadge && order.store_name && (
                <div className="absolute right-2 top-2 z-10">
                    <div className="px-2 py-1 rounded-md text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {order.store_name}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="pl-2 space-y-2">
                {/* Shoe Model */}
                <h3 className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors text-sm leading-tight pr-6">
                    {order.shoe_model}
                </h3>

                {/* Customer Name */}
                <p className="text-xs text-slate-400 truncate">
                    {order.customer_name}
                </p>

                {/* Serial Number */}
                {order.serial_number && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                        <Hash size={8} />
                        <span>{order.serial_number}</span>
                    </div>
                )}

                {/* Price */}
                <div className={cn(
                    "rounded-md px-2 py-1.5 border",
                    userRole === 'hub'
                        ? "bg-purple-500/10 border-purple-500/30"
                        : "bg-cyan-500/10 border-cyan-500/30"
                )}>
                    <div className="flex justify-between items-center">
                        <span className={cn(
                            "text-[9px] uppercase font-semibold",
                            userRole === 'hub' ? "text-purple-300" : "text-cyan-300"
                        )}>
                            {priceLabel}
                        </span>
                        <span className="font-mono text-white font-bold text-sm">
                            {order.is_price_unknown && userRole === 'store' ? "TBD" : POINTS_TO_CURRENCY(displayPrice)}
                        </span>
                    </div>
                </div>

                {/* Completion Checkbox */}
                {showCompletionCheckbox && (
                    <div
                        className="flex items-center gap-2 px-2 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-md hover:bg-emerald-500/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <input
                            type="checkbox"
                            checked={order.is_completed || false}
                            onChange={(e) => {
                                e.stopPropagation();
                                onCompletionToggle?.(order.id, e.target.checked);
                            }}
                            className="w-3.5 h-3.5 rounded border-emerald-500/50 bg-black/40 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-[10px] uppercase font-semibold text-emerald-300">
                            Completed
                        </span>
                    </div>
                )}
            </div>

            {/* Move Actions */}
            {(onMoveBack || onMoveNext) && (
                <div className={cn(
                    "mt-2 flex justify-between items-center transition-opacity bg-black/40 -mx-3 -mb-3 px-3 py-1.5 backdrop-blur-md border-t border-white/5",
                    selectable ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveBack?.(); }}
                        disabled={!onMoveBack}
                        className={cn("p-1 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-cyan-400", !onMoveBack && "invisible")}
                        title="Move Back"
                    >
                        <ChevronLeft size={14} />
                    </button>

                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                        {order.status.replace('_', ' ')}
                    </span>

                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveNext?.(); }}
                        disabled={!onMoveNext}
                        className={cn("p-1 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-cyan-400", !onMoveNext && "invisible")}
                        title="Move Next"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </motion.div>
    );
}
