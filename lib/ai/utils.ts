export type QuestionType = "programming" | "boolean" | "math" | "theory";

export type ProgrammingLanguage = "java" | "python" | "c" | "cpp" | "javascript" | "none";

export function detectTopic(question: string): QuestionType {
  const lower = question.toLowerCase();

  if (
    lower.includes("java") ||
    lower.includes("python") ||
    lower.includes("c++") ||
    lower.includes("c language") ||
    lower.includes("code") ||
    lower.includes("program") ||
    lower.includes("algorithm") ||
    lower.includes("input") ||
    lower.includes("output")
  ) {
    return "programming";
  }

  if (
    lower.includes("boolean") ||
    lower.includes("circuit") ||
    lower.includes("truth table") ||
    lower.includes("sop") ||
    lower.includes("pos") ||
    lower.includes("logic gate")
  ) {
    return "boolean";
  }

  if (lower.includes("equation") || lower.includes("simplify") || lower.includes("solve")) {
    return "math";
  }

  return "theory";
}

export function detectLanguage(question: string): ProgrammingLanguage {
  const lower = question.toLowerCase();

  if (lower.includes("java")) return "java";
  if (lower.includes("python")) return "python";
  if (lower.includes("c++")) return "cpp";
  if (lower.includes("c language") || lower.includes(" in c ")) return "c";
  if (lower.includes("javascript") || lower.includes("nodejs") || lower.includes("web")) return "javascript";

  // Default logic — infer from common keywords
  if (lower.includes("scanner") || lower.includes("system.out") || lower.includes("main(")) return "java";
  if (lower.includes("print(") || lower.includes("def ") || lower.includes("input(")) return "python";
  if (lower.includes("printf") || lower.includes("scanf")) return "c";
  if (lower.includes("cout") || lower.includes("cin")) return "cpp";

  return "none";
}

