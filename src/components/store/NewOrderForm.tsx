"use client";

import { useEffect, useState } from "react";
import { SupabaseService as MockService } from "@/lib/supabase-service";
import { Complaint } from "@/lib/types";
import { cn, POINTS_TO_CURRENCY } from "@/lib/utils";
import { Check, Loader2, Plus } from "lucide-react";

export function NewOrderForm({ onSuccess }: { onSuccess: () => void }) {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [clientName, setClientName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [shoeModel, setShoeModel] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
    const [customComplaint, setCustomComplaint] = useState("");
    const [customPrice, setCustomPrice] = useState("");
    const [priceUnknown, setPriceUnknown] = useState(false);
    const [returnDate, setReturnDate] = useState("");

    useEffect(() => {
        MockService.getComplaints().then((data) => {
            setComplaints(data);
            setLoading(false);
        });
    }, []);

    // Calculate Total Price
    const totalPresetPrice = selectedComplaints.reduce((acc, id) => {
        const c = complaints.find((x) => x.id === id);
        return acc + (c ? c.default_price : 0);
    }, 0);

    const finalPrice = priceUnknown
        ? 0
        : totalPresetPrice + (customPrice ? parseFloat(customPrice) : 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await MockService.createOrder({
                customer_name: clientName,
                whatsapp_number: whatsapp,
                shoe_model: shoeModel,
                serial_number: serialNumber,
                status: "submitted",
                // Map selected IDs to partial complaint objects if needed, 
                // but for now our mock service just stores the list.
                // In a real app we'd resolve these relationally.
                // We'll pass the full array to context for now.
                complaints: complaints.filter(c => selectedComplaints.includes(c.id)),
                custom_complaint: customComplaint,
                is_price_unknown: priceUnknown,
                total_price: finalPrice,
                expected_return_date: returnDate,
            });
            alert("Order Created! WhatsApp notification sent.");
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Failed to create order");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleComplaint = (id: string) => {
        setSelectedComplaints((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-6">
                New Repair Request
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Client Name</label>
                        <input
                            required
                            className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="John Doe"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">WhatsApp Number</label>
                        <input
                            required
                            type="tel"
                            className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="9876543210"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Shoe Model</label>
                        <input
                            required
                            className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Nike Air Jordan"
                            value={shoeModel}
                            onChange={(e) => setShoeModel(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Serial Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                        <input
                            className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="SN-12345"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Select Complaints</label>
                    <div className="grid grid-cols-2 gap-3">
                        {complaints.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => toggleComplaint(c.id)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                                    selectedComplaints.includes(c.id)
                                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <span className="text-sm font-medium">{c.description}</span>
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                                    {POINTS_TO_CURRENCY(c.default_price)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-800">
                        <input
                            type="checkbox"
                            checked={!!customComplaint}
                            onChange={(e) => setCustomComplaint(e.target.checked ? "Custom Issue" : "")}
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Custom Complaint / Other Issue</span>
                    </label>

                    {customComplaint && (
                        <div className="space-y-3 pl-6 border-l-2 border-blue-200 mt-2">
                            <input
                                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Describe the issue..."
                                value={customComplaint}
                                onChange={(e) => setCustomComplaint(e.target.value)}
                            />
                            <div className="flex items-center space-x-3">
                                <input
                                    type="number"
                                    disabled={priceUnknown}
                                    className="flex-1 px-4 py-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Estimated Cost"
                                    value={customPrice}
                                    onChange={(e) => setCustomPrice(e.target.value)}
                                />
                                <label className="flex items-center space-x-2 text-sm text-slate-600 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={priceUnknown}
                                        onChange={(e) => setPriceUnknown(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Price Unknown</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Return Date</label>
                        <input
                            required
                            type="date"
                            className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                        />
                    </div>

                    <div className="text-right">
                        <div className="text-sm text-slate-500 mb-1">Total Estimate</div>
                        <div className={cn("text-3xl font-bold", priceUnknown ? "text-orange-500" : "text-slate-800")}>
                            {priceUnknown ? "TBD" : POINTS_TO_CURRENCY(finalPrice)}
                        </div>
                    </div>
                </div>

                <button
                    disabled={submitting}
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                    {submitting ? <Loader2 className="animate-spin" /> : <Check />}
                    <span>Submit Order & Notify Client</span>
                </button>

            </form>
        </div>
    );
}
