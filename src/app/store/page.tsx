"use client";

import { useEffect, useState } from "react";
import { SupabaseService as MockService } from "@/lib/supabase-service";
import { Order, Complaint } from "@/lib/types";
import { NewOrderForm } from "@/components/store/NewOrderForm";
import { KanbanBoard } from "@/components/shared/KanbanBoard";
import { Plus, LayoutTemplate, RefreshCw, LogOut, Settings, Trash2 } from "lucide-react";
import { cn, POINTS_TO_CURRENCY } from "@/lib/utils";
import { logout } from "../login/actions";

export default function StorePage() {
    const [view, setView] = useState<'new' | 'kanban' | 'config'>('new');
    const [orders, setOrders] = useState<Order[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    // Complaint Config State
    const [newComplaintDesc, setNewComplaintDesc] = useState("");
    const [newComplaintPrice, setNewComplaintPrice] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        MockService.getOrders().then(setOrders);
        MockService.getComplaints().then(setComplaints);
    }, [refreshKey]);

    const handleRefresh = () => setRefreshKey(k => k + 1);

    const handleAddComplaint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComplaintDesc || !newComplaintPrice) return;
        setIsAdding(true);
        await MockService.addComplaint(newComplaintDesc, Number(newComplaintPrice));
        setNewComplaintDesc("");
        setNewComplaintPrice("");
        setIsAdding(false);
        handleRefresh();
    };

    const handleDeleteComplaint = async (id: string) => {
        if (confirm("Are you sure you want to delete this preset?")) {
            await MockService.deleteComplaint(id);
            handleRefresh();
        }
    }

    return (
        <div className="min-h-screen p-6 md:p-12 space-y-8 bg-slate-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Store Portal</h1>
                    <p className="text-slate-500">Manage intake and track repairs</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-white/50 backdrop-blur p-1 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setView('new')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all",
                                view === 'new' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Plus size={16} />
                            <span>New Order</span>
                        </button>
                        <button
                            onClick={() => setView('kanban')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all",
                                view === 'kanban' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <LayoutTemplate size={16} />
                            <span>My Orders</span>
                        </button>
                        <button
                            onClick={() => setView('config')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all",
                                view === 'config' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Settings size={16} />
                            <span>Configuration</span>
                        </button>
                    </div>

                    <form action={logout}>
                        <button className="p-3 bg-white hover:bg-red-50 hover:text-red-600 rounded-xl border border-slate-200 text-slate-400 transition-colors shadow-sm" title="Logout">
                            <LogOut size={20} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Content */}
            <div className="relative">
                {view === 'new' && (
                    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <NewOrderForm onSuccess={() => setView('kanban')} />
                    </div>
                )}

                {view === 'kanban' && (
                    <div className="h-[calc(100vh-200px)] animate-in fade-in zoom-in-95 duration-300">
                        <div className="mb-4 flex justify-end">
                            <button onClick={handleRefresh} className="p-2 bg-white rounded-full shadow hover:bg-slate-50 text-slate-500">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                        <KanbanBoard orders={orders} readOnly={true} />
                    </div>
                )}

                {view === 'config' && (
                    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Add New */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                <Plus className="mr-2 text-blue-600" size={20} />
                                Add New Complaint Preset
                            </h2>
                            <form onSubmit={handleAddComplaint} className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Description"
                                    className="flex-1 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newComplaintDesc}
                                    onChange={e => setNewComplaintDesc(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    className="w-32 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newComplaintPrice}
                                    onChange={e => setNewComplaintPrice(e.target.value)}
                                />
                                <button
                                    disabled={isAdding}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </form>
                        </div>

                        {/* List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-800">Existing Presets</h2>
                                <p className="text-sm text-slate-500">Manage standard repair types and base prices.</p>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {complaints.map(c => (
                                    <div key={c.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                                        <div>
                                            <p className="font-medium text-slate-700">{c.description}</p>
                                            <p className="text-sm text-slate-500">{POINTS_TO_CURRENCY(c.default_price)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteComplaint(c.id)}
                                            className="p-2 text-slate-300 group-hover:text-red-500 group-hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Preset"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {complaints.length === 0 && (
                                    <div className="p-8 text-center text-slate-400 italic">
                                        No presets found. Add one above.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
