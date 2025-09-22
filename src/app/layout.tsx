import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ReactQueryProvider from "@/lib/react-query-provider";
import { MotionConfig } from "framer-motion";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AfroWiki - African Knowledge & Culture",
  description: "AI-driven encyclopedia focused on Black and African culture, knowledge, and history.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SessionProvider>
          <ReactQueryProvider>
            <MotionConfig reducedMotion="user">
              <div className="flex flex-col min-h-screen bg-background">
                <Navbar />
                <main className="flex-1 flex flex-col pt-16">
                  {children}
                </main>
                <Footer />
              </div>
            </MotionConfig>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
