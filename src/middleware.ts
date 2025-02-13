import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes protection
    if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/auth/error?error=accessdenied", req.url));
      }
    }

    // Editor routes protection
    if (path.startsWith("/editor")) {
      if (token?.role !== "editor" && token?.role !== "admin") {
        return NextResponse.redirect(new URL("/auth/error?error=accessdenied", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Specify which routes to protect
export const config = {
  matcher: [
    "/admin/:path*",
    "/editor/:path*",
    "/profile/:path*",
  ],
};
