"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { X, Plus, Tag, ChevronDown, ChevronRight } from "lucide-react";
import { Question } from "@/types";
import { cn } from "@/lib/utils";

interface TopicManagerProps {
  questions: Question[];
  onTopicChange: (questionId: string, topic: string | undefined) => void;
  onTopicsChange?: (topics: string[]) => void; // Callback to notify parent of all topics (including pending)
}

export function TopicManager({ questions, onTopicChange, onTopicsChange }: TopicManagerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newTopicName, setNewTopicName] = useState("");
  const [showNewTopicInput, setShowNewTopicInput] = useState(false);
  const [pendingTopics, setPendingTopics] = useState<Set<string>>(new Set());

  // Get all unique topics from questions + pending topics
  const topics = useMemo(() => {
    const topicSet = new Set<string>();
    questions.forEach((q) => {
      if (q.topic) {
        topicSet.add(q.topic);
      }
    });
    // Add pending topics that haven't been assigned yet
    pendingTopics.forEach((topic) => {
      if (!topicSet.has(topic)) {
        topicSet.add(topic);
      }
    });
    return Array.from(topicSet).sort();
  }, [questions, pendingTopics]);

  // Group questions by topic
  const questionsByTopic = useMemo(() => {
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

  const handleCreateTopic = () => {
    const topicName = newTopicName.trim();
    if (topicName) {
      // Add to pending topics so it shows up in the list
      setPendingTopics((prev) => new Set(prev).add(topicName));
      setNewTopicName("");
      setShowNewTopicInput(false);
    }
  };

  // Remove from pending topics when a question is assigned to it
  useEffect(() => {
    const assignedTopics = new Set(questions.map((q) => q.topic).filter(Boolean) as string[]);
    setPendingTopics((prev) => {
      const next = new Set(prev);
      prev.forEach((topic) => {
        if (assignedTopics.has(topic)) {
          next.delete(topic);
        }
      });
      return next;
    });
  }, [questions]);

  // Notify parent of all topics (including pending)
  // Use a ref to track previous topics to prevent infinite loops
  const prevTopicsRef = useRef<string[]>([]);
  useEffect(() => {
    // Only call if topics actually changed (deep comparison)
    const topicsChanged = 
      topics.length !== prevTopicsRef.current.length ||
      topics.some((topic, index) => topic !== prevTopicsRef.current[index]);
    
    if (topicsChanged && onTopicsChange) {
      prevTopicsRef.current = topics;
      onTopicsChange(topics);
    }
  }, [topics, onTopicsChange]);

  const handleAssignToTopic = (questionId: string, topic: string) => {
    onTopicChange(questionId, topic || undefined);
  };

  const handleRemoveTopic = (topic: string) => {
    // Remove topic from all questions in that topic
    questionsByTopic[topic]?.forEach((q) => {
      onTopicChange(q.id, undefined);
    });
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Topics ({topics.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* Create new topic */}
          {showNewTopicInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateTopic();
                  } else if (e.key === "Escape") {
                    setShowNewTopicInput(false);
                    setNewTopicName("");
                  }
                }}
                placeholder="Topic name..."
                className="flex-1 px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                autoFocus
              />
              <button
                onClick={handleCreateTopic}
                className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                title="Create topic"
              >
                <Plus className="w-3 h-3 text-green-600 dark:text-green-400" />
              </button>
              <button
                onClick={() => {
                  setShowNewTopicInput(false);
                  setNewTopicName("");
                }}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                title="Cancel"
              >
                <X className="w-3 h-3 text-red-600 dark:text-red-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewTopicInput(true)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>New Topic</span>
            </button>
          )}

          {/* List of topics */}
          {topics.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {topics.map((topic) => {
                const count = questionsByTopic[topic]?.length || 0;
                const isPending = pendingTopics.has(topic) && count === 0;
                return (
                  <div
                    key={topic}
                    className={cn(
                      "flex items-center gap-2 group px-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
                      isPending && "opacity-60"
                    )}
                  >
                    <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">
                      {topic}
                      {isPending && (
                        <span className="ml-1 text-gray-400 dark:text-gray-500 text-[10px]">
                          (pending)
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      {count}
                    </span>
                    <button
                      onClick={() => {
                        if (isPending) {
                          setPendingTopics((prev) => {
                            const next = new Set(prev);
                            next.delete(topic);
                            return next;
                          });
                        } else {
                          handleRemoveTopic(topic);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-opacity"
                      title={isPending ? "Remove pending topic" : "Remove topic (ungroup questions)"}
                    >
                      <X className="w-3 h-3 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ungrouped questions count */}
          {questionsByTopic[""] && questionsByTopic[""].length > 0 && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                Ungrouped: {questionsByTopic[""].length}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

