"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const password = formData.get("password") as string;
    const role = formData.get("role") as string; // 'store' or 'hub'

    if (role === "store" && password === "Jaison@6282") {
        (await cookies()).set("store_session", "valid", { httpOnly: true, path: "/" });
        redirect("/store");
    }

    if (role === "hub" && password === "Admin@6282") {
        (await cookies()).set("hub_session", "valid", { httpOnly: true, path: "/" });
        redirect("/hub");
    }

    return { error: "Invalid password" };
}

export async function logout() {
    (await cookies()).delete("store_session");
    (await cookies()).delete("hub_session");
    redirect("/");
}
