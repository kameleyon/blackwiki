"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="bg-[#1a1a1a] h-16 fixed top-0 left-0 right-0 z-50 shadow-md shadow-black">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          BlackWiki
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                href="/articles/new"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg  transition-colors"
              >
                Create Article
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg  transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg  transition-colors"
              >
                Profile
              </Link>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
