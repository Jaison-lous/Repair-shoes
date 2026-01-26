"use client";

import { useState } from "react";
import { Order, OrderStatus } from "@/lib/types";
import { OrderCard } from "./OrderCard";
import { OrderDetailModal } from "./OrderDetailModal";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
    orders: Order[];
    onOrderMove?: (orderId: string, newStatus: OrderStatus) => void;
    readOnly?: boolean;
    onCardClick?: (order: Order) => void;
    allowPriceEdit?: boolean;
    onPriceUpdate?: (orderId: string, newPrice: number) => void;
    onHubPriceUpdate?: (orderId: string, newPrice: number) => void;
    onExpenseUpdate?: (orderId: string, newExpense: number) => void;
    onBalancePayment?: (orderId: string, amount: number, paymentMethod: string) => void;
    userRole?: 'store' | 'hub';
    onGroupExpense?: (orderIds: string[], note: string, amount: number) => Promise<void>;
    onCreateGroup?: (orderIds: string[]) => void;
    onBulkStageChange?: (orderIds: string[], newStatus: OrderStatus) => void;
    onCompletionToggle?: (orderId: string, isCompleted: boolean) => void;
    showStoreBadge?: boolean;
}

const COLUMNS: { id: OrderStatus; title: string }[] = [
    { id: 'submitted', title: 'Submitted' },
    { id: 'shipped', title: 'Shipped' },
    { id: 'received', title: 'Received' },
    { id: 'completed', title: 'Completed' },
    { id: 'reshipped', title: 'Reshipped' },
    { id: 'in_store', title: 'In Store' },
];

