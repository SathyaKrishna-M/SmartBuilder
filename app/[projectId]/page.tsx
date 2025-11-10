"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Project, Question, Answer } from "@/types";
import {
  getProject,
  addQuestionToProject,
  updateQuestionAnswer,
  deleteQuestion,
  updateQuestionText,
  reorderQuestions,
  updateQuestionTopic,
} from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { ProjectSidebar } from "@/components/project-sidebar";
import { QuestionsSidebar } from "@/components/questions-sidebar";
import { ProjectHeader } from "@/components/project-header";
import { QuestionCard } from "@/components/question-card";
import { QuestionInput } from "@/components/question-input";
import { useAuth } from "@/components/auth/auth-provider";
import { Loader2, Tag } from "lucide-react";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isProjectSidebarCollapsed, setIsProjectSidebarCollapsed] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadProject();
    }
  }, [projectId, user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProject = async () => {
    if (authLoading) return;
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setLoadingProject(true);
    try {
      const loadedProject = await getProject(projectId);
      if (!loadedProject) {
        router.push("/");
        return;
      }
      setProject(loadedProject);
    } catch (error) {
      console.error("Error loading project:", error);
      if (error instanceof Error && error.message.includes("Authentication required")) {
        router.push("/auth/login");
      } else {
        router.push("/");
      }
    } finally {
      setLoadingProject(false);
    }
  };

      const handleSendQuestion = async (questionText: string) => {
        if (!project) return;

        setIsLoading(true);
        try {
          // Add question to project
          const question = await addQuestionToProject(projectId, questionText);
          await loadProject(); // Reload to get the new question

      // Generate answer
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: questionText }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If error response has an answer structure, use it
            if (data.sections) {
            await updateQuestionAnswer(projectId, question.id, data as Answer);
            await loadProject();
          } else {
            throw new Error(data.error || "Failed to generate answer");
          }
        } else {
          const answer: Answer = data;
          await updateQuestionAnswer(projectId, question.id, answer);
          await loadProject();
        }
    } catch (error) {
      console.error("Error generating answer:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to generate answer. Please check your API key and try again.";
      
      // Show error as an answer card
      const question = project?.questions.find(
        (q) => q.text === questionText && !q.answer
      );
      if (question) {
            const errorAnswer: Answer = {
              id: generateId(),
              title: "Error",
              sections: {
                "Error": errorMessage,
              },
            };
            await updateQuestionAnswer(projectId, question.id, errorAnswer);
            loadProject();
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (questionId: string) => {
    if (!project) return;

    const question = project.questions.find((q) => q.id === questionId);
    if (!question) return;

    setRegeneratingId(questionId);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question.text }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If error response has an answer structure, use it
            if (data.sections) {
            await updateQuestionAnswer(projectId, questionId, data as Answer);
            await loadProject();
          } else {
            throw new Error(data.error || "Failed to regenerate answer");
          }
        } else {
          const answer: Answer = data;
          await updateQuestionAnswer(projectId, questionId, answer);
          await loadProject();
        }
    } catch (error) {
      console.error("Error regenerating answer:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to regenerate answer. Please check your API key and try again.";
      
      // Show error as an answer
            const errorAnswer: Answer = {
              id: generateId(),
              title: "Error",
              sections: {
                "Error": errorMessage,
              },
            };
            await updateQuestionAnswer(projectId, questionId, errorAnswer);
            await loadProject();
    } finally {
      setRegeneratingId(null);
    }
  };

      const handleDeleteQuestion = async (questionId: string) => {
        if (confirm("Are you sure you want to delete this question?")) {
          await deleteQuestion(projectId, questionId);
          await loadProject();
        }
      };

      const handleEditQuestion = async (questionId: string, newText: string) => {
        await updateQuestionText(projectId, questionId, newText);
        await loadProject();
      };

      const handleTopicChange = async (questionId: string, topic: string | undefined) => {
        await updateQuestionTopic(projectId, questionId, topic);
        await loadProject();
      };

      const handleMoveQuestion = async (questionId: string, direction: "up" | "down") => {
        if (!project) return;

        const currentIndex = project.questions.findIndex((q) => q.id === questionId);
        if (currentIndex === -1) return;

        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= project.questions.length) return;

        const newOrder = [...project.questions];
        [newOrder[currentIndex], newOrder[newIndex]] = [
          newOrder[newIndex],
          newOrder[currentIndex],
        ];

        await reorderQuestions(
          projectId,
          newOrder.map((q) => q.id)
        );
        await loadProject();
      };

  const handleQuestionClick = (questionId: string) => {
    setActiveQuestionId(questionId);
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      const element = document.getElementById(`question-${questionId}`);
      if (element) {
        // Find the scroll container (the main content area)
        const scrollContainer = document.getElementById('main-scroll-container') as HTMLElement;
        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const scrollTop = scrollContainer.scrollTop;
          // Calculate target scroll position to center the element
          const elementTop = elementRect.top + scrollTop - containerRect.top;
          const targetScroll = elementTop - (containerRect.height / 2) + (elementRect.height / 2);
          
          scrollContainer.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: "smooth"
          });
        } else {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, 50);
  };

  // Track active question based on scroll position
  useEffect(() => {
    if (!project || project.questions.length === 0) return;

    const handleScroll = () => {
      // Find the scroll container - the main content area
      const scrollContainer = document.getElementById('main-scroll-container') as HTMLElement;
      if (!scrollContainer) return;

      interface QuestionElement {
        id: string;
        element: HTMLElement;
      }

      const questionElements: QuestionElement[] = project.questions
        .map((q) => ({
          id: q.id,
          element: document.getElementById(`question-${q.id}`),
        }))
        .filter((item): item is QuestionElement => item.element !== null);

      if (questionElements.length === 0) return;

      const containerRect = scrollContainer.getBoundingClientRect();
      const viewportCenter = containerRect.top + containerRect.height / 2;

      // Find the question closest to the viewport center
      interface ClosestQuestion {
        id: string;
        distance: number;
      }
      let closestQuestion: ClosestQuestion | null = null;

      for (const { id, element } of questionElements) {
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (!closestQuestion || distance < closestQuestion.distance) {
          closestQuestion = { id, distance };
        }
      }

      if (closestQuestion !== null) {
        setActiveQuestionId(closestQuestion.id);
      }
    };

    // Wait a bit for DOM to be ready, then setup listener
    const timeoutId = setTimeout(() => {
      const scrollContainer = document.getElementById('main-scroll-container') as HTMLElement;
      if (scrollContainer) {
        scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial check
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      const scrollContainer = document.getElementById('main-scroll-container') as HTMLElement;
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [project]);

  if (!mounted || authLoading || loadingProject) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center transition-colors duration-500">
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center transition-colors duration-500">
        <div className="text-center">
          <p className="text-gray-400 dark:text-gray-400 mb-4">Please sign in to view this project</p>
          <motion.button
            onClick={() => router.push("/auth/login")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gradient-to-r from-brand-electric to-brand-blue hover:from-brand-blue hover:to-[#60A5FA] text-white rounded-lg transition-all duration-300 font-medium shadow-[0_0_10px_rgba(30,64,255,0.3)]"
          >
            Sign In
          </motion.button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center transition-colors duration-500">
        <div className="text-gray-400 dark:text-gray-400">Project not found</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background-light dark:bg-background-dark flex overflow-hidden transition-colors duration-500">
        <ProjectSidebar 
          currentProjectId={projectId} 
          isCollapsed={isProjectSidebarCollapsed}
          onToggleCollapse={() => setIsProjectSidebarCollapsed(!isProjectSidebarCollapsed)}
        />
        <QuestionsSidebar
          questions={project.questions}
          projectId={projectId}
          activeQuestionId={activeQuestionId}
          onQuestionClick={handleQuestionClick}
          onQuestionsReorder={loadProject}
          onTopicChange={handleTopicChange}
          onAvailableTopicsChange={setAvailableTopics}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
          <ProjectHeader
            projectTitle={project.title}
            projectId={projectId}
          />
          <div className="flex-1 overflow-y-auto min-h-0" id="main-scroll-container">
            <div className="max-w-4xl mx-auto px-8 py-6 md:px-12 lg:px-16 space-y-6">
              {project.questions.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 dark:text-gray-400 text-lg mb-4">
                    No questions yet. Ask your first question below!
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {(() => {
                    // Group questions by topic
                    const grouped: Record<string, Question[]> = {
                      "": [], // Ungrouped questions
                    };
                    
                    project.questions.forEach((q) => {
                      const topic = q.topic || "";
                      if (!grouped[topic]) {
                        grouped[topic] = [];
                      }
                      grouped[topic].push(q);
                    });

                    // Get all topics sorted (empty string last)
                    const topics = Object.keys(grouped).filter(t => t !== "").sort();
                    const allTopics = [...topics, ""];

                    // Use availableTopics from state (includes pending topics from TopicManager)
                    // Fallback to topics from questions if state is empty
                    const topicsForSelector = availableTopics.length > 0 ? availableTopics : topics;

                    return (
                      <>
                        {topics.map((topic) => (
                          <div key={topic} className="space-y-4">
                            {/* Topic Header */}
                            <div className="sticky top-0 z-10 bg-background-cardDark/80 dark:bg-background-cardDark/80 backdrop-blur-xl py-3 -mt-6 mb-2 border-b border-border-light dark:border-border-dark">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-purple-400 dark:text-purple-400" />
                                <h3 className="text-sm font-semibold text-gray-100 dark:text-gray-100">
                                  {topic}
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                  ({grouped[topic].length})
                                </span>
                              </div>
                            </div>
                            {/* Questions in this topic */}
                            {grouped[topic].map((question, index) => (
                              <QuestionCard
                                key={question.id}
                                question={question}
                                onRegenerate={handleRegenerate}
                                onDelete={handleDeleteQuestion}
                                onEditQuestion={handleEditQuestion}
                                onTopicChange={handleTopicChange}
                                availableTopics={topicsForSelector}
                                onMoveUp={
                                  index > 0
                                    ? () => handleMoveQuestion(question.id, "up")
                                    : undefined
                                }
                                onMoveDown={
                                  index < grouped[topic].length - 1
                                    ? () => handleMoveQuestion(question.id, "down")
                                    : undefined
                                }
                                isRegenerating={regeneratingId === question.id}
                                isActive={activeQuestionId === question.id}
                                onScrollIntoView={() => handleQuestionClick(question.id)}
                              />
                            ))}
                          </div>
                        ))}
                        {/* Ungrouped questions */}
                        {grouped[""] && grouped[""].length > 0 && (
                          <div className="space-y-4">
                            {grouped[""].map((question, index) => (
                              <QuestionCard
                                key={question.id}
                                question={question}
                                onRegenerate={handleRegenerate}
                                onDelete={handleDeleteQuestion}
                                onEditQuestion={handleEditQuestion}
                                onTopicChange={handleTopicChange}
                                availableTopics={topicsForSelector}
                                onMoveUp={
                                  index > 0
                                    ? () => handleMoveQuestion(question.id, "up")
                                    : undefined
                                }
                                onMoveDown={
                                  index < grouped[""].length - 1
                                    ? () => handleMoveQuestion(question.id, "down")
                                    : undefined
                                }
                                isRegenerating={regeneratingId === question.id}
                                isActive={activeQuestionId === question.id}
                                onScrollIntoView={() => handleQuestionClick(question.id)}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </AnimatePresence>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <QuestionInput onSend={handleSendQuestion} isLoading={isLoading} />
          </div>
        </div>
      </div>
  );
}
