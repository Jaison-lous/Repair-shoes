"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StoreService } from "@/lib/store-service";

export async function login(formData: FormData) {
    const password = formData.get("password") as string;
    const role = formData.get("role") as string; // 'store' or 'hub'

    // Store authentication - check password against all stores
    if (role === "store") {
        const store = await StoreService.authenticateStore(password);

        if (store) {
            // Store authenticated! Set session with store ID
            (await cookies()).set("store_session", store.id, { httpOnly: true, path: "/" });
            (await cookies()).set("store_name", store.name, { httpOnly: true, path: "/" });
            redirect("/store");
        }
    }

    // Hub authentication
    if (role === "hub" && password === "Admin@6282") {
        (await cookies()).set("hub_session", "valid", { httpOnly: true, path: "/" });
        redirect("/hub");
    }

    return { error: "Invalid password" };
}

export async function logout() {
    (await cookies()).delete("store_session");
    (await cookies()).delete("store_name");
    (await cookies()).delete("hub_session");
    redirect("/");
}
