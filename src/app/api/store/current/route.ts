import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const storeId = cookieStore.get("store_session")?.value || null;
    const storeName = cookieStore.get("store_name")?.value || null;

    return NextResponse.json({ storeId, storeName });
}
