import { Project, Question, Answer } from "@/types";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "knowspark_projects";

export function getAllProjects(): Project[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading projects from localStorage:", error);
    return [];
  }
}

export function saveProject(project: Project): void {
  if (typeof window === "undefined") return;
  
  try {
    const projects = getAllProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Error saving project to localStorage:", error);
  }
}

export function getProject(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find((p) => p.id === id) || null;
}

export function deleteProject(id: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const projects = getAllProjects();
    const filtered = projects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting project from localStorage:", error);
  }
}

export function createProject(title: string): Project {
  const project: Project = {
    id: generateId(),
    title,
    questions: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveProject(project);
  return project;
}

export function addQuestionToProject(
  projectId: string,
  questionText: string
): Question {
  const project = getProject(projectId);
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
  saveProject(project);
  
  return question;
}

export function updateQuestionAnswer(
  projectId: string,
  questionId: string,
  answer: Answer
): void {
  const project = getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  
  const question = project.questions.find((q) => q.id === questionId);
  if (!question) {
    throw new Error("Question not found");
  }
  
  question.answer = answer;
  project.updatedAt = Date.now();
  saveProject(project);
}

export function deleteQuestion(projectId: string, questionId: string): void {
  const project = getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  
  project.questions = project.questions.filter((q) => q.id !== questionId);
  project.updatedAt = Date.now();
  saveProject(project);
}

export function updateQuestionText(
  projectId: string,
  questionId: string,
  text: string
): void {
  const project = getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  
  const question = project.questions.find((q) => q.id === questionId);
  if (!question) {
    throw new Error("Question not found");
  }
  
  question.text = text;
  project.updatedAt = Date.now();
  saveProject(project);
}

export function reorderQuestions(
  projectId: string,
  questionIds: string[]
): void {
  const project = getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  
  const questionMap = new Map(project.questions.map((q) => [q.id, q]));
  project.questions = questionIds
    .map((id) => questionMap.get(id))
    .filter((q): q is Question => q !== undefined);
  project.updatedAt = Date.now();
  saveProject(project);
}
