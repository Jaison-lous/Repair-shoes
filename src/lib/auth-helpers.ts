import { cookies } from "next/headers";

export async function getCurrentStoreId(): Promise<string | null> {
    const cookieStore = await cookies();
    const storeSession = cookieStore.get("store_session");
    return storeSession?.value || null;
}

export async function getCurrentStoreName(): Promise<string | null> {
    const cookieStore = await cookies();
    const storeName = cookieStore.get("store_name");
    return storeName?.value || null;
}
