export interface QuestionAnalysis {
  topic: "programming" | "boolean" | "math" | "theory";
  language?: string;
  constraints?: string[];
  requiresDiagram?: boolean;
  structure?: string[];
}

/**
 * Dynamically analyzes a question to infer its topic, language, constraints, and ideal structure.
 */
export function analyzeQuestion(question: string): QuestionAnalysis {
  const lower = question.toLowerCase();

  const analysis: QuestionAnalysis = {
    topic: "theory",
    constraints: [],
    structure: [],
    requiresDiagram: false,
  };

  // Detect topic
  if (
    lower.includes("program") ||
    lower.includes("code") ||
    lower.includes("write a") ||
    lower.includes("algorithm")
  ) {
    analysis.topic = "programming";
  } else if (
    lower.includes("truth table") ||
    lower.includes("boolean") ||
    lower.includes("gate") ||
    lower.includes("circuit") ||
    lower.includes("logic")
  ) {
    analysis.topic = "boolean";
  } else if (
    lower.includes("simplify") ||
    lower.includes("equation") ||
    lower.includes("solve") ||
    lower.includes("derive")
  ) {
    analysis.topic = "math";
  }

  // Detect language (for programming)
  if (lower.includes("java")) analysis.language = "java";
  else if (lower.includes("python")) analysis.language = "python";
  else if (lower.includes("c++")) analysis.language = "cpp";
  else if (lower.includes("c language")) analysis.language = "c";
  else if (lower.includes("javascript") || lower.includes("node")) analysis.language = "javascript";

  // Detect constraints
  const constraintKeywords = [
    "without if",
    "without loop",
    "without ternary",
    "without using",
    "using switch",
    "using recursion",
    "using array",
    "using operator",
  ];
  analysis.constraints = constraintKeywords.filter((c) => lower.includes(c));

  // Detect diagram requirement
  analysis.requiresDiagram =
    lower.includes("diagram") ||
    lower.includes("flowchart") ||
    lower.includes("logic circuit") ||
    lower.includes("circuit diagram");

  // Define section structure dynamically
  if (analysis.topic === "programming") {
    analysis.structure = ["Overview", "Code Implementation", "Sample I/O", "Summary"];
  } else if (analysis.topic === "boolean") {
    analysis.structure = ["Overview", "Truth Table", "Simplified Expression", "Diagram", "Summary"];
  } else if (analysis.topic === "math") {
    analysis.structure = ["Concept", "Steps", "Final Answer", "Summary"];
  } else {
    analysis.structure = ["Overview", "Explanation", "Summary"];
  }

  return analysis;
}

