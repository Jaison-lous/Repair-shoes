import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { StarBackground } from "@/components/shared/StarBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shoe Repair Portal",
  description: "Premium Shoe Repair Management",
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
      </body>
    </html>
  );
}
