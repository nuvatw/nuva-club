import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// For demo purposes, middleware just passes through
// Role-based routing is handled client-side via mock user context

export function middleware(req: NextRequest) {
  // Allow all routes for the demo
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
