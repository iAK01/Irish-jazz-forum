// MODIFICATION FOR: /middleware.ts
// CHANGE: Allow /join/* routes without authentication

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow /join/* routes without authentication for invitation flow
  if (request.nextUrl.pathname.startsWith('/join')) {
    return NextResponse.next();
  }
  
  // For now, just pass through - NextAuth handles auth for dashboard
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/steering/:path*", "/join/:path*"],
};