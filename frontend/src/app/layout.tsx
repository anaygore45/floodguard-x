import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "FloodGuard-X: Counterfactual City",
  description: "Predict the Risk. Test the Solution. Prevent the Impact. Urban Flood Intelligence & Counterfactual Intervention Planning System for Mumbai.",
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
