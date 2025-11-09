"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Lightbulb,
  Settings,
  BookOpen,
  FileText,
} from "lucide-react";
import { Question, Answer } from "@/types";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "@/components/markdown-renderer";

interface QuestionCardProps {
  question: Question;
  onRegenerate: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  onEditQuestion: (questionId: string, newText: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isRegenerating?: boolean;
  isReadOnly?: boolean;
  isActive?: boolean;
  onScrollIntoView?: () => void;
}

const sectionIcons: { [key: string]: React.ReactNode } = {
  Overview: <Lightbulb className="w-4 h-4" />,
  Details: <FileText className="w-4 h-4" />,
  Steps: <Settings className="w-4 h-4" />,
  Process: <Settings className="w-4 h-4" />,
  Examples: <BookOpen className="w-4 h-4" />,
  Example: <BookOpen className="w-4 h-4" />,
  Summary: <FileText className="w-4 h-4" />,
};

export function QuestionCard({
  question,
  onRegenerate,
  onDelete,
  onEditQuestion,
  onMoveUp,
  onMoveDown,
  isRegenerating = false,
  isReadOnly = false,
  isActive = false,
  onScrollIntoView,
}: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed by default
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(question.text);
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Expand when question becomes active (clicked from sidebar)
  useEffect(() => {
    if (isActive && !isExpanded && question.answer) {
      setIsExpanded(true);
    }
  }, [isActive, isExpanded, question.answer]);

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== question.text) {
      onEditQuestion(question.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(question.text);
    setIsEditing(false);
  };

  if (!question.answer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <p className="text-gray-700 dark:text-gray-300">{question.text}</p>
          {isRegenerating && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating...</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onHoverStart={() => !isReadOnly && setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden transition-colors",
        isActive
          ? "border-blue-500 dark:border-blue-400 shadow-md"
          : "border-gray-200 dark:border-gray-700"
      )}
      id={`question-${question.id}`}
    >
      {/* Question Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4">
          {/* Collapse/Expand Button */}
          {question.answer && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-0.5 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </motion.div>
            </button>
          )}
          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleSaveEdit();
                  } else if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded"
                autoFocus
              />
              <button
                onClick={handleSaveEdit}
                className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded"
              >
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded"
              >
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          ) : (
            <>
              <p 
                className="flex-1 text-gray-800 dark:text-gray-200 font-medium cursor-pointer"
                onClick={() => question.answer && setIsExpanded(!isExpanded)}
              >
                {question.text}
              </p>
              {!isReadOnly && (
                <div className="flex items-center gap-1">
                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1"
                      >
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit question"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => onRegenerate(question.id)}
                          disabled={isRegenerating}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors disabled:opacity-50"
                          title="Regenerate answer"
                        >
                          <RefreshCw
                            className={cn(
                              "w-4 h-4 text-blue-600 dark:text-blue-400",
                              isRegenerating && "animate-spin"
                            )}
                          />
                        </button>
                        {onMoveUp && (
                          <button
                            onClick={onMoveUp}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Move up"
                          >
                            <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        )}
                        {onMoveDown && (
                          <button
                            onClick={onMoveDown}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Move down"
                          >
                            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(question.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Answer Content */}
      <AnimatePresence>
        {isExpanded && question.answer && (() => {
          const answer = question.answer;
          return (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {answer.title}
                </h3>
                <div className="space-y-4">
                  {Object.entries(answer.sections).map(
                    ([sectionName, sectionContent]) => {
                      // Check if content starts with a heading - if so, render without section wrapper
                      const hasHeading = sectionContent.trim().match(/^#+\s+/m);
                      const answerSections = answer.sections;
                      const isSingleSection = Object.keys(answerSections).length === 1;
                      
                      // If it's a single section with its own headings, render directly
                      if (isSingleSection && hasHeading) {
                        return (
                          <motion.div
                            key={sectionName}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <div className="text-gray-700 dark:text-gray-300">
                              <MarkdownRenderer content={sectionContent} />
                            </div>
                          </motion.div>
                        );
                      }
                      
                      // Otherwise, show with section wrapper
                      return (
                        <motion.div
                          key={sectionName}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="border-l-4 border-blue-500 pl-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {sectionIcons[sectionName] || (
                              <FileText className="w-4 h-4" />
                            )}
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                              {sectionName}
                            </h4>
                          </div>
                          <div className="text-gray-700 dark:text-gray-300">
                            <MarkdownRenderer content={sectionContent} />
                          </div>
                        </motion.div>
                      );
                    }
                  )}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}
