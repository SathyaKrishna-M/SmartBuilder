"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Folder, Sparkles, Loader2 } from "lucide-react";
import { Project } from "@/types";
import { getAllProjects, createProject } from "@/lib/storage";
import { ProjectSidebar } from "@/components/project-sidebar";
import { AuthButton } from "@/components/auth/auth-button";
import { useAuth } from "@/components/auth/auth-provider";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isProjectSidebarCollapsed, setIsProjectSidebarCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadProjects();
    }
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProjects = async () => {
    if (authLoading) return;
    
    setLoading(true);
    try {
      if (user) {
        const loadedProjects = await getAllProjects();
        setProjects(loadedProjects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const title = prompt("Enter project name:");
    if (title && title.trim()) {
      try {
        const project = await createProject(title.trim());
        await loadProjects();
        router.push(`/${project.id}`);
      } catch (error) {
        if (error instanceof Error && error.message.includes("Authentication required")) {
          router.push("/auth/login");
        } else {
          alert("Failed to create project. Please try again.");
          console.error("Error creating project:", error);
        }
      }
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center transition-colors duration-500">
        <div className="text-gray-400 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background-light dark:bg-background-dark flex overflow-hidden transition-colors duration-500">
        <ProjectSidebar 
          isCollapsed={isProjectSidebarCollapsed}
          onToggleCollapse={() => setIsProjectSidebarCollapsed(!isProjectSidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
          <header className="h-16 bg-background-cardDark/80 dark:bg-background-cardDark/80 backdrop-blur-xl border-b border-border-light dark:border-border-dark flex items-center justify-end px-6 flex-shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
            <AuthButton />
          </header>
          <main className="flex-1 flex items-center justify-center p-8 min-h-0 overflow-y-auto">
            <div className="max-w-2xl w-full text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Sparkles className="w-12 h-12 text-brand-blue" />
                  <h1 className="text-4xl font-bold text-text-light dark:text-gray-100">
                    KnowSpark
                  </h1>
                </div>
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">
                  Ask smart. Learn beautifully.
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  Create AI-powered knowledge cards from your questions.
                  Sign in to get started!
                </p>
              </motion.div>

              {authLoading || loading ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400 dark:text-gray-400" />
                  <span className="text-gray-400 dark:text-gray-400">Loading...</span>
                </motion.div>
              ) : !user ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-gray-400 dark:text-gray-400 mb-4">
                    Please sign in to create and manage your projects
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-electric to-brand-blue hover:from-brand-blue hover:to-[#60A5FA] text-white rounded-lg transition-all duration-300 text-lg font-medium shadow-[0_0_10px_rgba(30,64,255,0.3)]"
                  >
                    Sign In to Get Started
                  </Link>
                </motion.div>
              ) : projects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button
                    onClick={handleCreateProject}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-electric to-brand-blue hover:from-brand-blue hover:to-[#60A5FA] text-white rounded-lg transition-all duration-300 text-lg font-medium shadow-[0_0_10px_rgba(30,64,255,0.3)]"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Project
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-semibold text-text-light dark:text-gray-100 mb-4">
                    Your Projects
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <motion.div
                        key={project.id}
                        whileHover={{ scale: 1.02, boxShadow: "0 0 12px rgba(59,130,246,0.2)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${project.id}`);
                        }}
                        className="bg-background-cardLight dark:bg-background-cardDark/90 backdrop-blur-lg border border-border-light dark:border-[#1C1C1C] rounded-2xl p-6 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Folder className="w-5 h-5 text-brand-blue" />
                          <h3 className="text-lg font-semibold text-text-light dark:text-white">
                            {project.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {project.questions.length} question
                          {project.questions.length !== 1 ? "s" : ""}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    onClick={handleCreateProject}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-background-cardDark dark:bg-background-cardDark border border-border-dark dark:border-border-dark hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] text-gray-300 dark:text-gray-300 rounded-xl transition-all duration-300 mt-4"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Project
                  </motion.button>
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>
  );
}
