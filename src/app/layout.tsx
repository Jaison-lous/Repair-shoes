import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { StarBackground } from "@/components/shared/StarBackground";
import { PWARegister } from "@/components/shared/PWARegister";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shoe Repair Portal",
  description: "Premium Shoe Repair Management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shoe Repair",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-[#030014] text-slate-100 antialiased relative selection:bg-purple-500/30 selection:text-purple-200")} suppressHydrationWarning>
        <StarBackground />
        <div className="relative z-10" suppressHydrationWarning>
          {children}
        </div>
        <PWARegister />
      </body>
    </html>
  );
}
