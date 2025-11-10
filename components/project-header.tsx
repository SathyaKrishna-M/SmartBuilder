"use client";

import { Share2, Moon, Sun, Home } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AuthButton } from "@/components/auth/auth-button";

interface ProjectHeaderProps {
  projectTitle: string;
  projectId: string;
  onShare?: () => void;
}

export function ProjectHeader({
  projectTitle,
  projectId,
  onShare,
}: ProjectHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      const url = `${window.location.origin}/share/${projectId}`;
      navigator.clipboard.writeText(url);
      alert("Share link copied to clipboard!");
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-[#0A0A0A]/80 dark:bg-[#0A0A0A]/80 border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-4">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            router.push("/");
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-[#111111] dark:hover:bg-[#111111] rounded-xl transition-all duration-300"
        >
          <Home className="w-5 h-5 text-gray-400 dark:text-gray-400" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-100 dark:text-gray-100">
          {projectTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-electric to-brand-blue hover:from-brand-blue hover:to-[#60A5FA] text-white rounded-lg transition-all duration-300 text-sm font-medium shadow-[0_0_10px_rgba(30,64,255,0.3)]"
        >
          <Share2 className="w-4 h-4" />
          Share
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(59,130,246,0.2)" }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-background-cardDark dark:bg-background-cardDark border border-border-dark dark:border-border-dark hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all duration-300"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-brand-blue dark:text-brand-blue" />
          ) : (
            <Moon className="w-5 h-5 text-brand-electric dark:text-brand-electric" />
          )}
        </motion.button>

        <AuthButton />
      </div>
    </header>
  );
}
