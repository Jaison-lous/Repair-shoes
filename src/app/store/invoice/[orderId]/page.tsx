"use client";

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MockService } from '@/lib/mock-service';
import { InvoiceView } from '@/components/shared/InvoiceView';
import { Order } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
    // Unwrap params using React.use() as per Next.js 15+ guidance
    const { orderId } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchOrder() {
            try {
                // In a real app we would fetch by unique ID from DB. 
                // Here we fetch all (mock) and find.
                const allOrders = await MockService.getOrders();
                const found = allOrders.find(o => o.id === orderId);
                
                if (found) {
                    setOrder(found);
                } else {
                    alert("Order not found!");
                    // router.push('/store'); // Optional: redirect back
                }
            } catch (error) {
                console.error("Failed to load invoice order", error);
            } finally {
                setLoading(false);
            }
        }

        if (orderId) {
            fetchOrder();
        }
    }, [orderId, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white text-black">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm text-slate-500">Generating Invoice...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 text-black">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Order Not Found</h1>
                    <p className="text-gray-600 mt-2">The requested invoice ID does not exist.</p>
                </div>
            </div>
        );
    }

    return <InvoiceView order={order} />;
}
