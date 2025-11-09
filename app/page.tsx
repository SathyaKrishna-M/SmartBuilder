"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Folder, Sparkles } from "lucide-react";
import { Project } from "@/types";
import { getAllProjects, createProject } from "@/lib/storage";
import { ThemeProvider } from "@/components/theme-provider";
import { ProjectSidebar } from "@/components/project-sidebar";

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isProjectSidebarCollapsed, setIsProjectSidebarCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProjects(getAllProjects());
  }, []);

  const handleCreateProject = () => {
    const title = prompt("Enter project name:");
    if (title && title.trim()) {
      const project = createProject(title.trim());
      router.push(`/${project.id}`);
    }
  };

  if (!mounted) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="h-full w-full bg-gray-50 dark:bg-gray-950 flex overflow-hidden">
        <ProjectSidebar 
          isCollapsed={isProjectSidebarCollapsed}
          onToggleCollapse={() => setIsProjectSidebarCollapsed(!isProjectSidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
          <main className="flex-1 flex items-center justify-center p-8 min-h-0 overflow-y-auto">
            <div className="max-w-2xl w-full text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Sparkles className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    KnowSpark
                  </h1>
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                  Ask smart. Learn beautifully.
                </p>
                <p className="text-gray-500 dark:text-gray-500 mb-8">
                  Create AI-powered knowledge cards from your questions.
                  Everything stored locally, completely free.
                </p>
              </motion.div>

              {projects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    onClick={handleCreateProject}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-lg font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Project
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Your Projects
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <motion.div
                        key={project.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(`/${project.id}`)}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                  <button
                    onClick={handleCreateProject}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors mt-4"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Project
                  </button>
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
