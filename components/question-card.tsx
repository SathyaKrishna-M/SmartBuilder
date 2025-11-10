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
  Tag,
} from "lucide-react";
import { Question, Answer } from "@/types";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "@/components/markdown-renderer";

interface QuestionCardProps {
  question: Question;
  onRegenerate: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  onEditQuestion: (questionId: string, newText: string) => void;
  onTopicChange?: (questionId: string, topic: string | undefined) => void;
  availableTopics?: string[];
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
  onTopicChange,
  availableTopics = [],
  isRegenerating = false,
  isReadOnly = false,
  isActive = false,
  onScrollIntoView,
}: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed by default
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(question.text);
  const [showActions, setShowActions] = useState(false);
  const [showTopicMenu, setShowTopicMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const topicMenuRef = useRef<HTMLDivElement>(null);

  // Close topic menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        topicMenuRef.current &&
        !topicMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-topic-button]')
      ) {
        setShowTopicMenu(false);
      }
    };

    if (showTopicMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showTopicMenu]);

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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="bg-background-cardLight dark:bg-background-cardDark/90 backdrop-blur-lg border border-border-light dark:border-[#1C1C1C] rounded-2xl p-6 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.5)] text-gray-200 dark:text-gray-200"
      >
        <div className="flex items-center justify-between">
          <p className="text-text-light dark:text-white">{question.text}</p>
          {isRegenerating && (
            <div className="flex items-center gap-2 text-brand-blue">
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      onHoverStart={() => !isReadOnly && setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      whileHover={{ scale: 1.01, boxShadow: "0 0 12px rgba(59,130,246,0.2)" }}
      className={cn(
        "bg-background-cardLight dark:bg-background-cardDark/90 backdrop-blur-lg border overflow-hidden transition-all duration-300 rounded-2xl mb-6",
        "shadow-[0_2px_8px_rgba(0,0,0,0.5)] text-gray-200 dark:text-gray-200",
        isActive
          ? "border-brand-blue shadow-[0_0_16px_rgba(30,64,255,0.3)] ring-2 ring-brand-blue/30"
          : "border-border-light dark:border-[#1C1C1C]"
      )}
      id={`question-${question.id}`}
    >
      {/* Question Header */}
      <div className="p-6 border-b border-border-light dark:border-[#1C1C1C]">
        <div className="flex items-start justify-between gap-4">
          {/* Collapse/Expand Button */}
          {question.answer && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="mt-0.5 p-1.5 hover:bg-[#111111] dark:hover:bg-[#111111] rounded-lg transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 200 }}
              >
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-400" />
              </motion.div>
            </motion.button>
          )}
          
          {/* Topic Badge */}
          {question.topic && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-purple-900/30 dark:bg-purple-900/30 text-purple-300 dark:text-purple-300 rounded-lg text-xs font-medium">
              <Tag className="w-3 h-3" />
              <span>{question.topic}</span>
            </div>
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
                className="flex-1 px-3 py-2 text-sm bg-background-cardDark dark:bg-background-cardDark border border-[#1C1C1C] dark:border-[#1C1C1C] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-200 dark:text-gray-200"
                autoFocus
              />
              <motion.button
                onClick={handleSaveEdit}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-[#111111] dark:hover:bg-[#111111] rounded-lg transition-colors"
              >
                <Check className="w-4 h-4 text-green-400 dark:text-green-400" />
              </motion.button>
              <motion.button
                onClick={handleCancelEdit}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-[#111111] dark:hover:bg-[#111111] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-400 dark:text-red-400" />
              </motion.button>
            </div>
          ) : (
            <>
              <p 
                className="flex-1 text-base font-medium cursor-pointer text-white dark:text-white"
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
                        {onTopicChange && (
                          <div className="relative">
                            <motion.button
                              data-topic-button
                              onClick={() => setShowTopicMenu(!showTopicMenu)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-[#111111] dark:hover:bg-[#111111] rounded-lg transition-colors"
                              title="Assign topic"
                            >
                              <Tag className="w-4 h-4 text-purple-400 dark:text-purple-400" />
                            </motion.button>
                            {showTopicMenu && (
                              <div
                                ref={topicMenuRef}
                                className="absolute right-0 top-full mt-1 z-50 bg-background-cardDark/90 dark:bg-background-cardDark/90 backdrop-blur-xl border border-border-light dark:border-[#1C1C1C] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-w-[180px] max-h-64 overflow-y-auto"
                              >
                                <div className="p-2">
                                  <div className="text-xs font-semibold text-gray-300 dark:text-gray-300 mb-2 px-2">
                                    Assign to topic
                                  </div>
                                  <button
                                    onClick={() => {
                                      onTopicChange(question.id, undefined);
                                      setShowTopicMenu(false);
                                    }}
                                    className={cn(
                                      "w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-[#111111] dark:hover:bg-[#111111] transition-colors",
                                      !question.topic && "bg-[#111111] dark:bg-[#111111]"
                                    )}
                                  >
                                    <span className="text-gray-400 dark:text-gray-400">Ungrouped</span>
                                  </button>
                                  {availableTopics.map((topic) => (
                                    <button
                                      key={topic}
                                      onClick={() => {
                                        onTopicChange(question.id, topic);
                                        setShowTopicMenu(false);
                                      }}
                                      className={cn(
                                        "w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-[#111111] dark:hover:bg-[#111111] transition-colors flex items-center justify-between",
                                        question.topic === topic && "bg-purple-900/30 dark:bg-purple-900/30"
                                      )}
                                    >
                                      <span className="text-gray-300 dark:text-gray-300">{topic}</span>
                                      {question.topic === topic && (
                                        <Check className="w-3 h-3 text-purple-300 dark:text-purple-300" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <motion.button
                          onClick={() => setIsEditing(true)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-[#111111] dark:hover:bg-[#111111] rounded-lg transition-colors"
                          title="Edit question"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                        </motion.button>
                        <motion.button
                          onClick={() => onRegenerate(question.id)}
                          disabled={isRegenerating}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-[#111111] dark:hover:bg-[#111111] rounded-lg transition-colors disabled:opacity-50"
                          title="Regenerate answer"
                        >
                          <RefreshCw
                            className={cn(
                              "w-4 h-4 text-brand-blue",
                              isRegenerating && "animate-spin"
                            )}
                          />
                        </motion.button>
                        {onMoveUp && (
                          <motion.button
                            onClick={onMoveUp}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-[#111111] dark:hover:bg-[#111111] rounded-lg transition-colors"
                            title="Move up"
                          >
                            <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                          </motion.button>
                        )}
                        {onMoveDown && (
                          <motion.button
                            onClick={onMoveDown}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-[#111111] dark:hover:bg-[#111111] rounded-lg transition-colors"
                            title="Move down"
                          >
                            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                          </motion.button>
                        )}
                        <motion.button
                          onClick={() => onDelete(question.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-[#111111] dark:hover:bg-[#111111] rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400 dark:text-red-400" />
                        </motion.button>
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
                <h3 className="text-xl font-semibold text-white dark:text-white mb-5">
                  {answer.title}
                </h3>
                <div className="space-y-5">
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
                            transition={{ duration: 0.3 }}
                          >
                            <div className="prose prose-slate dark:prose-invert max-w-none text-gray-200 dark:text-gray-200">
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
                          transition={{ duration: 0.3 }}
                          className="border-l-4 border-brand-blue pl-5 bg-[#111111]/50 dark:bg-[#111111]/50 rounded-r-xl py-3"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            {sectionIcons[sectionName] || (
                              <FileText className="w-4 h-4 text-brand-blue" />
                            )}
                            <h4 className="font-semibold text-white dark:text-white">
                              {sectionName}
                            </h4>
                          </div>
                          <div className="prose prose-slate dark:prose-invert max-w-none text-gray-200 dark:text-gray-200">
                            <MarkdownRenderer content={sectionContent} />
                          </div>
                        </motion.div>
                      );
                    }
                  )}
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <motion.button
                    onClick={() => onRegenerate(question.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-1.5 rounded-lg bg-[#1E40FF] hover:bg-brand-blue text-white text-sm font-medium transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  >
                    Regenerate
                  </motion.button>
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-1.5 rounded-lg border border-[#1C1C1C] text-sm text-gray-300 dark:text-gray-300 hover:bg-[#111111] transition-all"
                  >
                    Edit
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}
