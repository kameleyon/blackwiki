import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// Console error monitoring to detect JWT_SESSION_ERROR
let hasJWTError = false;

// Override console.error temporarily to detect JWT errors
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args.join(' ');
  if (message.includes('JWT_SESSION_ERROR') || message.includes('JWEDecryptionFailed')) {
    hasJWTError = true;
  }
  originalConsoleError.apply(console, args);
};

export async function getValidSession() {
  // Reset error flag
  hasJWTError = false;
  
  try {
    const session = await getServerSession();
    
    // Give NextAuth a moment to process and potentially error
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if JWT error occurred during session retrieval
    if (hasJWTError) {
      console.log("JWT decryption error detected - redirecting to clear session");
      redirect('/auth/clear-session');
    }
    
    return session;
  } catch (error) {
    console.error("Session error:", error);
    redirect('/auth/clear-session');
  }
}

export function clearJWTErrorFlag() {
  hasJWTError = false;
}