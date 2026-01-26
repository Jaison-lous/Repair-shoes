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

    // Movement Handlers
    onOrderMove?: (orderId: string, newStatus: OrderStatus) => void;
}

const statusColors: Record<OrderStatus, string> = {
    submitted: "bg-blue-500",
    shipped: "bg-indigo-500",
    received: "bg-yellow-500",
    completed: "bg-purple-500",
    reshipped: "bg-orange-500",
    in_store: "bg-emerald-500",
};

const STATUS_OPTIONS: { id: OrderStatus; label: string; color: string }[] = [
    { id: 'submitted', label: 'Submitted', color: 'bg-slate-500/20 text-slate-300 border-slate-500/50' },
    { id: 'shipped', label: 'Shipped', color: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
    { id: 'received', label: 'Received', color: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
    { id: 'in_store', label: 'In Store', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' },
    { id: 'completed', label: 'Completed', color: 'bg-green-500/20 text-green-300 border-green-500/50' },
    { id: 'reshipped', label: 'Reshipped', color: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
];

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

            {/* Content */}
            <div className="pl-1 flex flex-col justify-center min-h-full">
                {/* Header: Serial Number Primary (Large/White) */}
                <div className="mb-0.5">
                    <span className="font-mono text-base font-bold text-white/90">
                        #{order.serial_number || '---'}
                    </span>
                </div>

                {/* Customer Name (Small/Cyan) */}
                <div className="flex items-center gap-1 text-xs text-cyan-400/90">
                    <div className="w-3.5 h-3.5 rounded-full bg-cyan-500/10 flex items-center justify-center text-[8px] text-cyan-500 border border-cyan-500/20">
                        {order.customer_name?.charAt(0) || 'U'}
                    </div>
                    <span className="font-medium truncate">{order.customer_name}</span>
                </div>
            </div>
        </motion.div>
    );
}
