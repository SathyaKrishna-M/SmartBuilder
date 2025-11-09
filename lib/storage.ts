import { Project, Question, Answer } from "@/types";
import { generateId } from "@/lib/utils";
import { getCurrentUser } from "./supabase/auth";
import {
  saveProjectToCloud,
  loadProjectsFromCloud,
  deleteProjectFromCloud,
} from "./supabase/projects";

/**
 * Check if user is authenticated, throw error if not
 */
async function requireAuth(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required. Please sign in to continue.");
  }
  return user.id;
}

/**
 * Get all projects for the current user from Supabase
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const userId = await requireAuth();
    return await loadProjectsFromCloud(userId);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication required")) {
      // Return empty array if not authenticated
      return [];
    }
    console.error("Error loading projects:", error);
    return [];
  }
}

/**
 * Save a project to Supabase
 */
export async function saveProject(project: Project): Promise<void> {
  const userId = await requireAuth();
  await saveProjectToCloud(userId, project);
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project | null> {
  try {
    const projects = await getAllProjects();
    return projects.find((p) => p.id === id) || null;
  } catch (error) {
    console.error("Error getting project:", error);
    return null;
  }
}

/**
 * Delete a project from Supabase
 */
export async function deleteProject(id: string): Promise<void> {
  const userId = await requireAuth();
  await deleteProjectFromCloud(id);
}

/**
 * Create a new project
 */
export async function createProject(title: string): Promise<Project> {
  const userId = await requireAuth();
  
  const project: Project = {
    id: generateId(),
    title,
    questions: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  await saveProject(project);
  return project;
}

/**
 * Add a question to a project
 */
export async function addQuestionToProject(
  projectId: string,
  questionText: string
): Promise<Question> {
  await requireAuth();
  
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  
  const question: Question = {
    id: generateId(),
    text: questionText,
    answer: null,
    createdAt: Date.now(),
  };
  
  project.questions.push(question);
  project.updatedAt = Date.now();
  await saveProject(project);
  
  return question;
}

/**
 * Update a question's answer
 */
export async function updateQuestionAnswer(
  projectId: string,
  questionId: string,
  answer: Answer
): Promise<void> {
  await requireAuth();
  
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  
  const question = project.questions.find((q) => q.id === questionId);
  if (!question) {
    throw new Error("Question not found");
  }
  
  question.answer = answer;
  project.updatedAt = Date.now();
  await saveProject(project);
}

/**
 * Delete a question from a project
 */
export async function deleteQuestion(projectId: string, questionId: string): Promise<void> {
  await requireAuth();
  
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  
  project.questions = project.questions.filter((q) => q.id !== questionId);
  project.updatedAt = Date.now();
  await saveProject(project);
}

/**
 * Update a question's text
 */
export async function updateQuestionText(
  projectId: string,
  questionId: string,
  text: string
): Promise<void> {
  await requireAuth();
  
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  
  const question = project.questions.find((q) => q.id === questionId);
  if (!question) {
    throw new Error("Question not found");
  }
  
  question.text = text;
  project.updatedAt = Date.now();
  await saveProject(project);
}

/**
 * Reorder questions in a project
 */
export async function reorderQuestions(
  projectId: string,
  questionIds: string[]
): Promise<void> {
  await requireAuth();
  
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  
  const questionMap = new Map<string, Question>(project.questions.map((q) => [q.id, q]));
  const reorderedQuestions: Question[] = questionIds
    .map((id) => questionMap.get(id))
    .filter((q): q is Question => q !== undefined);
  
  project.questions = reorderedQuestions;
  project.updatedAt = Date.now();
  await saveProject(project);
}
