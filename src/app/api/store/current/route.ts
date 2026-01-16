import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    const cookieStore = await cookies();
    let storeId = cookieStore.get("store_session")?.value || null;
    let storeName = cookieStore.get("store_name")?.value || null;

    // Validate storeId against database if present
    if (storeId && supabase) {
        const { data, error } = await supabase
            .from('stores')
            .select('id, name')
            .eq('id', storeId)
            .single();

        if (error || !data) {
            console.warn(`Invalid store session detected: ${storeId}. Clearing session.`);
            storeId = null;
            storeName = null;
        } else {
             // Optional: Update store name if it changed in DB
             storeName = data.name;
        }
    }

    return NextResponse.json({ storeId, storeName });
}
