"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Folder, Trash2, Edit2, Check, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Project } from "@/types";
import { getAllProjects, deleteProject, saveProject, createProject } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

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
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

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
        const newProject = await createProject(title.trim());
        await loadProjects();
        router.push(`/${newProject.id}`);
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

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id);
        await loadProjects();
        if (currentProjectId === id) {
          router.push("/");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project. Please try again.");
      }
    }
  };

  const handleStartEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const handleSaveEdit = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project && editTitle.trim()) {
      try {
        project.title = editTitle.trim();
        project.updatedAt = Date.now();
        await saveProject(project);
        await loadProjects();
        setEditingId(null);
        setEditTitle("");
      } catch (error) {
        console.error("Error saving project:", error);
        alert("Failed to save project. Please try again.");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <>
      {/* Toggle Button - Fixed position, always visible */}
      <motion.button
        onClick={onToggleCollapse}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed top-1/2 z-50 p-2.5 bg-background-cardDark/80 dark:bg-background-cardDark/80 backdrop-blur-xl",
          "border border-border-light dark:border-border-dark rounded-full",
          "shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
          "hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]",
          "transition-all duration-300",
          "flex items-center justify-center",
          isCollapsed ? "left-2" : "left-[256px]"
        )}
        style={{ transform: "translateY(-50%)" }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-400 dark:text-gray-400" />
        )}
      </motion.button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 0 : 256,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "bg-background-cardDark/80 dark:bg-background-cardDark/80 backdrop-blur-xl border-r border-border-light dark:border-border-dark",
          "flex flex-col overflow-hidden flex-shrink-0 h-full",
          "shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
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
              <div className="p-5 border-b border-border-light dark:border-border-dark flex-shrink-0">
                <h1 className="text-sm font-medium tracking-wider text-gray-400 dark:text-gray-400 mb-1 uppercase">
                  Projects
                </h1>
              </div>

              <div className="p-4 flex-shrink-0">
                <motion.button
                  onClick={handleCreateProject}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-electric to-brand-blue hover:from-brand-blue hover:to-[#60A5FA] text-white rounded-lg font-medium transition-all duration-300 shadow-[0_0_10px_rgba(30,64,255,0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto px-2 min-h-0">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-text-mutedLight dark:text-text-mutedDark" />
                  </div>
                ) : !user ? (
                  <div className="text-center text-gray-400 dark:text-gray-400 text-sm mt-8 px-4">
                    <p className="mb-4">Please sign in to view your projects</p>
                    <motion.button
                      onClick={() => router.push("/auth/login")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-gradient-to-r from-brand-electric to-brand-blue hover:from-brand-blue hover:to-[#60A5FA] text-white rounded-lg text-sm transition-all duration-300 shadow-[0_0_10px_rgba(30,64,255,0.3)]"
                    >
                      Sign In
                    </motion.button>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center text-gray-400 dark:text-gray-400 text-sm mt-8 px-4">
                    No projects yet. Create one to get started!
                  </div>
                ) : (
                  <div className="space-y-2 px-2">
                    {projects.map((project) => (
                      <motion.div
                        key={project.id}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/${project.id}`);
                          }}
                          className={cn(
                            "block w-full text-left px-4 py-2 mb-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer group",
                            currentProjectId === project.id
                              ? "bg-[#111111] dark:bg-[#111111] text-brand-blue shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                              : "hover:bg-[#111111]/60 dark:hover:bg-[#111111]/60 text-gray-300 dark:text-gray-300"
                          )}
                        >
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
                                className="flex-1 px-2 py-1 text-sm bg-background-cardDark dark:bg-background-cardDark border border-border-dark dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-200 dark:text-gray-200"
                                autoFocus
                              />
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveEdit(project.id);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              >
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </motion.button>
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </motion.button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-gray-400 dark:text-gray-400 flex-shrink-0" />
                                <span className="flex-1 text-sm truncate">
                                  {project.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <motion.button
                                  onClick={(e) => handleStartEdit(project, e)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-1 hover:bg-[#111111] dark:hover:bg-[#111111] rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-3 h-3 text-gray-400 dark:text-gray-400" />
                                </motion.button>
                                <motion.button
                                  onClick={(e) => handleDeleteProject(project.id, e)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-1 hover:bg-[#111111] dark:hover:bg-[#111111] rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3 h-3 text-red-400 dark:text-red-400" />
                                </motion.button>
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
