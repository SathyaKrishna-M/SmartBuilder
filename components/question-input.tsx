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
    <div className="border-t border-border-light dark:border-border-dark bg-background-cardDark/80 dark:bg-background-cardDark/80 backdrop-blur-xl p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading || disabled}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg border border-border-light dark:border-[#1C1C1C]",
            "bg-background-cardDark dark:bg-background-cardDark text-gray-200 dark:text-gray-200",
            "focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300",
            "placeholder:text-gray-500 dark:placeholder:text-gray-500"
          )}
        />
        <motion.button
          type="submit"
          disabled={!question.trim() || isLoading || disabled}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "px-6 py-3 bg-gradient-to-r from-brand-electric to-brand-blue hover:from-brand-blue hover:to-[#60A5FA] text-white rounded-lg font-medium",
            "transition-all duration-300 shadow-[0_0_10px_rgba(30,64,255,0.3)]",
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
