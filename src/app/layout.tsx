import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { TenantProvider } from "@/providers/TenantProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "XperMed - Smart Pharmacy ERP",
  description: "Next-gen billing and inventory for pharmacists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.className} antialiased`}
      >
        <TenantProvider>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}
