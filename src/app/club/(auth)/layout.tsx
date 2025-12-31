'use client';

import { DevGate } from '@/components/club/dev-gate';

export default function ClubAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DevGate>{children}</DevGate>;
}
