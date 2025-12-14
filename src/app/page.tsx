import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default async function Home() {
  const cookieStore = await cookies();
  const storeSession = cookieStore.get("store_session");
  const hubSession = cookieStore.get("hub_session");

  if (storeSession) redirect("/store");
  if (hubSession) redirect("/hub");

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
