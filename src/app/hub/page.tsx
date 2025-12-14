"use client";

import { useEffect, useState } from "react";
import { SupabaseService as MockService } from "@/lib/supabase-service";
import { Order, OrderStatus } from "@/lib/types";
import { KanbanBoard } from "@/components/shared/KanbanBoard";
import { PriceUpdateModal } from "@/components/hub/PriceUpdateModal";
import { RefreshCw, Layers, LogOut } from "lucide-react";
import { logout } from "../login/actions";

export default function HubPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        MockService.getOrders().then(setOrders);
    }, [refreshKey]);

    const handleRefresh = () => setRefreshKey(k => k + 1);

    const onOrderMove = async (orderId: string, newStatus: OrderStatus) => {
        await MockService.updateOrderStatus(orderId, newStatus);
        handleRefresh();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center space-x-3">
                    <div className="bg-violet-100 p-2 rounded-lg text-violet-600">
                        <Layers size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Central Hub</h1>
                        <p className="text-xs text-slate-500">Workflow Management</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button onClick={handleRefresh} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Refresh">
                        <RefreshCw size={20} />
                    </button>
                    <form action={logout}>
                        <button className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition-colors" title="Logout">
                            <LogOut size={20} />
                        </button>
                    </form>
                </div>
            </header>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <KanbanBoard
                    orders={orders}
                    onOrderMove={onOrderMove}
                    onCardClick={setSelectedOrder}
                />
            </div>

            {selectedOrder && (
                <PriceUpdateModal
                    isOpen={!!selectedOrder}
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={handleRefresh}
                />
            )}
        </div>
    );
}
