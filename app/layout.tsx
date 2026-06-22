import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./cartProvider";

export const metadata: Metadata = {
  title: "Glaze HK — 能量水晶與銀飾",
  description: "Glaze HK 精選天然水晶與925純銀、14K鍍金飾品。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK">
      <body className="antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
