"use client";

import { useState, useEffect } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { Question } from "@/types";
import { cn } from "@/lib/utils";
import { reorderQuestions } from "@/lib/storage";

interface QuestionsSidebarProps {
  questions: Question[];
  projectId: string;
  activeQuestionId: string | null;
  onQuestionClick: (questionId: string) => void;
  onQuestionsReorder: () => void;
}

function QuestionItem({
  question,
  index,
  activeQuestionId,
  onQuestionClick,
}: {
  question: Question;
  index: number;
  activeQuestionId: string | null;
  onQuestionClick: (questionId: string) => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={question}
      dragControls={controls}
      className="relative list-none"
    >
      <div
        className={cn(
          "flex items-start gap-2 p-3 rounded-lg cursor-pointer group",
          "hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
          "border border-transparent",
          activeQuestionId === question.id &&
            "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
        )}
      >
        {/* Drag handle */}
        <div
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
          onClick={() => onQuestionClick(question.id)}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="flex-shrink-0 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">
              {index + 1}
            </span>
            {question.answer && (
              <span className="text-xs text-green-600 dark:text-green-400">
                ✓
              </span>
            )}
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 break-words">
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
}: QuestionsSidebarProps) {
  const [reorderItems, setReorderItems] = useState(questions);

  useEffect(() => {
    setReorderItems(questions);
  }, [questions]);

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

  if (questions.length === 0) {
    return (
      <div 
        className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Questions
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center min-h-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
            No questions yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Questions ({questions.length})
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Drag to reorder
        </p>
      </div>

      <Reorder.Group
        axis="y"
        values={reorderItems}
        onReorder={handleReorder}
        className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0"
      >
        {reorderItems.map((question, index) => (
          <QuestionItem
            key={question.id}
            question={question}
            index={index}
            activeQuestionId={activeQuestionId}
            onQuestionClick={onQuestionClick}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}
