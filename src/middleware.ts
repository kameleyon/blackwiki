import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { compressMiddleware } from "@/lib/compression-middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // CRITICAL: Detect and clear broken JWT cookies to prevent infinite loops
  // Skip auth loop detection for force-reset flows and auth pages
  if (!pathname.startsWith('/api/auth/force-reset') && 
      !pathname.startsWith('/_next') && 
      !pathname.startsWith('/auth/signin')) {
    try {
      const cookies = request.cookies;
      const sessionToken = cookies.get('next-auth.session-token')?.value || 
                           cookies.get('__Secure-next-auth.session-token')?.value;
      
      if (sessionToken) {
        // Check if token looks malformed - only check for severely broken tokens
        const parts = sessionToken.split('.');
        
        // Only redirect if JWT is severely malformed (not a valid JWT structure)
        if (parts.length !== 3) {
          console.log('🔧 Detected malformed JWT token, forcing reset');
          return NextResponse.redirect(new URL('/api/auth/force-reset', request.url));
        }
      }
    } catch (error) {
      console.error('JWT detection error:', error);
      // Only redirect on actual errors, not normal flow
      if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/api/auth/force-reset', request.url));
      }
    }
  }

  // Clone the response
  const response = NextResponse.next();

  // Add cache control headers for static assets and pages
  const url = request.nextUrl.pathname;
  
  // Cache static assets longer
  if (url.startsWith('/images') || url.startsWith('/_next/static') || url.includes('.')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  } 
  // Cache pages but allow revalidation
  else if (!url.startsWith('/api/') && !url.startsWith('/dashboard')) {
    response.headers.set(
      'Cache-Control',
      's-maxage=60, stale-while-revalidate=300'
    );
  }

  // Apply compression
  try {
    // Use the simplified compression middleware
    const compressedResponse = await compressMiddleware(request);
    
    // Copy compression headers to our response
    if (compressedResponse.headers.has('Content-Encoding')) {
      response.headers.set('Content-Encoding', compressedResponse.headers.get('Content-Encoding') || '');
    }
    
    if (compressedResponse.headers.has('Vary')) {
      response.headers.set('Vary', compressedResponse.headers.get('Vary') || '');
    }
  } catch (error) {
    console.error('Compression middleware error:', error);
  }

  return response;
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
