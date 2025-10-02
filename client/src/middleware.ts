import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
 
// export function middleware(request: NextRequest) {
//   const url = request.nextUrl.clone()
//   url.pathname = '/dest'
//   return NextResponse.rewrite(url)
// }
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};