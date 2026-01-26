export type OrderStatus = 'submitted' | 'shipped' | 'received' | 'completed' | 'reshipped' | 'in_store';

export interface Store {
    id: string;
    name: string;
    password_hash: string;
    created_at: string;
    updated_at?: string;
}

export interface Complaint {
    id: string;
    description: string;
    default_price: number;
}

export interface InHousePreset {
    id: string;
    description: string;
    default_price: number;
}

export interface OrderComplaint {
    order_id: string;
    complaint_id: string;
    // Included purely for UI convenience if we join them
    complaint?: Complaint;
}

export interface Order {
    id: string;
    customer_name: string;
    whatsapp_number: string;
    shoe_model: string;
    serial_number: string;
    shoe_size?: string;
    shoe_color?: string;

    // Custom complaint logic
    custom_complaint?: string;
    is_price_unknown?: boolean;

    // Money
    display_price?: number; // Optional UI helper if needed
    total_price: number;
    hub_price?: number;
    expense?: number;
    advance_amount?: number;
    payment_method?: string | null;
    balance_paid?: number;
    balance_payment_method?: string | null;

    // Status and Dates
    status: OrderStatus;
    expected_return_date: string; // ISO date string
    created_at: string;
    updated_at: string;
    is_completed?: boolean;
    is_in_house?: boolean; // If true, order is handled in-house, not sent to hub

    // Store relation
    store_id: string;
    store_name?: string; // Populated via join

    // Relations (for frontend state)
    complaints?: Complaint[];
    group_id?: string;
    group?: OrderGroup;
}

export interface OrderGroup {
    id: string;
    name: string;
    created_at: string;
    expenses?: GroupExpense[];
    orders?: Order[];
}

export interface GroupExpense {
    id: string;
    group_id: string;
    description: string;
    amount: number;
    created_at: string;
}

// For the Kanban board
export interface KanbanColumn {
    id: OrderStatus;
    title: string;
    orders: Order[];
}
