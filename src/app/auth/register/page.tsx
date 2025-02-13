"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      // Redirect to sign in page on success
      router.push("/auth/signin?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-auto p-8"
      >
        <h1 className="text-4xl font-bold text-center mb-8">Create Account</h1>
        <p className="text-muted-foreground text-center mb-8">
          Join BlackWiki to contribute to the knowledge base
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/5 rounded-lg focus:ring-2 focus:ring-primary pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8C16 8 13 2.5 8 2.5C7.439 2.5 6.902 2.564 6.398 2.68L7.449 3.731C7.627 3.705 7.811 3.688 8 3.688C10.684 3.688 12.866 5.87 12.866 8.554C12.866 8.743 12.849 8.927 12.823 9.105L13.359 11.238ZM11.297 9.042L9.454 7.199C9.484 6.988 9.5 6.772 9.5 6.554C9.5 5.46 8.594 4.554 7.5 4.554C7.282 4.554 7.066 4.57 6.855 4.6L5.297 3.042C5.923 2.701 6.637 2.5 7.5 2.5C9.984 2.5 12 4.516 12 7C12 7.863 11.799 8.577 11.458 9.203L11.297 9.042Z" fill="currentColor"/>
                    <path d="M14.292 13.292L11.163 10.163C10.591 10.69 9.852 11 9 11C6.516 11 4.5 8.984 4.5 6.5C4.5 5.648 4.81 4.909 5.337 4.337L2.708 1.708L2 2.416L13.584 14L14.292 13.292Z" fill="currentColor"/>
                    <path d="M7.5 8.554C7.5 8.78 7.526 9 7.572 9.212L6.212 7.852C6 7.898 5.78 7.924 5.554 7.924C4.46 7.924 3.554 7.018 3.554 5.924C3.554 5.698 3.58 5.478 3.626 5.266L2.266 3.906C2.054 3.952 1.834 3.978 1.608 3.978C0.514 3.978 -0.392 3.072 -0.392 1.978C-0.392 1.752 -0.366 1.532 -0.32 1.32L1.04 2.68C1.218 2.654 1.402 2.637 1.591 2.637C4.275 2.637 6.457 4.819 6.457 7.503C6.457 7.692 6.44 7.876 6.414 8.054L7.5 8.554Z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3C4.5 3 1.5 6.5 1.5 8C1.5 9.5 4.5 13 8 13C11.5 13 14.5 9.5 14.5 8C14.5 6.5 11.5 3 8 3ZM8 11C6.343 11 5 9.657 5 8C5 6.343 6.343 5 8 5C9.657 5 11 6.343 11 8C11 9.657 9.657 11 8 11Z" fill="currentColor"/>
                    <path d="M8 6C6.897 6 6 6.897 6 8C6 9.103 6.897 10 8 10C9.103 10 10 9.103 10 8C10 6.897 9.103 6 8 6Z" fill="currentColor"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/5 rounded-lg focus:ring-2 focus:ring-primary pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8C16 8 13 2.5 8 2.5C7.439 2.5 6.902 2.564 6.398 2.68L7.449 3.731C7.627 3.705 7.811 3.688 8 3.688C10.684 3.688 12.866 5.87 12.866 8.554C12.866 8.743 12.849 8.927 12.823 9.105L13.359 11.238ZM11.297 9.042L9.454 7.199C9.484 6.988 9.5 6.772 9.5 6.554C9.5 5.46 8.594 4.554 7.5 4.554C7.282 4.554 7.066 4.57 6.855 4.6L5.297 3.042C5.923 2.701 6.637 2.5 7.5 2.5C9.984 2.5 12 4.516 12 7C12 7.863 11.799 8.577 11.458 9.203L11.297 9.042Z" fill="currentColor"/>
                    <path d="M14.292 13.292L11.163 10.163C10.591 10.69 9.852 11 9 11C6.516 11 4.5 8.984 4.5 6.5C4.5 5.648 4.81 4.909 5.337 4.337L2.708 1.708L2 2.416L13.584 14L14.292 13.292Z" fill="currentColor"/>
                    <path d="M7.5 8.554C7.5 8.78 7.526 9 7.572 9.212L6.212 7.852C6 7.898 5.78 7.924 5.554 7.924C4.46 7.924 3.554 7.018 3.554 5.924C3.554 5.698 3.58 5.478 3.626 5.266L2.266 3.906C2.054 3.952 1.834 3.978 1.608 3.978C0.514 3.978 -0.392 3.072 -0.392 1.978C-0.392 1.752 -0.366 1.532 -0.32 1.32L1.04 2.68C1.218 2.654 1.402 2.637 1.591 2.637C4.275 2.637 6.457 4.819 6.457 7.503C6.457 7.692 6.44 7.876 6.414 8.054L7.5 8.554Z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3C4.5 3 1.5 6.5 1.5 8C1.5 9.5 4.5 13 8 13C11.5 13 14.5 9.5 14.5 8C14.5 6.5 11.5 3 8 3ZM8 11C6.343 11 5 9.657 5 8C5 6.343 6.343 5 8 5C9.657 5 11 6.343 11 8C11 9.657 9.657 11 8 11Z" fill="currentColor"/>
                    <path d="M8 6C6.897 6 6 6.897 6 8C6 9.103 6.897 10 8 10C9.103 10 10 9.103 10 8C10 6.897 9.103 6 8 6Z" fill="currentColor"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-500 hover:bg-secondary/80 text-primary font-medium py-2 rounded-lg transition-colors"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-6">
          By creating an account, you agree to contribute to and help maintain the accuracy
          and quality of our content.
        </p>
      </motion.div>
    </div>
  );
}
