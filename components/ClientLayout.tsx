'use client';

import {
  ClerkProvider,
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { dark } from '@clerk/themes';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

interface ClientLayoutProps {
  children: React.ReactNode;
  defaultOpen: boolean | undefined;
}

export default function ClientLayout({
  children,
  defaultOpen,
}: ClientLayoutProps) {
  const [showSignUp, setShowSignUp] = useState(false); // Toggle between SignIn and SignUp

  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        storageKey="theme"
        enableSystem
        disableTransitionOnChange
      >
        {/* Show Sign In or Sign Up when the user is signed out */}
        <SignedOut>
          <main
            style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              width: '100vw',
            }}
          >
            {showSignUp ? (
              <SignUp routing="hash" afterSignInUrl="/" afterSignUpUrl="/" />
            ) : (
              <SignIn routing="hash" afterSignInUrl="/" />
            )}

            {/* Toggle between Sign In and Sign Up */}
            <button
              onClick={() => setShowSignUp(!showSignUp)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              {showSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </main>

          {/* Disable background interactions */}
          <style jsx global>{`
            body {
              pointer-events: none;
              overflow: hidden;
            }
            main,
            button,
            div {
              pointer-events: all;
            }
          `}</style>
        </SignedOut>

        {/* Show the app when the user is signed in */}
        <SignedIn>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <main style={{ height: '100vh', width: '100vw' }}>
              <SidebarTrigger />
              {children}
            </main>
          </SidebarProvider>
          <UserButton />
        </SignedIn>
      </ThemeProvider>
    </ClerkProvider>
  );
}
