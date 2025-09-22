import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Create response that will redirect to signin
    const response = NextResponse.redirect(new URL('/auth/signin?reset=true', request.url));
    
    // Clear ALL possible NextAuth cookies with multiple variations
    const cookiesToClear = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
      'next-auth.pkce.code_verifier',
      '__Secure-next-auth.pkce.code_verifier',
    ];

    // Clear cookies for multiple domains and paths
    const domains = [request.nextUrl.hostname, 'localhost'];
    const paths = ['/', '/auth', '/api', '/api/auth'];

    for (const cookie of cookiesToClear) {
      for (const domain of domains) {
        for (const path of paths) {
          // Clear with expires in the past
          response.cookies.set(cookie, '', {
            domain,
            path,
            expires: new Date(0),
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
          });
          
          // Also clear without domain (default)
          response.cookies.set(cookie, '', {
            path,
            expires: new Date(0),
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
          });
        }
      }
    }

    // Also add headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Force reset error:', error);
    // Even if there's an error, redirect to signin
    return NextResponse.redirect(new URL('/auth/signin?error=reset_failed', request.url));
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}