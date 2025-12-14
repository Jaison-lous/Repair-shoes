"use client";

import { Order, OrderStatus } from "@/lib/types";
import { OrderCard } from "./OrderCard";

interface KanbanBoardProps {
    orders: Order[];
    onOrderMove?: (orderId: string, newStatus: OrderStatus) => void;
    readOnly?: boolean;
    onCardClick?: (order: Order) => void;
}

const COLUMNS: { id: OrderStatus; title: string }[] = [
    { id: 'submitted', title: 'Submitted' },
    { id: 'received', title: 'Received' },
    { id: 'completed', title: 'Completed' },
    { id: 'departure', title: 'Departure' },
    { id: 'in_store', title: 'In Store' },
];

export function KanbanBoard({ orders, onOrderMove, readOnly = false, onCardClick }: KanbanBoardProps) {

    const handleMove = (orderId: string, currentIndex: number, direction: 'prev' | 'next') => {
        if (!onOrderMove) return;

        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex < 0 || newIndex >= COLUMNS.length) return;

        const newStatus = COLUMNS[newIndex].id;
        onOrderMove(orderId, newStatus);
    };

    return (
        <div className="grid grid-cols-5 gap-4 h-full w-full min-w-0">
            {COLUMNS.map((col, colIndex) => {
                const colOrders = orders.filter(o => o.status === col.id);

                // Determine if moves are possible
                const hasPrev = colIndex > 0;
                const hasNext = colIndex < COLUMNS.length - 1;

                return (
                    <div key={col.id} className="flex flex-col h-full rounded-2xl bg-slate-50/50 border border-slate-200/60 backdrop-blur-sm min-w-0">
                        <div className="p-3 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <h3 className="font-semibold text-slate-700 truncate">{col.title}</h3>
                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full shrink-0">{colOrders.length}</span>
                        </div>

                        <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-hide min-h-0">
                            {colOrders.map((order) => (
                                <div key={order.id} className="mb-3">
                                    <OrderCard
                                        order={order}
                                        onClick={() => onCardClick?.(order)}
                                        onMoveBack={!readOnly && hasPrev ? () => handleMove(order.id, colIndex, 'prev') : undefined}
                                        onMoveNext={!readOnly && hasNext ? () => handleMove(order.id, colIndex, 'next') : undefined}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
