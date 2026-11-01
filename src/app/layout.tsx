import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";

export const metadata: Metadata = {
  title: "College Hall Ticket & Examination Generator",
  description: "Official examination management, candidate eligibility, and verifiable admit card issuing system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0c0d10] text-[#f3f4f6]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
