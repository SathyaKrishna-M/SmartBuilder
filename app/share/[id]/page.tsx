"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Project, Question } from "@/types";
import { getProject } from "@/lib/storage";
import {
  Lightbulb,
  Settings,
  BookOpen,
  FileText,
  Sparkles,
} from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import MarkdownRenderer from "@/components/markdown-renderer";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const sectionIcons: { [key: string]: React.ReactNode } = {
  Overview: <Lightbulb className="w-4 h-4" />,
  Details: <FileText className="w-4 h-4" />,
  Steps: <Settings className="w-4 h-4" />,
  Process: <Settings className="w-4 h-4" />,
  Examples: <BookOpen className="w-4 h-4" />,
  Example: <BookOpen className="w-4 h-4" />,
  Summary: <FileText className="w-4 h-4" />,
};

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

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

    setLoading(true);
    try {
      const loadedProject = await getProject(projectId);
      setProject(loadedProject);
    } catch (error) {
      console.error("Error loading project:", error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || authLoading || loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Please sign in to view this project</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!project) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              Project not found
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              This project may have been deleted or the link is invalid.
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const questionsWithAnswers = project.questions.filter(
    (q) => q.answer !== null
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {project.title}
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Shared from KnowSpark
            </p>
          </motion.div>

          {/* Questions */}
          {questionsWithAnswers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">
                This project doesn&apos;t have any answers yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {questionsWithAnswers.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {question.text}
                    </h2>
                  </div>
                  {(() => {
                    if (!question.answer) return null;
                    const answer = question.answer;
                    return (
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
                                  <div key={sectionName}>
                                    <div className="text-gray-700 dark:text-gray-300">
                                      <MarkdownRenderer content={sectionContent} />
                                    </div>
                                  </div>
                                );
                              }
                              
                              // Otherwise, show with section wrapper
                              return (
                                <div
                                  key={sectionName}
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
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
