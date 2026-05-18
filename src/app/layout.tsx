import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeLink — Your business. One link.",
  description:
    "A professional page that wins UK tradesmen jobs. Set up in 5 minutes.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "TradeLink — Your business. One link.",
    description:
      "A professional page that wins UK tradesmen jobs. Set up in 5 minutes.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#0B0B0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "#FF6B00", colorText: "#0B0B0F" },
      }}
    >
      <html lang="en">
        <body className="min-h-screen bg-white text-ink-900 antialiased">
          {children}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
