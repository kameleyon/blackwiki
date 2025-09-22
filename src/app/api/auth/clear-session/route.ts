import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    // Get all cookies and clear NextAuth related ones
    const allCookies = cookieStore.getAll();
    
    const response = NextResponse.redirect(new URL('/auth/signin?cleared=true', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
    
    // Clear all NextAuth cookies
    allCookies.forEach((cookie: { name: string; value: string }) => {
      if (cookie.name.includes('next-auth') || 
          cookie.name.includes('session') ||
          cookie.name.includes('csrf') ||
          cookie.name.includes('callback') ||
          cookie.name.includes('state')) {
        response.cookies.delete(cookie.name);
        response.cookies.set(cookie.name, '', {
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.redirect(new URL('/auth/signin', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
  }
}