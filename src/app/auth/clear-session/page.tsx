"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClearSession() {
  const router = useRouter();

  useEffect(() => {
    const clearSession = async () => {
      try {
        // Force sign out to clear all session data
        await signOut({ 
          redirect: false,
          callbackUrl: "/auth/signin"
        });
        
        // Clear any remaining cookies manually
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          if (name.trim().includes("next-auth") || name.trim().includes("session")) {
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
          }
        });
        
        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        
        // Wait a moment then redirect
        setTimeout(() => {
          router.push("/auth/signin?message=session_cleared");
        }, 1000);
        
      } catch (error) {
        console.error("Error clearing session:", error);
        // Force redirect even if clearing fails
        router.push("/auth/signin?message=session_cleared");
      }
    };

    clearSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/70">Clearing session data...</p>
      </div>
    </div>
  );
}