import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Spring Print Generator',
  description: 'Generate prints, clothing, models, and variants for your Spring collection.',
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/mobile-icon.png',
        href: '/mobile-icon.png'
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/mobile-icon.png',
        href: '/mobile-icon.png'
      }
    ]
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  // ✅ Sidebar defaults to `true` if the cookie is missing
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true" || !cookieStore.get("sidebar:state");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientLayout defaultOpen={defaultOpen}>
          {children}
        </ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
