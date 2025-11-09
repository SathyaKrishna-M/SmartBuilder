import { Answer } from "@/types";
import { generateId } from "@/lib/utils";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";

export async function generateAnswer(question: string): Promise<Answer> {
  if (!API_KEY || API_KEY === "") {
    throw new Error("Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file");
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

  // ✅ Enhanced prompt for proper LaTeX formatting
  const prompt = `You are a Markdown content generator for an educational web app that teaches logic and Boolean algebra.

Formatting Rules:

1. **All math must be written in LaTeX syntax inside math mode.**
   - Inline math: $E = mc^2$
   - Block math: 
     $$
     F = \\overline{A}\\overline{B}C + ABC'
     $$

2. Use correct LaTeX commands:
   - Σ (Sigma): \\Sigma
   - Π (Pi): \\Pi
   - Multiplication / AND: \\cdot
   - NOT / complement: \\overline{}

3. Always wrap the entire answer inside a markdown code block:

   \`\`\`markdown
   <markdown content here>
   \`\`\`

4. Do **not** use words like "Sigma" or "Pi" — always use LaTeX symbols.

5. Use proper Markdown tables (| A | B | C | F |).

6. Include equations and expressions using double-dollar blocks for readability.

Example:

\`\`\`markdown
### Example Boolean Function

| A | B | C | F |
|:-:|:-:|:-:|:-:|
| 0 | 0 | 0 | 1 |
| 0 | 0 | 1 | 0 |
| 1 | 1 | 1 | 1 |

$$
F(A,B,C) = \\Sigma m(0,2,5,7)
$$

$$
F(A,B,C) = \\Pi M(1,3,4,6)
$$

$$
F = \\overline{A}\\overline{B}\\overline{C} + \\overline{A}B\\overline{C} + A\\overline{B}C + ABC
$$
\`\`\`

Now generate your answer for:

${question}`;

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

    // Extract markdown from code block
    // Try to find ```markdown ... ``` block first
    let markdownMatch = text.match(/```markdown\s*([\s\S]*?)```/);
    
    // If not found, try generic ``` ... ``` block
    if (!markdownMatch) {
      markdownMatch = text.match(/```\s*([\s\S]*?)```/);
    }
    
    // Extract the content
    const formattedOutput = markdownMatch ? markdownMatch[1].trim() : text;
    
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