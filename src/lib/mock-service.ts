import { Complaint, Order, OrderStatus, OrderGroup, GroupExpense, InHousePreset } from "./types";
import { SupabaseService } from "./supabase-service";

// We are now using SupabaseService for data.
// This MockService export is kept for backward compatibility during refactor
// but simply forwards calls to SupabaseService.

export const MockService = {
    getComplaints: async (): Promise<Complaint[]> => {
        return SupabaseService.getComplaints();
    },

    getInHousePresets: async (): Promise<InHousePreset[]> => {
        return SupabaseService.getInHousePresets();
    },

    addComplaint: async (description: string, default_price: number): Promise<void> => {
        await SupabaseService.addComplaint(description, default_price);
    },

    deleteComplaint: async (id: string): Promise<void> => {
        await SupabaseService.deleteComplaint(id);
    },

    addInHousePreset: async (description: string, default_price: number): Promise<void> => {
        await SupabaseService.addInHousePreset(description, default_price);
    },

    deleteInHousePreset: async (id: string): Promise<void> => {
        await SupabaseService.deleteInHousePreset(id);
    },

    updateExpense: async (id: string, expense: number): Promise<void> => {
        await SupabaseService.updateExpense(id, expense);
    },

    updateBalancePayment: async (id: string, amount: number, method: string): Promise<void> => {
       await SupabaseService.updateBalancePayment(id, amount, method);
    },

    updateOrderCompletion: async (id: string, isCompleted: boolean): Promise<boolean> => {
        const result = await SupabaseService.updateOrderCompletion(id, isCompleted);
        return !!result;
    },

    bulkUpdateStatus: async (ids: string[], status: OrderStatus): Promise<boolean> => {
        return SupabaseService.bulkUpdateStatus(ids, status);
    },

    getOrders: async (storeId?: string): Promise<Order[]> => {
        return SupabaseService.getOrders(storeId);
    },

    createOrder: async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> => {
        const result = await SupabaseService.createOrder(order);
        if (!result) throw new Error("Failed to create order");
        return result;
    },

    getNextSerialNumber: async (): Promise<string> => {
        return SupabaseService.getNextSerialNumber();
    },

    updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order | null> => {
        return SupabaseService.updateOrderStatus(id, status);
    },

    updateOrderPrice: async (id: string, price: number): Promise<Order | null> => {
        return SupabaseService.updateOrderPrice(id, price);
    },

    updateHubPrice: async (id: string, price: number): Promise<Order | null> => {
        return SupabaseService.updateHubPrice(id, price);
    },

    createGroup: async (name: string, orderIds: string[]): Promise<OrderGroup> => {
         const result = await SupabaseService.createGroup(name, orderIds);
         if (!result) throw new Error("Failed to create group");
         return result;
    },

    getGroups: async (): Promise<OrderGroup[]> => {
        return SupabaseService.getGroups();
    },

    addGroupExpense: async (groupId: string, description: string, amount: number): Promise<void> => {
        await SupabaseService.addGroupExpense(groupId, description, amount);
    }
};
