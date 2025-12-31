'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar className="hidden md:flex" />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            {children}
          </main>
        </div>
        <MobileNav className="md:hidden" />
      </div>
    </AuthProvider>
  );
}
