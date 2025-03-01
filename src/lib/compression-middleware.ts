import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import compression from 'compression';

// Skip compression for certain file types
const shouldCompress = (url: string): boolean => {
  // Skip compression for API routes that handle file uploads
  if (url.startsWith('/api/media/upload')) {
    return false;
  }
  
  // Skip compression for static assets that are already compressed
  if (
    url.endsWith('.jpg') ||
    url.endsWith('.jpeg') ||
    url.endsWith('.png') ||
    url.endsWith('.webp') ||
    url.endsWith('.gif') ||
    url.endsWith('.ico') ||
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.mp3') ||
    url.endsWith('.woff') ||
    url.endsWith('.woff2')
  ) {
    return false;
  }
  
  return true;
};

// Middleware to apply compression
export async function compressMiddleware(request: NextRequest) {
  const url = request.nextUrl.pathname;
  
  // Skip compression for certain file types
  if (!shouldCompress(url)) {
    return NextResponse.next();
  }
  
  // For other routes, add compression headers
  const response = NextResponse.next();
  response.headers.set('Content-Encoding', 'gzip');
  response.headers.set('Vary', 'Accept-Encoding');
  
  return response;
}

// Export a simplified version for API routes
export function withCompression(handler: Function) {
  return async (req: NextRequest, ...args: unknown[]) => {
    const url = req.nextUrl.pathname;
    
    // Skip compression for certain file types
    if (!shouldCompress(url)) {
      return handler(req, ...args);
    }
    
    // For other routes, continue with the handler
    // The actual compression will be handled by the server
    return handler(req, ...args);
  };
}
