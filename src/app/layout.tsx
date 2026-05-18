import type { Metadata, Viewport } from "next";
import { Archivo_Black, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const display = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

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
  themeColor: "#0F172A",
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
        variables: { colorPrimary: "#F97316", colorText: "#0F172A" },
      }}
    >
      <html lang="en" className={`${display.variable} ${body.variable}`}>
        <body className="min-h-screen bg-white font-sans text-ink-900 antialiased">
          {children}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
