"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Folder, Trash2, Edit2, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Project } from "@/types";
import { getAllProjects, deleteProject, saveProject, createProject } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  currentProjectId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ProjectSidebar({ 
  currentProjectId, 
  isCollapsed = false,
  onToggleCollapse 
}: ProjectSidebarProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    setProjects(getAllProjects());
  }, []);

  const handleCreateProject = () => {
    const title = prompt("Enter project name:");
    if (title && title.trim()) {
      const newProject = createProject(title.trim());
      setProjects(getAllProjects());
      router.push(`/${newProject.id}`);
    }
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
      setProjects(getAllProjects());
      if (currentProjectId === id) {
        router.push("/");
      }
    }
  };

  const handleStartEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const handleSaveEdit = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project && editTitle.trim()) {
      project.title = editTitle.trim();
      project.updatedAt = Date.now();
      saveProject(project);
      setProjects(getAllProjects());
      setEditingId(null);
      setEditTitle("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <>
      {/* Toggle Button - Fixed position, always visible */}
      <button
        onClick={onToggleCollapse}
        className={cn(
          "fixed top-1/2 z-50 p-2 bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-800 rounded-r-full rounded-l-full",
          "shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300",
          "flex items-center justify-center",
          isCollapsed ? "left-2" : "left-[256px]"
        )}
        style={{ transform: "translateY(-50%)" }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 0 : 256,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
          "flex flex-col overflow-hidden flex-shrink-0 h-full",
          isCollapsed ? "w-0" : "w-64"
        )}
      >
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full w-full"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  KnowSpark
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ask smart. Learn beautifully.
                </p>
              </div>

              <div className="p-4 flex-shrink-0">
                <button
                  onClick={handleCreateProject}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-2 min-h-0">
                {projects.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
                    No projects yet. Create one to get started!
                  </div>
                ) : (
                  <div className="space-y-1">
                    {projects.map((project) => (
                      <motion.div
                        key={project.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          onClick={() => router.push(`/${project.id}`)}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg cursor-pointer group",
                            "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                            currentProjectId === project.id &&
                              "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                          )}
                        >
                          <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          {editingId === project.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveEdit(project.id);
                                  } else if (e.key === "Escape") {
                                    handleCancelEdit();
                                  }
                                }}
                                className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded"
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveEdit(project.id);
                                }}
                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                              >
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                              >
                                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                                {project.title}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleStartEdit(project, e)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                >
                                  <Edit2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteProject(project.id, e)}
                                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500 dark:text-red-400" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
