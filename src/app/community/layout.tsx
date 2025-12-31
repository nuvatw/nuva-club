'use client';

import { UserProvider, DatabaseProvider, SimulatedTimeProvider } from '@/lib/mock';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { TimeSimulator } from '@/components/layout/time-simulator';

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SimulatedTimeProvider>
      <UserProvider>
        <DatabaseProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <div className="flex">
              <Sidebar className="hidden md:flex" />
              <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
                {children}
              </main>
            </div>
            <MobileNav className="md:hidden" />
            <TimeSimulator />
          </div>
        </DatabaseProvider>
      </UserProvider>
    </SimulatedTimeProvider>
  );
}
