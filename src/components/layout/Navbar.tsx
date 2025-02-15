"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { CircleUserRound } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-[#1a1a1a] h-16 fixed top-0 left-0 right-0 z-50 shadow-md shadow-black">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4">
          <Image 
            src="/bwlogo.png"
            alt="BlackWiki Logo"
            width={60}
            height={40}
            className=" h-auto mb-1"
          />
        <span className="text-xl font-bold web-only">BlackWiki</span>
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <Link href={session.user.role === 'admin' ? '/admin' : '/dashboard'}>
                <span className="text-xs sm:text-sm text-white/70 hover:text-white/90 transition-colors">{session.user.name}</span>
              </Link>
              <Link href={session.user.role === 'admin' ? '/admin' : '/dashboard'}>
                <CircleUserRound className="w-6 h-6 text-white/70 hover:text-white/90 transition-colors" />
              </Link>
            </div>
          ) : (
            <Link href="/auth/signin">
              <CircleUserRound className="w-6 h-6 text-gray-300 hover:text-white transition-colors" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
