import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SomaCare (साथी) | Voice-First Elder Care Prototype",
  description: "Zero-touch conversational voice companion for seniors with automatic pharmacy fulfillment for families.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
