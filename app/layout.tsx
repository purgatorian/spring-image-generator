import { cookies } from "next/headers";

import {
  ClerkProvider,
  ClerkAppearence,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Providers } from '@/components/providers'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { dark, neobrutalism, shadesOfPurple } from '@clerk/themes'
import { ThemeProvider } from 'next-themes'

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
  // Icons are Optional
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
          }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            storageKey="theme" // Optional. The default is "theme"
            enableSystem
            disableTransitionOnChange
          >
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <main>
                  <SidebarTrigger />
                  {children}
                </main>
              </SidebarProvider>{" "}
              <UserButton />
            </SignedIn>
            </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
