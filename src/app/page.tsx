"use client";

import { motion } from "framer-motion";
import SearchBar from "@/components/ui/SearchBar";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="container mx-auto px-4 py-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="flex justify-center w-full mb-8">
          <Image 
            src="/afrowiki.png"
            alt="AfroWiki Logo"
            width={200}
            height={150}
            className="h-auto"
            priority
          />
        </div>
          
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg text-muted-foreground mb-4"
        >
          Explore the rich tapestry of Black history, culture, and knowledge
        </motion.p>
      </motion.div>

      <SearchBar onSearch={handleSearch} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12 mb-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto"
      >
        <div className="p-4">
          <h2 className="text-xl font-normal text-white/80 mb-2">History & Heritage</h2>
          <p className="text-muted-foreground">Discover the rich history and cultural heritage of the African diaspora</p>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-normal text-white/80 mb-2">Art & Culture</h2>
          <p className="text-muted-foreground">Explore Black art, music, literature, and cultural expressions</p>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-normal text-white/80 mb-2">Innovation & Impact</h2>
          <p className="text-muted-foreground">Learn about Black innovators, leaders, and their global impact</p>
        </div>
      </motion.div>
    </div>
  );
}
