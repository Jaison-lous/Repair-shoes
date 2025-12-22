import { Complaint, Order, OrderStatus, OrderGroup, GroupExpense } from "./types";
import { v4 as uuidv4 } from 'uuid';

// Initial Mock Data
export const MOCK_COMPLAINTS: Complaint[] = [
    { id: '1', description: 'Heel Replacement', default_price: 450 },
    { id: '2', description: 'Sole Pasting', default_price: 250 },
    { id: '3', description: 'Full Polish', default_price: 150 },
    { id: '4', description: 'Stitching', default_price: 100 },
    { id: '5', description: 'Patch Work', default_price: 300 },
];

let MOCK_GROUPS: OrderGroup[] = [];
let MOCK_EXPENSES: GroupExpense[] = [];

let MOCK_ORDERS: Order[] = [
    {
        id: '101',
        customer_name: 'John Doe',
        whatsapp_number: '9876543210',
        shoe_model: 'Nike Air Max',
        serial_number: 'LW01',
        status: 'submitted',
        total_price: 450,
        is_price_unknown: false,
        expected_return_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        complaints: [MOCK_COMPLAINTS[0]],
        store_id: ''
    },
    {
        id: '102',
        customer_name: 'Jane Smith',
        whatsapp_number: '8765432109',
        shoe_model: 'Adidas Ultraboost',
        serial_number: 'LW02',
        status: 'in_store',
        total_price: 0,
        is_price_unknown: true, // Example of unknown price
        expected_return_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        complaints: [],
        store_id: ''
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

    getNextSerialNumber: async (): Promise<string> => {
        // Find the latest serial number from mock orders
        const lastOrder = MOCK_ORDERS.filter(o => o.serial_number && o.serial_number.startsWith("LW")).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

        if (!lastOrder || !lastOrder.serial_number) return new Promise((resolve) => resolve("LW01"));

        const match = lastOrder.serial_number.match(/LW(\d+)/i);
        if (match && match[1]) {
            const nextNum = parseInt(match[1], 10) + 1;
            return new Promise((resolve) => resolve(`LW${nextNum.toString().padStart(2, '0')}`));
        }

        return new Promise((resolve) => resolve("LW01"));
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
    },

    updateHubPrice: async (id: string, price: number): Promise<Order | null> => {
        const index = MOCK_ORDERS.findIndex(o => o.id === id);
        if (index === -1) return null;

        MOCK_ORDERS[index] = {
            ...MOCK_ORDERS[index],
            hub_price: price,
            updated_at: new Date().toISOString()
        };

        return new Promise((resolve) => setTimeout(() => resolve(MOCK_ORDERS[index]), 50));
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_ORDERS[index]), 50));
    },

    // Group Service Methods
    createGroup: async (name: string, orderIds: string[]): Promise<OrderGroup> => {
        const newGroup: OrderGroup = {
            id: uuidv4(),
            name,
            created_at: new Date().toISOString(),
        };
        MOCK_GROUPS.push(newGroup);

        // Link orders
        MOCK_ORDERS = MOCK_ORDERS.map(o => {
            if (orderIds.includes(o.id)) {
                return { ...o, group_id: newGroup.id };
            }
            return o;
        });

        return new Promise((resolve) => setTimeout(() => resolve(newGroup), 50));
    },

    getGroups: async (): Promise<OrderGroup[]> => {
        // Hydrate groups with orders and expenses
        const groups = MOCK_GROUPS.map(g => {
            const orders = MOCK_ORDERS.filter(o => o.group_id === g.id);
            const expenses = MOCK_EXPENSES.filter(e => e.group_id === g.id);
            return { ...g, orders, expenses };
        });
        return new Promise((resolve) => setTimeout(() => resolve(groups), 50));
    },

    addGroupExpense: async (groupId: string, description: string, amount: number): Promise<void> => {
        const expense: GroupExpense = {
            id: uuidv4(),
            group_id: groupId,
            description,
            amount,
            created_at: new Date().toISOString()
        };
        MOCK_EXPENSES.push(expense);

        // Update all orders in group
        const groupOrders = MOCK_ORDERS.filter(o => o.group_id === groupId);
        if (groupOrders.length > 0) {
            const perOrder = amount / groupOrders.length;
            groupOrders.forEach(o => {
                const idx = MOCK_ORDERS.findIndex(mo => mo.id === o.id);
                if (idx !== -1) {
                    MOCK_ORDERS[idx] = {
                        ...MOCK_ORDERS[idx],
                        total_price: (MOCK_ORDERS[idx].total_price || 0) + perOrder,
                        updated_at: new Date().toISOString()
                    };
                }
            });
        }

        return new Promise((resolve) => setTimeout(() => resolve(), 50));
    }
};
