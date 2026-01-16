"use client";

import { useEffect, useState } from "react";
import { SupabaseService as MockService } from "@/lib/supabase-service";
import { Complaint, InHousePreset } from "@/lib/types";
import { cn, POINTS_TO_CURRENCY, openWhatsApp } from "@/lib/utils";
import { Check, Loader2, CheckCircle2, AlertCircle, X, Printer } from "lucide-react";
import { addWeeks, format } from "date-fns";
import { useRef } from "react";

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    return (
        <div className={cn(
            "fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md animate-slide-in-right flex items-center gap-3 min-w-[300px]",
            type === 'success'
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-100"
                : "bg-red-500/20 border-red-500/50 text-red-100"
        )}>
            {type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors shrink-0"
            >
                <X size={18} />
            </button>
        </div>
    );
}

export function NewOrderForm({ onSuccess, storeId }: { onSuccess: () => void; storeId: string | null }) {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [inHousePresets, setInHousePresets] = useState<InHousePreset[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [lastSubmittedOrder, setLastSubmittedOrder] = useState<any>(null);

    // Validation State
    const [errors, setErrors] = useState<{
        clientName?: string;
        whatsapp?: string;
        shoeModel?: string;
    }>({});

    // Refs
    const clientNameRef = useRef<HTMLInputElement>(null);

    // Form State
    const [clientName, setClientName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [shoeModel, setShoeModel] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [orderDate, setOrderDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
    const [selectedInHousePresets, setSelectedInHousePresets] = useState<string[]>([]);
    const [customComplaint, setCustomComplaint] = useState("");
    const [customPrice, setCustomPrice] = useState("");
    const [priceUnknown, setPriceUnknown] = useState(false);
    const [isFree, setIsFree] = useState(false);
    const [returnDate, setReturnDate] = useState(format(addWeeks(new Date(), 2), "yyyy-MM-dd"));
    const [advanceAmount, setAdvanceAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [isInHouse, setIsInHouse] = useState(false);

    // Auto-focus customer name field on mount
    useEffect(() => {
        clientNameRef.current?.focus();
    }, []);

    useEffect(() => {
        MockService.getComplaints().then((data) => {
            setComplaints(data);
        });
        MockService.getInHousePresets().then((data) => {
            setInHousePresets(data);
            setLoading(false);
        });

        // Auto-generate serial number
        MockService.getNextSerialNumber().then((sn) => {
            setSerialNumber(sn);
        });
    }, []);

    // Calculate Total Price
    const totalPresetPrice = selectedComplaints.reduce((acc, id) => {
        const c = complaints.find((x) => x.id === id);
        return acc + (c ? c.default_price : 0);
    }, 0);

    const totalInHousePrice = selectedInHousePresets.reduce((acc, id) => {
        const p = inHousePresets.find((x) => x.id === id);
        return acc + (p ? p.default_price : 0);
    }, 0);

    const finalPrice = isFree
        ? 0
        : (priceUnknown
            ? 0
            : ((isInHouse ? totalInHousePrice : 0) + totalPresetPrice) + (customPrice ? parseFloat(customPrice) : 0));

    const resetForm = () => {
        setClientName("");
        setWhatsapp("");
        setShoeModel("");
        setShoeModel("");
        setSelectedComplaints([]);
        setSelectedInHousePresets([]);
        setCustomComplaint("");
        setCustomPrice("");
        setPriceUnknown(false);
        setIsFree(false);
        setReturnDate(format(addWeeks(new Date(), 2), "yyyy-MM-dd"));
        setAdvanceAmount("");
        setPaymentMethod("");
        setIsInHouse(false);

        // Generate new serial number
        MockService.getNextSerialNumber().then((sn) => {
            setSerialNumber(sn);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Instant visual feedback - show success immediately
        setSubmitting(true);
        setShowSuccess(true);

        // Store form data for potential retry
        // Prepare custom complaint string with In-House info if applicable
        let finalCustomComplaint = customComplaint;
        if (isInHouse && selectedInHousePresets.length > 0) {
             const presetNames = inHousePresets
                .filter(p => selectedInHousePresets.includes(p.id))
                .map(p => p.description)
                .join(", ");
             finalCustomComplaint = customComplaint 
                ? `${customComplaint} (In-House: ${presetNames})`
                : `In-House Services: ${presetNames}`;
        }

        const orderData = {
            customer_name: clientName,
            whatsapp_number: whatsapp,
            shoe_model: shoeModel,
            serial_number: serialNumber,
            status: "submitted" as const,
            // Allow standard complaints even for in-house
            complaints: complaints.filter(c => selectedComplaints.includes(c.id)), 
            custom_complaint: finalCustomComplaint,
            is_price_unknown: priceUnknown,
            total_price: finalPrice,
            expected_return_date: returnDate,
            store_id: storeId || '',
            advance_amount: advanceAmount ? parseFloat(advanceAmount) : 0,
            payment_method: paymentMethod || null,
            is_in_house: isInHouse
        };

        // Open WhatsApp immediately (non-blocking)
        const message = `Hello ${clientName}, your order for ${shoeModel} (SN: ${serialNumber}) has been received. We will notify you when it's ready!`;
        setTimeout(() => {
            openWhatsApp(whatsapp, message);
        }, 100);

        // Show success toast immediately
        setToast({ message: "Order submitted successfully!", type: 'success' });

        // Save to database in background
        try {
            await MockService.createOrder(orderData);

            // Store order data for printing
            setLastSubmittedOrder({
                ...orderData,
                orderDate: orderDate,
                finalPrice: finalPrice
            });

            // After successful save, reset form and call onSuccess
            setTimeout(() => {
                setShowSuccess(false);
                setSubmitting(false);
                resetForm();
                onSuccess();
            }, 1500);

        } catch (error: any) {
            console.error(error);

            // Revert optimistic update on error
            setShowSuccess(false);
            setSubmitting(false);

            // Show error toast
            if (error.message && error.message.includes("Duplicate Serial Number")) {
                setToast({
                    message: "Duplicate serial number. Generating new one...",
                    type: 'error'
                });
                // Auto-retry with new serial number
                MockService.getNextSerialNumber().then((sn) => {
                    setSerialNumber(sn);
                });
            } else {
                setToast({
                    message: "Failed to save order. Please try again.",
                    type: 'error'
                });
            }
        }
    };

    const toggleComplaint = (id: string) => {
        setSelectedComplaints((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleInHousePreset = (id: string) => {
        setSelectedInHousePresets((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handlePrint = () => {
        window.print();
    };

    // Phone number formatting
    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 10) {
            return cleaned;
        }
        return cleaned.slice(0, 10);
    };

    const handleWhatsappChange = (value: string) => {
        const formatted = formatPhoneNumber(value);
        setWhatsapp(formatted);

        // Validate phone number
        if (formatted && formatted.length !== 10) {
            setErrors(prev => ({ ...prev, whatsapp: 'Phone number must be 10 digits' }));
        } else {
            setErrors(prev => ({ ...prev, whatsapp: undefined }));
        }
    };

    // Validate required fields
    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!clientName.trim()) {
            newErrors.clientName = 'Customer name is required';
        }

        if (!whatsapp.trim()) {
            newErrors.whatsapp = 'WhatsApp number is required';
        } else if (whatsapp.length !== 10) {
            newErrors.whatsapp = 'Phone number must be 10 digits';
        }

        if (!shoeModel.trim()) {
            newErrors.shoeModel = 'Shoe model is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-cyan-400" /></div>;

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="max-w-2xl mx-auto glass-panel p-6 rounded-2xl relative z-10" suppressHydrationWarning>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6 neon-text">
                    New Repair Request
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" suppressHydrationWarning>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Client Name *</label>
                            <input
                                ref={clientNameRef}
                                required
                                className={cn(
                                    "w-full px-4 py-2 rounded-lg bg-white/5 border text-white focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600",
                                    errors.clientName
                                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50"
                                        : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/50"
                                )}
                                placeholder="John Doe"
                                value={clientName}
                                onChange={(e) => {
                                    setClientName(e.target.value);
                                    if (errors.clientName && e.target.value.trim()) {
                                        setErrors(prev => ({ ...prev, clientName: undefined }));
                                    }
                                }}
                                disabled={submitting}
                            />
                            {errors.clientName && (
                                <p className="text-xs text-red-400">{errors.clientName}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">WhatsApp Number *</label>
                            <input
                                required
                                type="tel"
                                maxLength={10}
                                className={cn(
                                    "w-full px-4 py-2 rounded-lg bg-white/5 border text-white focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600",
                                    errors.whatsapp
                                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50"
                                        : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/50"
                                )}
                                placeholder="9876543210"
                                value={whatsapp}
                                onChange={(e) => handleWhatsappChange(e.target.value)}
                                disabled={submitting}
                            />
                            {whatsapp && whatsapp.length === 10 && !errors.whatsapp && (
                                <p className="text-xs text-emerald-400">✓ Valid phone number</p>
                            )}
                            {errors.whatsapp && (
                                <p className="text-xs text-red-400">{errors.whatsapp}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Shoe Model *</label>
                            <input
                                required
                                className={cn(
                                    "w-full px-4 py-2 rounded-lg bg-white/5 border text-white focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600",
                                    errors.shoeModel
                                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50"
                                        : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/50"
                                )}
                                placeholder="Nike Air Jordan"
                                value={shoeModel}
                                onChange={(e) => {
                                    setShoeModel(e.target.value);
                                    if (errors.shoeModel && e.target.value.trim()) {
                                        setErrors(prev => ({ ...prev, shoeModel: undefined }));
                                    }
                                }}
                                disabled={submitting}
                            />
                            {errors.shoeModel && (
                                <p className="text-xs text-red-400">{errors.shoeModel}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Serial Number <span className="text-slate-500 font-normal">(Optional)</span></label>
                            <input
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
                                placeholder="SN-12345"
                                value={serialNumber}
                                onChange={(e) => setSerialNumber(e.target.value)}
                                disabled={submitting}
                            />
                            <div className="text-xs text-orange-400 mt-1 font-mono">Current: [{serialNumber || "Generating..."}]</div>
                        </div>
                    </div>

                    <div className="space-y-3 transition-all duration-300">
                        <div className="flex justify-between items-center">
                             <label className="text-sm font-medium text-slate-300">Select Complaints (Hub)</label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {complaints.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => toggleComplaint(c.id)}
                                    disabled={submitting}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                                        selectedComplaints.includes(c.id)
                                            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                                            : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200",
                                        submitting && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <span className="text-sm font-medium">{c.description}</span>
                                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-slate-300 border border-white/5 mx-2">
                                        {POINTS_TO_CURRENCY(c.default_price)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                        <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!customComplaint}
                                onChange={(e) => setCustomComplaint(e.target.checked ? "Custom Issue" : "")}
                                className="rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                                disabled={submitting}
                            />
                            <span>Custom Complaint / Other Issue</span>
                        </label>

                        {customComplaint && (
                            <div className="space-y-3 pl-6 border-l-2 border-white/10 mt-2">
                                <input
                                    className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500 text-sm text-white"
                                    placeholder="Describe the issue..."
                                    value={customComplaint}
                                    onChange={(e) => setCustomComplaint(e.target.value)}
                                    disabled={submitting}
                                />
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="number"
                                        disabled={priceUnknown || submitting}
                                        className="flex-1 px-4 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500 text-sm text-white"
                                        placeholder="Estimated Cost"
                                        value={customPrice}
                                        onChange={(e) => setCustomPrice(e.target.value)}
                                    />
                                    <label className="flex items-center space-x-2 text-sm text-slate-400 whitespace-nowrap cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={priceUnknown}
                                            onChange={(e) => setPriceUnknown(e.target.checked)}
                                            className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                                            disabled={submitting}
                                        />
                                        <span>Price Unknown</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Advance Payment Section */}
                    <div className="space-y-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                        <label className="text-sm font-medium text-slate-300">Advance Payment</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Amount</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="0.00"
                                    value={advanceAmount}
                                    onChange={(e) => setAdvanceAmount(e.target.value)}
                                    disabled={submitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Payment Method</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    disabled={submitting || !advanceAmount}
                                >
                                    <option value="">Select method</option>
                                    <option value="Google Pay">Google Pay</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                </select>
                            </div>
                        </div>
                        {advanceAmount && parseFloat(advanceAmount) > 0 && (
                            <div className="text-xs text-blue-300 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
                                Balance Due: {POINTS_TO_CURRENCY(Math.max(0, finalPrice - parseFloat(advanceAmount)))}
                            </div>
                        )}
                    </div>

                    {/* In-House Repair Checkbox */}
                    <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                        <label className="flex items-center space-x-3 cursor-pointer mb-3">
                            <input
                                type="checkbox"
                                checked={isInHouse}
                                onChange={(e) => setIsInHouse(e.target.checked)}
                                className="w-5 h-5 rounded border-purple-500/30 bg-purple-500/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                                disabled={submitting}
                            />
                            <div>
                                <span className="block text-sm font-bold text-purple-400">In-House Repair</span>
                                <span className="block text-xs text-purple-500/60">Don't send to Central Hub. Handle repair in-store.</span>
                            </div>
                        </label>

                         {isInHouse && (
                            <div className="pl-8 animate-in fade-in slide-in-from-top-2">
                                <p className="text-sm font-medium text-slate-300 mb-2">Select In-House Services:</p>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {inHousePresets.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => toggleInHousePreset(p.id)}
                                            disabled={submitting}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                                                selectedInHousePresets.includes(p.id)
                                                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                                                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200",
                                                submitting && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <span className="text-sm font-medium">{p.description}</span>
                                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-slate-300 border border-white/5 mx-2">
                                                {POINTS_TO_CURRENCY(p.default_price)}
                                            </span>
                                        </button>
                                    ))}
                                    {inHousePresets.length === 0 && (
                                        <p className="col-span-2 text-sm text-slate-500 italic">No in-house presets configured.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Free Service Checkbox */}
                    <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isFree}
                                onChange={(e) => {
                                    setIsFree(e.target.checked);
                                    if (e.target.checked) setPriceUnknown(false);
                                }}
                                className="w-5 h-5 rounded border-emerald-500/30 bg-emerald-500/10 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                                disabled={submitting}
                            />
                            <div>
                                <span className="block text-sm font-bold text-emerald-400">Free Service / Warranty</span>
                                <span className="block text-xs text-emerald-500/60">Customer will not be charged. Hub can still log cost.</span>
                            </div>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Order Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-500 focus:outline-none cursor-not-allowed"
                                value={orderDate}
                                readOnly
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Return Date</label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 color-scheme-dark"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                style={{ colorScheme: "dark" }}
                                disabled={submitting}
                            />
                        </div>

                        <div className="text-right col-span-2 md:col-span-1 md:col-start-2">
                            <div className="text-sm text-slate-400 mb-1">Total Estimate</div>
                            <div className={cn("text-3xl font-bold neon-text", priceUnknown ? "text-orange-400" : isFree ? "text-emerald-400" : "text-emerald-400")}>
                                {isFree ? "FREE" : (priceUnknown ? "TBD" : POINTS_TO_CURRENCY(finalPrice))}
                            </div>
                        </div>
                    </div>

                    {/* Print Button - Always visible above submit */}
                    <button
                        onClick={() => {
                            // Store current form data for printing
                            setLastSubmittedOrder({
                                customer_name: clientName,
                                whatsapp_number: whatsapp,
                                shoe_model: shoeModel,
                                serial_number: serialNumber,
                                complaints: complaints.filter(c => selectedComplaints.includes(c.id)),
                                custom_complaint: customComplaint,
                                is_price_unknown: priceUnknown,
                                orderDate: orderDate,
                                expected_return_date: returnDate,
                                finalPrice: finalPrice,
                                advance_amount: advanceAmount ? parseFloat(advanceAmount) : 0,
                                payment_method: paymentMethod || null
                            });
                            // Trigger print after a short delay to ensure state is updated
                            setTimeout(() => window.print(), 100);
                        }}
                        type="button"
                        disabled={!clientName || !whatsapp || !shoeModel}
                        className="w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 border bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Printer size={20} />
                        <span>Print Receipt</span>
                    </button>

                    <button
                        disabled={submitting}
                        type="submit"
                        className={cn(
                            "w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 border",
                            showSuccess
                                ? "bg-emerald-500 border-emerald-400/50 shadow-emerald-500/30 scale-[0.98]"
                                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/20 active:scale-[0.98] border-cyan-400/20",
                            "text-white"
                        )}
                    >
                        {showSuccess ? (
                            <>
                                <CheckCircle2 className="animate-bounce" />
                                <span>Order Submitted!</span>
                            </>
                        ) : submitting ? (
                            <>
                                <Loader2 className="animate-spin" />
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <Check />
                                <span>Submit Order & Notify Client</span>
                            </>
                        )}
                    </button>

                </form>
            </div>

            {/* Hidden Print Receipt */}
            {lastSubmittedOrder && (
                <div className="hidden print:block print:p-8">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            @page { margin: 2cm; size: auto; }
                            body { 
                                visibility: hidden; 
                                background: white !important;
                                color: black !important; /* Force black color global */
                            }
                            /* Hide everything in the body by default */
                            
                            .print-receipt { 
                                visibility: visible; 
                                position: fixed; /* Fixed puts it relative to the viewport/page */
                                left: 0; 
                                top: 0; 
                                width: 100%; 
                                color: black !important;
                                background: white;
                                z-index: 9999;
                            }
                            .print-receipt * { 
                                visibility: visible; 
                                color: black !important; /* Force black color children */
                            }
                            
                            /* Hide other common containers to prevent layout ghosts */
                            .glass-panel, form, .neon-text {
                                display: none !important;
                            }
                        }
                    ` }} />
                    <div className="print-receipt max-w-[21cm] mx-auto p-4 text-black">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold">Shoe Repair Order</h1>
                            <p className="text-sm text-gray-600 mt-1">{new Date(lastSubmittedOrder.orderDate).toLocaleDateString()}</p>
                        </div>

                        <div className="border-t-2 border-b-2 border-black py-4 mb-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="font-semibold">Customer:</p>
                                    <p>{lastSubmittedOrder.customer_name}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">WhatsApp:</p>
                                    <p>{lastSubmittedOrder.whatsapp_number}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="font-semibold text-sm">Shoe Model:</p>
                            <p className="text-lg">{lastSubmittedOrder.shoe_model}</p>
                        </div>

                        <div className="mb-4">
                            <p className="font-semibold text-sm">Serial Number:</p>
                            <p className="text-lg font-mono">{lastSubmittedOrder.serial_number}</p>
                        </div>

                        {lastSubmittedOrder.complaints && lastSubmittedOrder.complaints.length > 0 && (
                            <div className="mb-4">
                                <p className="font-semibold text-sm mb-2">Services:</p>
                                <ul className="list-disc list-inside">
                                    {lastSubmittedOrder.complaints.map((c: any, idx: number) => (
                                        <li key={idx} className="text-sm">{c.description}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {lastSubmittedOrder.custom_complaint && (
                            <div className="mb-4">
                                <p className="font-semibold text-sm">Custom Service:</p>
                                <p className="text-sm">{lastSubmittedOrder.custom_complaint}</p>
                            </div>
                        )}

                        <div className="mb-4">
                            <p className="font-semibold text-sm">Expected Return:</p>
                            <p>{new Date(lastSubmittedOrder.expected_return_date).toLocaleDateString()}</p>
                        </div>

                        <div className="border-t-2 border-black pt-4 mt-4">
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-bold">Total Price:</p>
                                <p className="text-2xl font-bold">
                                    {lastSubmittedOrder.is_price_unknown ? 'TBD' : POINTS_TO_CURRENCY(lastSubmittedOrder.finalPrice)}
                                </p>
                            </div>
                            {lastSubmittedOrder.advance_amount && lastSubmittedOrder.advance_amount > 0 && (
                                <>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-sm">Advance Paid ({lastSubmittedOrder.payment_method}):</p>
                                        <p className="text-lg font-semibold">
                                            {POINTS_TO_CURRENCY(lastSubmittedOrder.advance_amount)}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
                                        <p className="text-lg font-bold">Balance Due:</p>
                                        <p className="text-2xl font-bold">
                                            {POINTS_TO_CURRENCY(lastSubmittedOrder.finalPrice - lastSubmittedOrder.advance_amount)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-6 text-center text-xs text-gray-600">
                            <p>Thank you for your business!</p>
                            <p className="mt-1">We will notify you when your shoes are ready</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
