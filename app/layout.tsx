import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fe5oo ",
  description: "نظام إدارة صالون الحلاقة",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
