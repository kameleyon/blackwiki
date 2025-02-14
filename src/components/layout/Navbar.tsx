"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleUserRound, LogOut } from "lucide-react";

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
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">{session.user.name}</span>
              <Link href="/dashboard">
                <CircleUserRound className="w-6 h-6 text-gray-300 hover:text-white transition-colors" />
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <LogOut className="w-6 h-6" />
              </button>
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
