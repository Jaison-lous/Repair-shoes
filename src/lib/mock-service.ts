import { Complaint, Order, OrderStatus } from "./types";
import { v4 as uuidv4 } from 'uuid';

// Initial Mock Data
export const MOCK_COMPLAINTS: Complaint[] = [
    { id: '1', description: 'Heel Replacement', default_price: 450 },
    { id: '2', description: 'Sole Pasting', default_price: 250 },
    { id: '3', description: 'Full Polish', default_price: 150 },
    { id: '4', description: 'Stitching', default_price: 100 },
    { id: '5', description: 'Patch Work', default_price: 300 },
];

let MOCK_ORDERS: Order[] = [
    {
        id: '101',
        customer_name: 'John Doe',
        whatsapp_number: '9876543210',
        shoe_model: 'Nike Air Max',
        status: 'submitted',
        total_price: 450,
        is_price_unknown: false,
        expected_return_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        complaints: [MOCK_COMPLAINTS[0]]
    },
    {
        id: '102',
        customer_name: 'Jane Smith',
        whatsapp_number: '8765432109',
        shoe_model: 'Adidas Ultraboost',
        status: 'in_store',
        total_price: 0,
        is_price_unknown: true, // Example of unknown price
        expected_return_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        complaints: []
    }
];

// Service Methods
export const MockService = {
    getComplaints: async (): Promise<Complaint[]> => {
        return new Promise((resolve) => setTimeout(() => resolve([...MOCK_COMPLAINTS]), 50));
    },

    getOrders: async (): Promise<Order[]> => {
        return new Promise((resolve) => setTimeout(() => resolve([...MOCK_ORDERS]), 50));
    },

    createOrder: async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> => {
        const newOrder: Order = {
            ...order,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        MOCK_ORDERS.push(newOrder);
        console.log("Mock WhatsApp Notification Sent to:", newOrder.whatsapp_number, "Message: Order Received");
        return new Promise((resolve) => setTimeout(() => resolve(newOrder), 50));
    },

    updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order | null> => {
        const index = MOCK_ORDERS.findIndex(o => o.id === id);
        if (index === -1) return null;

        MOCK_ORDERS[index] = { ...MOCK_ORDERS[index], status, updated_at: new Date().toISOString() };

        // Logic for notifications
        if (status === 'in_store') {
            console.log("Mock WhatsApp Notification: Your shoes are ready for collection!");
        }

        return new Promise((resolve) => setTimeout(() => resolve(MOCK_ORDERS[index]), 50));
    },

    updateOrderPrice: async (id: string, price: number): Promise<Order | null> => {
        const index = MOCK_ORDERS.findIndex(o => o.id === id);
        if (index === -1) return null;

        MOCK_ORDERS[index] = {
            ...MOCK_ORDERS[index],
            total_price: price,
            is_price_unknown: false,
            updated_at: new Date().toISOString()
        };

        console.log("Mock WhatsApp Notification: Repair cost estimation is " + price);
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_ORDERS[index]), 50));
    }
};