export function KanbanBoard({ orders, onOrderMove, readOnly = false, onCardClick, allowPriceEdit, onPriceUpdate, onHubPriceUpdate, onExpenseUpdate, onBalancePayment, userRole = 'store', onGroupExpense, onCreateGroup, onBulkStageChange, onCompletionToggle, showStoreBadge = false }: KanbanBoardProps) {

    // Filter out completed orders from Kanban view
    const activeOrders = orders.filter(o => !o.is_completed);

    const [activeTab, setActiveTab] = useState<OrderStatus>('submitted');

    // Order Detail Modal State
    const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);

    // Group Expense State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [expenseName, setExpenseName] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [isApplying, setIsApplying] = useState(false);

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedOrders);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedOrders(newSet);
    };

    const handleApplyExpense = async () => {
        if (!onGroupExpense || !expenseAmount || selectedOrders.size === 0) return;
        setIsApplying(true);
        await onGroupExpense(Array.from(selectedOrders), expenseName || "Group Expense", parseFloat(expenseAmount));
        setIsApplying(false);
        setExpenseName("");
        setExpenseAmount("");
        setSelectedOrders(new Set());
        setIsSelectionMode(false);
    };

    const handleMove = (orderId: string, currentIndex: number, direction: 'prev' | 'next') => {
        if (!onOrderMove) return;

        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex < 0 || newIndex >= COLUMNS.length) return;

        const newStatus = COLUMNS[newIndex].id;
        onOrderMove(orderId, newStatus);
    };

    // Mobile specific move
    const handleMobileMove = (orderId: string, currentStatus: OrderStatus, direction: 'prev' | 'next') => {
        if (!onOrderMove) return;
        const currentIndex = COLUMNS.findIndex(c => c.id === currentStatus);
        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (newIndex >= 0 && newIndex < COLUMNS.length) {
            onOrderMove(orderId, COLUMNS[newIndex].id);
            // Optional: switch tab to follow order? Maybe not, better to just let it move out.
        }
    }

    // Confirmation Modal State
    const [pendingStageChange, setPendingStageChange] = useState<{ status: OrderStatus; title: string } | null>(null);

    // Bulk Stage Change Handlers
    const handleBulkStageChange = (newStatus: OrderStatus) => {
        if (!onBulkStageChange || selectedOrders.size === 0) return;

        const targetColumn = COLUMNS.find(c => c.id === newStatus);
        if (!targetColumn) return;

        // Show confirmation modal instead of browser confirm
        setPendingStageChange({ status: newStatus, title: targetColumn.title });
    };

    const confirmStageChange = () => {
        if (!pendingStageChange || !onBulkStageChange) return;

        onBulkStageChange(Array.from(selectedOrders), pendingStageChange.status);
        setSelectedOrders(new Set());
        setIsSelectionMode(false);
        setPendingStageChange(null);
    };

    const cancelStageChange = () => {
        setPendingStageChange(null);
    };

    const handleBulkMovePrev = () => {
        if (!onBulkStageChange || selectedOrders.size === 0) return;

        // Find the earliest stage among selected orders
        const selectedOrderObjs = activeOrders.filter(o => selectedOrders.has(o.id));
        const currentIndices = selectedOrderObjs.map(o => COLUMNS.findIndex(c => c.id === o.status));
        const minIndex = Math.min(...currentIndices);

        if (minIndex > 0) {
            handleBulkStageChange(COLUMNS[minIndex - 1].id);
        }
    };

    const handleBulkMoveNext = () => {
        if (!onBulkStageChange || selectedOrders.size === 0) return;

        // Find the latest stage among selected orders
        const selectedOrderObjs = activeOrders.filter(o => selectedOrders.has(o.id));
        const currentIndices = selectedOrderObjs.map(o => COLUMNS.findIndex(c => c.id === o.status));
        const maxIndex = Math.max(...currentIndices);

        if (maxIndex < COLUMNS.length - 1) {
            handleBulkStageChange(COLUMNS[maxIndex + 1].id);
        }
    };


    return (
        <div className="h-full w-full min-w-0 flex flex-col">
            {/* Selection Toolbar */}
            {(onGroupExpense || onCreateGroup) && (
                <div className="flex justify-between items-center mb-2 px-1 shrink-0">
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                setSelectedOrders(new Set());
                            }}
                            className={cn(
                                "text-xs px-3 py-1.5 rounded-lg border transition-all",
                                isSelectionMode
                                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                            )}
                        >
                            {isSelectionMode ? "Cancel Selection" : "Select Orders"}
                        </button>

                        {isSelectionMode && selectedOrders.size > 0 && onCreateGroup && (
                            <button
                                onClick={() => {
                                    onCreateGroup(Array.from(selectedOrders));
                                    setIsSelectionMode(false);
                                    setSelectedOrders(new Set());
                                }}
                                className="text-xs px-3 py-1.5 rounded-lg border bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30 transition-all"
                            >
                                Create Group
                            </button>
                        )}
                    </div>
                    {isSelectionMode && (
                        <span className="text-xs text-slate-400">
                            {selectedOrders.size} selected
                        </span>
                    )}
                </div>
            )}

            {/* Bulk Stage Change Controls */}
            {isSelectionMode && selectedOrders.size > 0 && onBulkStageChange && (
                <div className="mb-3 px-1 shrink-0">
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-3 backdrop-blur-sm">
                        <div className="flex flex-col gap-3">
                            {/* Stage Change Row */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-300">Bulk Stage Change:</span>
                                    <span className="text-xs text-blue-300 font-mono">{selectedOrders.size} order(s)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Previous Stage Button */}
                                    <button
                                        onClick={handleBulkMovePrev}
                                        disabled={(() => {
                                            const selectedOrderObjs = orders.filter(o => selectedOrders.has(o.id));
                                            const currentIndices = selectedOrderObjs.map(o => COLUMNS.findIndex(c => c.id === o.status));
                                            return Math.min(...currentIndices) <= 0;
                                        })()}
                                        className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border border-white/10 text-slate-300 hover:text-cyan-400 transition-all"
                                        title="Move to Previous Stage"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6"></polyline>
                                        </svg>
                                    </button>

                                    {/* Stage Dropdown */}
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleBulkStageChange(e.target.value as OrderStatus);
                                                e.target.value = ''; // Reset
                                            }
                                        }}
                                        className="bg-black/40 text-xs text-slate-300 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500/50 hover:bg-black/60 transition-all cursor-pointer"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Move to Stage...</option>
                                        {COLUMNS.map(col => (
                                            <option key={col.id} value={col.id}>{col.title}</option>
                                        ))}
                                    </select>

                                    {/* Next Stage Button */}
                                    <button
                                        onClick={handleBulkMoveNext}
                                        disabled={(() => {
                                            const selectedOrderObjs = orders.filter(o => selectedOrders.has(o.id));
                                            const currentIndices = selectedOrderObjs.map(o => COLUMNS.findIndex(c => c.id === o.status));
                                            return Math.max(...currentIndices) >= COLUMNS.length - 1;
                                        })()}
                                        className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border border-white/10 text-slate-300 hover:text-cyan-400 transition-all"
                                        title="Move to Next Stage"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Expense Row */}
                            {onGroupExpense && (
                                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                    <span className="text-xs font-medium text-slate-300 shrink-0">Add Expense:</span>
                                    <input
                                        type="text"
                                        placeholder="Name (e.g. Delivery)"
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                                        value={expenseName}
                                        onChange={e => setExpenseName(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                                        value={expenseAmount}
                                        onChange={e => setExpenseAmount(e.target.value)}
                                    />
                                    <button
                                        onClick={handleApplyExpense}
                                        disabled={isApplying || !expenseAmount}
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors shrink-0"
                                    >
                                        {isApplying ? "..." : "Add"}
                                    </button>
                                    {expenseAmount && (
                                        <span className="text-[10px] text-slate-400 shrink-0">
                                            ({(parseFloat(expenseAmount) / selectedOrders.size).toFixed(2)} each)
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Tabs */}
            <div className={cn("md:hidden flex overflow-x-auto gap-2 pb-4 mb-2 scrollbar-hide snap-x transition-all", isSelectionMode && "opacity-50 pointer-events-none")}>
                {COLUMNS.map((col) => {
                    const count = activeOrders.filter(o => o.status === col.id).length;
                    const isActive = activeTab === col.id;
                    return (
                        <button
                            key={col.id}
                            onClick={() => setActiveTab(col.id)}
                            className={cn(
                                "flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all border snap-center",
                                isActive
                                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                            )}
                        >
                            <span className="font-medium text-sm">{col.title}</span>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", isActive ? "bg-cyan-500/20 text-cyan-200" : "bg-black/20 text-slate-500")}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Mobile Content (Active Tab Only) */}
            <div className="md:hidden flex-1 overflow-y-auto min-h-0 bg-white/5 border border-white/10 rounded-2xl p-4">
                {(() => {
                    const activeColIndex = COLUMNS.findIndex(c => c.id === activeTab);
                    const col = COLUMNS[activeColIndex];
                    const colOrders = activeOrders.filter(o => o.status === activeTab);
                    const hasPrev = activeColIndex > 0;
                    const hasNext = activeColIndex < COLUMNS.length - 1;

                    return (
                        <div className="space-y-3">
                            {colOrders.length === 0 && (
                                <div className="text-center text-slate-500 py-10 italic">
                                    No orders in {col.title}
                                </div>
                            )}
                            {colOrders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onClick={() => onCardClick?.(order)}
                                    // Mobile specific move handlers
                                    onMoveBack={!readOnly && hasPrev ? () => handleMobileMove(order.id, activeTab, 'prev') : undefined}
                                    onMoveNext={!readOnly && hasNext ? () => handleMobileMove(order.id, activeTab, 'next') : undefined}
                                    allowPriceEdit={allowPriceEdit && !isSelectionMode}
                                    onPriceUpdate={onPriceUpdate}
                                    userRole={userRole}
                                    // Selection props
                                    selectable={isSelectionMode}
                                    isSelected={selectedOrders.has(order.id)}
                                    onSelect={() => toggleSelection(order.id)}
                                    onCompletionToggle={onCompletionToggle}
                                    showStoreBadge={showStoreBadge}
                                    onOrderMove={onOrderMove}
                                />
                            ))}
                        </div>
                    );
                })()}
            </div>


            {/* Desktop Grid */}
            <div className="hidden md:flex gap-4 w-full min-w-0 overflow-x-auto pb-4">
                {COLUMNS.map((col, colIndex) => {
                    const colOrders = activeOrders.filter(o => o.status === col.id);

                    // Determine if moves are possible
                    const hasPrev = colIndex > 0;
                    const hasNext = colIndex < COLUMNS.length - 1;

                    return (
                        <div key={col.id} className="flex flex-col min-w-[300px] flex-shrink-0 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl shadow-black/20">
                            <div className="p-3 border-b border-white/5 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-2 flex-1">
                                    <h3 className="font-semibold text-slate-200 truncate tracking-wide">{col.title}</h3>
                                    <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full shrink-0 border border-white/5 font-mono">{colOrders.length}</span>
                                </div>

                                {/* Select All button - only visible in selection mode */}
                                {isSelectionMode && colOrders.length > 0 && (
                                    <button
                                        onClick={() => {
                                            const columnOrderIds = colOrders.map(o => o.id);
                                            const allSelected = columnOrderIds.every(id => selectedOrders.has(id));

                                            const newSet = new Set(selectedOrders);
                                            if (allSelected) {
                                                // Deselect all in this column
                                                columnOrderIds.forEach(id => newSet.delete(id));
                                            } else {
                                                // Select all in this column
                                                columnOrderIds.forEach(id => newSet.add(id));
                                            }
                                            setSelectedOrders(newSet);
                                        }}
                                        className="text-[10px] px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-colors font-medium"
                                    >
                                        {colOrders.every(o => selectedOrders.has(o.id)) ? "Deselect All" : "Select All"}
                                    </button>
                                )}
                            </div>

                            <div className="p-3 space-y-3">
                                {colOrders.map((order) => (
                                    <div key={order.id} className="mb-3">
                                        <OrderCard
                                            order={order}
                                            onClick={() => setSelectedOrderForModal(order)}
                                            onMoveBack={!readOnly && hasPrev ? () => handleMove(order.id, colIndex, 'prev') : undefined}
                                            onMoveNext={!readOnly && hasNext ? () => handleMove(order.id, colIndex, 'next') : undefined}
                                            allowPriceEdit={allowPriceEdit && !isSelectionMode}
                                            onPriceUpdate={onPriceUpdate}
                                            onExpenseUpdate={onExpenseUpdate}
                                            userRole={userRole}
                                            // Selection props
                                            selectable={isSelectionMode}
                                            isSelected={selectedOrders.has(order.id)}
                                            onSelect={() => toggleSelection(order.id)}
                                            onCompletionToggle={onCompletionToggle}
                                            showStoreBadge={showStoreBadge}
                                            onOrderMove={onOrderMove}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Confirmation Modal */}
            {pendingStageChange && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={cancelStageChange}>
                    <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-2">Confirm Stage Change</h3>
                        <p className="text-slate-300 text-sm mb-6">
                            Move <span className="font-bold text-cyan-400">{selectedOrders.size}</span> selected order(s) to '<span className="font-bold text-cyan-400">{pendingStageChange.title}</span>'?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelStageChange}
                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStageChange}
                                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-all shadow-lg shadow-cyan-500/20"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrderForModal && (
                <OrderDetailModal
                    order={selectedOrderForModal}
                    onClose={() => setSelectedOrderForModal(null)}
                    userRole={userRole}
                    allowPriceEdit={allowPriceEdit}
                    onPriceUpdate={onHubPriceUpdate || onPriceUpdate}
                    onExpenseUpdate={onExpenseUpdate}
                    onBalancePayment={onBalancePayment}
                />
            )}
        </div>
    );
}
