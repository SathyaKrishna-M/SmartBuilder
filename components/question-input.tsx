"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuestionInputProps {
  onSend: (question: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function QuestionInput({
  onSend,
  isLoading = false,
  disabled = false,
}: QuestionInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading && !disabled) {
      onSend(question.trim());
      setQuestion("");
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading || disabled}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500"
          )}
        />
        <motion.button
          type="submit"
          disabled={!question.trim() || isLoading || disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "px-6 py-3 bg-blue-600 text-white rounded-lg",
            "hover:bg-blue-700 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-2"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
