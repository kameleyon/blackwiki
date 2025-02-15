"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: { [key: string]: string } = {
    default: "An error occurred during authentication.",
    configuration: "There is a problem with the server configuration.",
    accessdenied: "You do not have permission to sign in.",
    verification: "The verification link is invalid or has expired.",
    credentials: "Invalid email or password. Please try again.",
    invalidcredentials: "Invalid email or password. Please try again.",
    missingcredentials: "Please provide both email and password.",
  };

  const message = error ? errorMessages[error] || errorMessages.default : errorMessages.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full mx-auto p-8"
    >
      <div className="p-6 bg-destructive/10 rounded-lg mb-6">
        <h1 className="text-2xl font-bold text-destructive mb-2">Authentication Error</h1>
        <p className="text-destructive/80">{message}</p>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <Link
          href="/auth/signin"
          className="block text-center text-primary hover:text-primary/80 transition-colors"
        >
          ← Return to Sign In
        </Link>
        <Link
          href="/"
          className="block text-center text-primary/60 hover:text-primary/80 transition-colors text-sm"
        >
          Go to Home
        </Link>
      </div>
    </motion.div>
  );
}

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
