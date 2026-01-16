"use client";

import { Order } from "@/lib/types";
import { POINTS_TO_CURRENCY } from "@/lib/utils";
import { useEffect } from "react";

interface InvoiceViewProps {
    order: Order;
}

export function InvoiceView({ order }: InvoiceViewProps) {
    
    // Auto print logic - optional, or just let user click
    useEffect(() => {
        // setTimeout(() => window.print(), 500);
    }, []);

    const totalPaid = (order.advance_amount || 0) + (order.balance_paid || 0);
    const balanceDue = (order.total_price || 0) - totalPaid;

    return (
        <div className="bg-white text-black min-h-screen p-4">
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0.5cm; size: auto; }
                    body { 
                        visibility: hidden; 
                        background: white !important;
                        color: black !important;
                    }
                    .no-print { display: none !important; }
                    
                    /* Show only the receipt */
                    .receipt-container {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white;
                        color: black !important;
                        padding: 0;
                        margin: 0;
                    }
                    .receipt-container * {
                        visibility: visible;
                        color: black !important;
                    }
                }
            `}</style>

            {/* Screen Actions (Hidden on Print) */}
            <div className="no-print flex justify-between items-center mb-8 bg-gray-100 p-4 rounded-lg max-w-md mx-auto">
                <button 
                    onClick={() => window.close()}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 font-medium"
                >
                    Close
                </button>
                <button 
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow flex items-center gap-2"
                >
                    <span>🖨️</span> Print Receipt
                </button>
            </div>

            {/* Receipt Content - Matches NewOrderForm style */}
            <div className="receipt-container max-w-[21cm] mx-auto p-4 text-black bg-white">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold uppercase tracking-wider">Shoe Repair Order</h1>
                    <p className="text-sm text-gray-600 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Receipt #{order.serial_number || order.id.slice(0, 8)}</p>
                </div>

                <div className="border-t-2 border-b-2 border-black py-4 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="font-semibold">Customer:</p>
                            <p>{order.customer_name}</p>
                        </div>
                        <div>
                            <p className="font-semibold">WhatsApp:</p>
                            <p>{order.whatsapp_number}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="font-semibold text-sm">Shoe Model:</p>
                    <p className="text-lg">{order.shoe_model}</p>
                </div>

                <div className="mb-4">
                    <p className="font-semibold text-sm">Serial Number:</p>
                    <p className="text-lg font-mono">{order.serial_number}</p>
                </div>

                {(order.complaints && order.complaints.length > 0) && (
                    <div className="mb-4">
                        <p className="font-semibold text-sm mb-2">Services:</p>
                        <ul className="list-disc list-inside">
                            {order.complaints.map((c: any, idx: number) => (
                                <li key={idx} className="text-sm">{c.description}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {order.custom_complaint && (
                    <div className="mb-4">
                        <p className="font-semibold text-sm">Custom Service:</p>
                        <p className="text-sm">{order.custom_complaint}</p>
                    </div>
                )}

                <div className="mb-4">
                    <p className="font-semibold text-sm">Expected Return:</p>
                    <p>{new Date(order.expected_return_date).toLocaleDateString()}</p>
                </div>

                <div className="border-t-2 border-black pt-4 mt-4">
                    <div className="flex justify-between items-center">
                        <p className="text-lg font-bold">Total Price:</p>
                        <p className="text-2xl font-bold">
                            {order.is_price_unknown ? 'TBD' : POINTS_TO_CURRENCY(order.total_price)}
                        </p>
                    </div>
                    
                    {/* Advance / Paid History */}
                    {(totalPaid > 0) && (
                        <>
                            <div className="flex justify-between items-center mt-2 text-gray-600">
                                <p className="text-sm">Paid Amount:</p>
                                <p className="text-lg font-semibold">
                                    {POINTS_TO_CURRENCY(totalPaid)}
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-300">
                                <p className="text-lg font-bold">Balance Due:</p>
                                <p className="text-2xl font-bold">
                                    {POINTS_TO_CURRENCY(Math.max(0, balanceDue))}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-8 text-center text-xs text-gray-600">
                    <p className="font-bold mb-1">Terms & Conditions:</p>
                    <p>Goods once sold/repaired will not be taken back.</p>
                    <p>We are not responsible for natural wear and tear.</p>
                    <p className="mt-4 font-bold text-sm">Thank you for your business!</p>
                </div>
            </div>
        </div>
    );
}
