import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TrackingProvider } from "@/features/tracking/provider/TrackingProvider";
import { APP_NAME } from "@/utils/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Rastreie encomendas por CPF no SSW.",
  icons: {
    icon: "/images/hyerlogo.jpg",
    shortcut: "/images/hyerlogo.jpg",
    apple: "/images/hyerlogo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-100 text-slate-900">
        <TrackingProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </TrackingProvider>
      </body>
    </html>
  );
}
