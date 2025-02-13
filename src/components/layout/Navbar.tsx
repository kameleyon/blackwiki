"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-secondary/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          BlackWiki
        </Link>

        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full border-2 border-primary/50 border-t-transparent animate-spin" />
          ) : session ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4"
            >
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "Profile"}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium">{session.user?.name}</span>
              <Link
                href="/profile"
                className="px-4 py-2 text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </motion.div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-2 text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
