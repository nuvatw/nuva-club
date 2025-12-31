'use client';

import { UserProvider, DatabaseProvider, SimulatedTimeProvider } from '@/lib/mock';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { TimeSimulator } from '@/components/layout/time-simulator';
import { DevGate } from '@/components/club/dev-gate';

export default function ClubPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DevGate>
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
    </DevGate>
  );
}
