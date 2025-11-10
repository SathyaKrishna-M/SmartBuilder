"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Reorder, useDragControls, AnimatePresence } from "framer-motion";
import { GripVertical, Tag, ChevronDown, ChevronRight } from "lucide-react";
import { Question } from "@/types";
import { cn } from "@/lib/utils";
import { reorderQuestions } from "@/lib/storage";
import { TopicManager } from "./topic-manager";

interface QuestionsSidebarProps {
  questions: Question[];
  projectId: string;
  activeQuestionId: string | null;
  onQuestionClick: (questionId: string) => void;
  onQuestionsReorder: () => void;
  onTopicChange?: (questionId: string, topic: string | undefined) => void;
  onAvailableTopicsChange?: (topics: string[]) => void;
}

function QuestionItem({
  question,
  index,
  activeQuestionId,
  onQuestionClick,
  topicIndex,
}: {
  question: Question;
  index: number;
  activeQuestionId: string | null;
  onQuestionClick: (questionId: string) => void;
  topicIndex: number;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={question}
      dragControls={controls}
      className="relative list-none"
    >
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", question.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={(e) => {
          // Reset cursor after drag
          e.currentTarget.style.cursor = "grab";
        }}
        className={cn(
          "flex items-start gap-2 p-3 rounded-lg cursor-pointer group transition-all duration-300",
          "hover:bg-[#111111]/60 dark:hover:bg-[#111111]/60",
          "border border-transparent",
          activeQuestionId === question.id &&
            "bg-[#111111] dark:bg-[#111111] text-brand-blue shadow-[0_0_12px_rgba(59,130,246,0.25)]"
        )}
        style={{ cursor: "grab" }}
        onMouseDown={(e) => {
          // Only start drag if clicking on the drag handle area
          const target = e.target as HTMLElement;
          if (!target.closest('[data-drag-handle]')) {
            // Regular click - don't interfere
            return;
          }
        }}
      >
        {/* Drag handle */}
        <div
          data-drag-handle
          className="mt-0.5 p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing transition-opacity"
          onPointerDown={(e) => {
            controls.start(e);
            e.preventDefault();
          }}
        >
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Question number and text - clickable */}
        <div 
          className="flex-1 min-w-0"
          onClick={(e) => {
            e.stopPropagation();
            onQuestionClick(question.id);
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="flex-shrink-0 text-xs font-semibold text-brand-blue bg-[#111111] dark:bg-[#111111] px-2 py-0.5 rounded-lg">
              {topicIndex + 1}
            </span>
            {question.answer && (
              <span className="text-xs text-green-400 dark:text-green-400">
                ✓
              </span>
            )}
            {question.topic && (
              <span className="flex items-center gap-0.5 text-xs text-purple-300 dark:text-purple-300 bg-purple-900/30 dark:bg-purple-900/30 px-1.5 py-0.5 rounded-lg">
                <Tag className="w-2.5 h-2.5" />
                <span className="truncate max-w-[80px]">{question.topic}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-300 dark:text-gray-300 line-clamp-2 break-words">
            {question.text}
          </p>
        </div>
      </div>
    </Reorder.Item>
  );
}

export function QuestionsSidebar({
  questions,
  projectId,
  activeQuestionId,
  onQuestionClick,
  onQuestionsReorder,
  onTopicChange,
  onAvailableTopicsChange,
}: QuestionsSidebarProps) {
  const [reorderItems, setReorderItems] = useState(questions);
  const [collapsedTopics, setCollapsedTopics] = useState<Set<string>>(new Set());
  const [localPendingTopics, setLocalPendingTopics] = useState<string[]>([]);

  useEffect(() => {
    setReorderItems(questions);
  }, [questions]);

  // Memoize the topics change handler to prevent infinite loops
  const handleTopicsChange = useCallback((allTopics: string[]) => {
    // Extract pending topics (topics with no questions)
    const assignedTopics = new Set(questions.map((q) => q.topic).filter(Boolean) as string[]);
    const pending = allTopics.filter(t => !assignedTopics.has(t));
    setLocalPendingTopics(pending);
    if (onAvailableTopicsChange) {
      onAvailableTopicsChange(allTopics);
    }
  }, [questions, onAvailableTopicsChange]);

  // Group questions by topic
  const groupedQuestions = useMemo(() => {
    const grouped: Record<string, Question[]> = {
      "": [], // Ungrouped questions
    };
    
    questions.forEach((q) => {
      const topic = q.topic || "";
      if (!grouped[topic]) {
        grouped[topic] = [];
      }
      grouped[topic].push(q);
    });
    
    return grouped;
  }, [questions]);

  // Get all topics sorted (empty string last), including pending topics
  const topics = useMemo(() => {
    const topicSet = new Set<string>();
    // Add topics from questions
    Object.keys(groupedQuestions).forEach(t => {
      if (t !== "") topicSet.add(t);
    });
    // Add pending topics
    localPendingTopics.forEach(t => topicSet.add(t));
    const topicList = Array.from(topicSet).sort();
    return [...topicList, ""];
  }, [groupedQuestions, localPendingTopics]);

  const handleReorder = async (newOrder: Question[]) => {
    setReorderItems(newOrder);
    const questionIds = newOrder.map((q) => q.id);
    try {
      await reorderQuestions(projectId, questionIds);
      onQuestionsReorder();
    } catch (error) {
      console.error("Error reordering questions:", error);
      // Revert to original order on error
      setReorderItems(questions);
    }
  };

  const toggleTopic = (topic: string) => {
    setCollapsedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return next;
    });
  };

  if (questions.length === 0) {
    return (
      <div 
        className="w-64 bg-background-cardDark/80 dark:bg-background-cardDark/80 backdrop-blur-xl border-r border-border-light dark:border-border-dark flex flex-col h-full"
      >
        <div className="p-4 border-b border-border-light dark:border-border-dark flex-shrink-0">
          <h2 className="text-sm font-medium tracking-wider text-gray-400 dark:text-gray-400 uppercase">
            Questions
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center min-h-0">
          <p className="text-xs text-gray-400 dark:text-gray-400 text-center px-4">
            No questions yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-64 bg-background-cardDark/80 dark:bg-background-cardDark/80 backdrop-blur-xl border-r border-border-light dark:border-border-dark flex flex-col h-full"
    >
      <div className="p-4 border-b border-border-light dark:border-border-dark flex-shrink-0">
        <h2 className="text-sm font-medium tracking-wider text-gray-400 dark:text-gray-400 uppercase">
          Questions ({questions.length})
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Drag to reorder
        </p>
      </div>

      {/* Topic Manager */}
      {onTopicChange && (
        <TopicManager
          questions={questions}
          onTopicChange={onTopicChange}
          onTopicsChange={handleTopicsChange}
        />
      )}

      {/* Grouped Questions */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
        {topics.map((topic) => {
          const topicQuestions = groupedQuestions[topic] || [];
          // Show topic even if empty (for pending topics)
          const isPending = localPendingTopics.includes(topic) && topicQuestions.length === 0;
          if (topicQuestions.length === 0 && !isPending && topic !== "") return null;
          
          const isCollapsed = collapsedTopics.has(topic);
          const topicLabel = topic || "Ungrouped";

          return (
            <div key={topic} className="space-y-1">
              {/* Topic Header - Drop Zone */}
              {topic && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add("bg-purple-100/80", "dark:bg-purple-900/30");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("bg-purple-100/80", "dark:bg-purple-900/30");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove("bg-purple-100/80", "dark:bg-purple-900/30");
                    const questionId = e.dataTransfer.getData("text/plain");
                    if (questionId && onTopicChange) {
                      onTopicChange(questionId, topic);
                    }
                  }}
                  className="w-full rounded-xl transition-colors"
                >
                  <button
                    onClick={() => toggleTopic(topic)}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-300 dark:text-gray-300 hover:bg-[#111111]/60 dark:hover:bg-[#111111]/60 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      <Tag className="w-3 h-3 text-purple-400 dark:text-purple-400" />
                      <span>{topicLabel}</span>
                      {isPending && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-500 ml-1">
                          (pending)
                        </span>
                      )}
                      <span className="text-gray-500 dark:text-gray-500">
                        ({topicQuestions.length})
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {/* Questions in this topic */}
              {!isCollapsed && (
                <Reorder.Group
                  axis="y"
                  values={topicQuestions}
                  onReorder={(newOrder) => {
                    // Merge with other topics maintaining order
                    const allQuestions = topics.flatMap((t) => {
                      if (t === topic) return newOrder;
                      return groupedQuestions[t] || [];
                    });
                    handleReorder(allQuestions);
                  }}
                  className="space-y-1"
                >
                  <AnimatePresence>
                    {topicQuestions.map((question, index) => (
                      <QuestionItem
                        key={question.id}
                        question={question}
                        index={index}
                        activeQuestionId={activeQuestionId}
                        onQuestionClick={onQuestionClick}
                        topicIndex={index}
                      />
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
