"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SignOut() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-8 bg-white/5 rounded-xl shadow-lg">
        <div className="flex justify-center mb-4">
          <Image 
            src="/logo.png" 
            alt="AfroWiki Logo" 
            width={100} 
            height={100} 
            className="rounded-2xl"
          />
        </div>
        
        <h1 className="text-3xl font-normal text-center mb-4 text-white/90">Sign Out</h1>
        
        <p className="text-white/70 text-center mb-4">
          Are you sure you want to sign out?
        </p>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full bg-white/10 hover:bg-white/20 text-white/90 font-medium py-3 rounded-lg transition-colors"
          >
            {isLoading ? "Signing out..." : "Sign out"}
          </button>
          
          <Link 
            href="/dashboard" 
            className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-white/80 font-medium py-3 rounded-lg transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
