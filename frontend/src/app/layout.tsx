import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FloodGuard X — Urban Flood Intelligence & Intervention Planning",
  description: "Enterprise geospatial analytics, calibrated machine learning, and OLAP data warehouse for Mumbai Metropolitan Region",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F5F2] text-[#242722] antialiased">
        {children}
      </body>
    </html>
  );
}
