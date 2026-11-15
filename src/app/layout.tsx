import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SomaCare (साथी) | Voice-First Elder Care Prototype",
  description: "A voice-first elder care prototype for shared medication routines, appointments, and caregiver coordination.",
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
