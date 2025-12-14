export type OrderStatus = 'submitted' | 'received' | 'completed' | 'departure' | 'in_store';

export interface Complaint {
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
    serial_number?: string;

    // Custom complaint logic
    custom_complaint?: string;
    is_price_unknown: boolean;

    // Money
    total_price: number;

    // Status and Dates
    status: OrderStatus;
    expected_return_date: string; // ISO date string
    created_at: string;
    updated_at: string;

    // Relations (for frontend state)
    complaints?: Complaint[];
}

// For the Kanban board
export interface KanbanColumn {
    id: OrderStatus;
    title: string;
    orders: Order[];
}
