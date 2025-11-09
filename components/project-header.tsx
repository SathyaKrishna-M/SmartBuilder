"use client";

import { Share2, Moon, Sun, Home } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
    <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {projectTitle}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          <Share2 className="w-4 h-4" />
          Share
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
