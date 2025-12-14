import { supabase } from './supabase';
import { Complaint, Order, OrderStatus } from './types';

export const SupabaseService = {
    getComplaints: async (): Promise<Complaint[]> => {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .order('description');

        if (error) {
            console.error('Error fetching complaints:', error);
            return [];
        }

        return data || [];
    },

    getOrders: async (): Promise<Order[]> => {
        if (!supabase) return [];

        // Fetch orders and their related complaints
        // Note: This requires a join. Supabase can fetch relations if foreign keys are set.
        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        complaints:order_complaints(
          complaint:complaints(*)
        )
      `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        // Transform the data to match our Order interface
        // The query returns nested structure: { ..., complaints: [ { complaint: { ... } } ] }
        // We need to flatten it or adjust our type.
        // simpler approach: just map it.

        return data.map((item: any) => ({
            ...item,
            complaints: item?.complaints?.map((c: any) => c.complaint) || []
        }));
    },

    createOrder: async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> => {
        if (!supabase) return null;

        // 1. Insert Order
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_name: order.customer_name,
                whatsapp_number: order.whatsapp_number,
                shoe_model: order.shoe_model,
                serial_number: order.serial_number,
                custom_complaint: order.custom_complaint,
                is_price_unknown: order.is_price_unknown,
                total_price: order.total_price,
                status: order.status,
                expected_return_date: order.expected_return_date
            })
            .select()
            .single();

        if (orderError || !orderData) {
            console.error('Error creating order:', orderError);
            return null;
        }

        // 2. Insert Order Complaints Relations if any
        if (order.complaints && order.complaints.length > 0) {
            const links = order.complaints.map(c => ({
                order_id: orderData.id,
                complaint_id: c.id
            }));

            const { error: linkError } = await supabase
                .from('order_complaints')
                .insert(links);

            if (linkError) {
                console.error('Error linking complaints:', linkError);
                // We continue anyway, or we could delete the order.
            }
        }

        // Log for "WhatsApp"
        console.log("Real DB - WhatsApp Notification Sent to:", orderData.whatsapp_number, "Message: Order Received");

        return { ...orderData, complaints: order.complaints || [] };
    },

    updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order | null> => {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating status:', error);
            return null;
        }

        if (status === 'in_store') {
            console.log("Real DB - WhatsApp Notification: Your shoes are ready for collection!");
        }

        return data;
    },

    updateOrderPrice: async (id: string, price: number): Promise<Order | null> => {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('orders')
            .update({
                total_price: price,
                is_price_unknown: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating price:', error);
            return null;
        }

        console.log("Real DB - WhatsApp Notification: Repair cost estimation is " + price);
        return data;
    },

    addComplaint: async (description: string, default_price: number): Promise<Complaint | null> => {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('complaints')
            .insert({ description, default_price })
            .select()
            .single();

        if (error) {
            console.error("Error adding complaint:", error);
            return null;
        }
        return data;
    },

    deleteComplaint: async (id: string): Promise<boolean> => {
        if (!supabase) return false;

        const { error } = await supabase
            .from('complaints')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting complaint:", error);
            return false;
        }
        return true;
    }
};
