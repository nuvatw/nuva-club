'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/error-boundary';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';

export default function ClubPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex">
            <Sidebar className="hidden md:flex" />
            <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </div>
          <MobileNav className="md:hidden" />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}
