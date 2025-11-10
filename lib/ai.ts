import { Answer } from "@/types";
import { generateId } from "@/lib/utils";
import { analyzeQuestion } from "./ai/analyze";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";

export async function generateAnswer(question: string): Promise<Answer> {
  if (!API_KEY || API_KEY === "") {
    throw new Error("Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file");
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

  // Analyze question to get topic, language, constraints, and structure
  const analysis = analyzeQuestion(question);
  const { topic, language, constraints, requiresDiagram, structure } = analysis;

  // 🧠 Universal Tone Rule
  const toneRules = `You are a concise, professional AI tutor.
Always provide short, clear, GPT-like answers.
Avoid unnecessary words, repetition, or academic tone.
Keep the response well-structured, formatted in Markdown, and under ~180 words unless the question requires more.
Always wrap the entire answer inside a markdown code block:

\`\`\`markdown
<markdown content here>
\`\`\``;

  // Dynamic context awareness
  const constraintText =
    constraints && constraints.length > 0
      ? `\n🧩 Follow these constraints strictly: ${constraints.join(", ")}.`
      : "";

  const diagramText = requiresDiagram || topic === "boolean"
    ? `\n📊 ${topic === "boolean" ? "Always" : "The question requires"} generate a valid React Flow JSON diagram code block (\`\`\`json\`\`\`) showing nodes and edges labeled appropriately. For Boolean logic, include diagram JSON at the end with:
- Input nodes: label "INPUT" or single letters like "A", "B", "C"
- Output nodes: label "OUTPUT" or output names like "F", "D"
- Gate nodes: exact labels "AND", "OR", "XOR", "NOT", "NAND", "NOR"
- Position nodes left to right: inputs (x: 100), gates (x: 300-400), outputs (x: 500+)
- Space vertically: inputs at y: 100, 200, 300, etc.`
    : "";

  // Dynamic format layout
  const sectionList = (structure || ["Overview", "Explanation", "Summary"]).map((s, i) => `${i + 1}. **${s}**`).join("\n");

  // Language description for programming
  const langDesc = language
    ? `in **${language.toUpperCase()}**`
    : `in the most suitable programming language`;

  const codeLang = language || "java";

  // Build intelligent prompt
  const prompt = `${toneRules}

### Task

Understand the question and provide a concise, well-formatted answer.

### Question

${question}

### Analysis

- Topic: ${topic}
- Language: ${language || "auto-detect"}
- Constraints: ${constraints && constraints.length > 0 ? constraints.join(", ") : "none"}
- Requires Diagram: ${requiresDiagram || topic === "boolean" ? "Yes" : "No"}

### Output Format

${sectionList}

📋 Each section should contain only essential, direct content — no filler.
${topic === "programming" ? `For programming, include complete code blocks using \`\`\`${codeLang}\`\`\`.` : ""}
${topic === "boolean" ? `For Boolean logic, add truth tables, LaTeX expressions ($...$ or $$...$$), and diagram JSON. Use \\overline{} for NOT, \\cdot for AND, \\mathrm{} for text in math.` : ""}
${topic === "math" ? `For math, show concise steps and final answer using LaTeX ($...$ or $$...$$).` : ""}
Use \`\`\`language\`\`\` blocks appropriately.${constraintText}${diagramText}

Now generate the final answer.`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    console.log(`[Gemini API] Calling model: ${MODEL}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error(`[Gemini API] Error:`, errorMessage);
      throw new Error(errorMessage);
    }

    if (data.error) {
      throw new Error(data.error.message || "Gemini API request failed");
    }

    // ✅ Extract the Markdown block from the response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Log response for debugging
    if (data.candidates?.[0]?.finishReason) {
      console.log(`[Gemini API] Response ID: ${data.candidates[0].finishReason}`);
    }

    // Extract markdown from code block - handle nested code blocks properly
    let formattedOutput = text;
    
    // Find ```markdown start
    const markdownStart = text.indexOf("```markdown");
    if (markdownStart !== -1) {
      const contentStart = markdownStart + 11; // After "```markdown"
      const remaining = text.substring(contentStart);
      
      // Strategy: Find all nested code blocks (```language blocks) and their closings
      // Then find the ``` that closes the markdown block (should be after all nested blocks)
      // Match code blocks like ```java, ```python, ```json, etc.
      const codeBlockPattern = /```[\w]*[\s\S]*?```/g;
      const codeBlocks: Array<{ start: number; end: number }> = [];
      let match;
      
      // Reset regex
      codeBlockPattern.lastIndex = 0;
      while ((match = codeBlockPattern.exec(remaining)) !== null) {
        // Skip the markdown block itself if it appears
        if (match[0].startsWith("```markdown")) continue;
        codeBlocks.push({
          start: match.index,
          end: match.index + match[0].length
        });
      }
      
      // Find the closing ``` for the markdown block
      // It should be the LAST ``` that appears after all nested code blocks
      if (codeBlocks.length > 0) {
        // Find the position after the last code block
        const afterLastBlock = codeBlocks[codeBlocks.length - 1].end;
        // Look for the next ``` after the last code block - that should close the markdown block
        const closingPos = remaining.indexOf("```", afterLastBlock);
        if (closingPos !== -1) {
          formattedOutput = remaining.substring(0, closingPos).trim();
        } else {
          // No closing found after code blocks, use everything
          formattedOutput = remaining.trim();
        }
      } else {
        // No nested code blocks, find first closing ```
        const closingPos = remaining.indexOf("```");
        if (closingPos !== -1) {
          formattedOutput = remaining.substring(0, closingPos).trim();
        } else {
          formattedOutput = remaining.trim();
        }
      }
    } else {
      // No markdown block found, try generic code block or use raw text
      const genericMatch = text.match(/```\s*([\s\S]*?)```/);
      if (genericMatch) {
        formattedOutput = genericMatch[1].trim();
      }
    }
    
    // Debug: Log response details
    console.log("[Gemini API] Raw response length:", text.length);
    console.log("[Gemini API] Formatted output length:", formattedOutput.length);
    console.log("[Gemini API] Analysis:", {
      topic,
      language: language || "auto-detect",
      constraints: constraints?.length || 0,
      requiresDiagram: requiresDiagram || topic === "boolean",
      structure: structure?.join(", ") || "default"
    });
    
    // Check for code blocks in the output
    const codeBlockMatches = formattedOutput.match(/```[\w]*/g);
    if (codeBlockMatches) {
      console.log(`[Gemini API] ✅ Found ${codeBlockMatches.length} code block(s):`, codeBlockMatches);
    } else {
      console.log("[Gemini API] ⚠️ No code blocks found in formatted output");
    }
    
    if (formattedOutput.includes("```json")) {
      console.log("[Gemini API] ✅ Found JSON diagram in response");
      const jsonMatches = formattedOutput.match(/```json\s*([\s\S]*?)```/g);
      if (jsonMatches) {
        console.log(`[Gemini API] Found ${jsonMatches.length} JSON diagram(s)`);
        jsonMatches.forEach((match: string, idx: number) => {
          console.log(`[Gemini API] Diagram ${idx + 1} preview:`, match.substring(0, 150));
        });
      }
    }
    
    // Log preview of formatted output for debugging
    console.log("[Gemini API] Formatted output preview (first 500 chars):", formattedOutput.substring(0, 500));
    
    // Extract title from first heading if available, otherwise use question
    const titleMatch = formattedOutput.match(/^#+\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : question;

    return {
      id: generateId(),
      title: title,
      sections: {
        Overview: formattedOutput,
      },
    };
  } catch (error) {
    console.error("[Gemini API] Error generating answer:", error);
    
    // Provide more specific error messages
    let errorMessage = "Sorry, I couldn't generate a response.";
    
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("401")) {
        errorMessage = "API key error: Please check your NEXT_PUBLIC_GEMINI_API_KEY in .env.local";
      } else if (error.message.includes("404") || error.message.includes("not found")) {
        errorMessage = `Model not found: ${MODEL}. Please check the model name or update NEXT_PUBLIC_GEMINI_MODEL.`;
      } else if (error.message.includes("429")) {
        errorMessage = "Rate limit exceeded: Please try again in a few moments.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    // Fallback response
    return {
      id: generateId(),
      title: "Error",
      sections: {
        "Error": errorMessage,
        "Details": "Try again later or verify your Gemini API key and network connection.",
      },
    };
  }
}