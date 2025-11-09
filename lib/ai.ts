import { Answer } from "@/types";
import { generateId } from "@/lib/utils";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";

export async function generateAnswer(question: string): Promise<Answer> {
  if (!API_KEY || API_KEY === "") {
    throw new Error("Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file");
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

  // ✅ Enhanced prompt for proper LaTeX formatting and React Flow JSON diagrams
  const prompt = `You are a Boolean logic tutor and circuit diagram generator.

CRITICAL REQUIREMENTS - Your answer MUST include ALL of the following:

1. **Markdown explanation** (overview, truth table, SOP/POS forms)
2. **Equations** using LaTeX between $ or $$ delimiters  
3. **A logic circuit diagram** in a valid JSON format - THIS IS MANDATORY

⚠️ IMPORTANT: You MUST include a JSON diagram for every Boolean function or logic circuit question. If the question asks about a logic circuit, Boolean function, or digital logic, you MUST provide a diagram.

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
   - Text in math: ALWAYS use \\mathrm{} for text inside math (e.g., \\mathrm{B_o} NOT \\text{B_o})
   - Subscripts: Use underscore (e.g., B_o, A_1, F_{out})
   - CRITICAL: Never use \\text{} - it causes rendering errors. Always use \\mathrm{} inside math blocks.

3. Always wrap the entire answer inside a markdown code block:

   \`\`\`markdown
   <markdown content here>
   \`\`\`

4. Do **not** use words like "Sigma" or "Pi" — always use LaTeX symbols.

5. Use proper Markdown tables (| A | B | C | F |).

6. Include equations and expressions using double-dollar blocks for readability.

MANDATORY Diagram Rules - JSON Format:
- You MUST include a \`\`\`json code block with the diagram structure
- The JSON must be a valid object with "nodes" and "edges" arrays
- Nodes represent inputs, gates, and outputs
- Edges connect nodes using "source" and "target" IDs
- Place the diagram JSON at the END of your answer, after all explanations

Node Label Rules:
- Input nodes: Use "INPUT" as label, or single letters like "A", "B", "C" (will be rendered as blue circles)
- Output nodes: Use "OUTPUT" as label, or output names like "F", "D", "Borrow" (will be rendered as green triangles)
- Gate nodes: Use gate names exactly as "AND", "OR", "XOR", "NOT", "NAND", "NOR" (will be rendered with gate icons)

Diagram JSON Structure:
{
  "nodes": [
    { "id": "A", "data": { "label": "INPUT" }, "position": { "x": 100, "y": 100 } },
    { "id": "B", "data": { "label": "INPUT" }, "position": { "x": 100, "y": 200 } },
    { "id": "AND1", "data": { "label": "AND" }, "position": { "x": 300, "y": 150 } },
    { "id": "F", "data": { "label": "OUTPUT" }, "position": { "x": 500, "y": 150 } }
  ],
  "edges": [
    { "id": "e1", "source": "A", "target": "AND1" },
    { "id": "e2", "source": "B", "target": "AND1" },
    { "id": "e3", "source": "AND1", "target": "F" }
  ]
}

Position Guidelines:
- Arrange nodes left to right: inputs (x: 100), gates (x: 300-400), outputs (x: 500+)
- Vertically space nodes: inputs at y: 100, 200, 300, etc.
- Gates should be positioned between inputs and outputs
- Space nodes vertically to avoid overlap (minimum 100 pixels apart)

Visual Guide:
- Input nodes: Blue circles (use label "INPUT" or single letter like "A")
- Output nodes: Green triangles (use label "OUTPUT" or output name)
- AND gates: Blue rectangular gate icon
- OR gates: Orange curved gate icon
- XOR gates: Purple curved gate icon with double line
- NOT gates: Green triangular gate icon with circle

Example for Half Subtractor:
\`\`\`json
{
  "nodes": [
    { "id": "A", "data": { "label": "INPUT" }, "position": { "x": 100, "y": 100 } },
    { "id": "B", "data": { "label": "INPUT" }, "position": { "x": 100, "y": 200 } },
    { "id": "XOR1", "data": { "label": "XOR" }, "position": { "x": 300, "y": 100 } },
    { "id": "NOT1", "data": { "label": "NOT" }, "position": { "x": 300, "y": 250 } },
    { "id": "AND1", "data": { "label": "AND" }, "position": { "x": 500, "y": 200 } },
    { "id": "D", "data": { "label": "OUTPUT" }, "position": { "x": 700, "y": 100 } },
    { "id": "B_OUT", "data": { "label": "OUTPUT" }, "position": { "x": 700, "y": 200 } }
  ],
  "edges": [
    { "id": "e1", "source": "A", "target": "XOR1" },
    { "id": "e2", "source": "B", "target": "XOR1" },
    { "id": "e3", "source": "XOR1", "target": "D" },
    { "id": "e4", "source": "A", "target": "NOT1" },
    { "id": "e5", "source": "NOT1", "target": "AND1" },
    { "id": "e6", "source": "B", "target": "AND1" },
    { "id": "e7", "source": "AND1", "target": "B_OUT" }
  ]
}
\`\`\`

CRITICAL: 
- Input nodes must have label "INPUT" (or single letter like "A", "B", "C")
- Output nodes must have label "OUTPUT" (or output name)
- Gate nodes must have exact labels: "AND", "OR", "XOR", "NOT", "NAND", "NOR"
- All node labels are case-sensitive

REMEMBER: Your response must end with a \`\`\`json code block containing the logic circuit diagram structure.

Now generate your answer for: ${question}`;

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

    // Extract markdown from code block - handle nested JSON diagram blocks properly
    let formattedOutput = text;
    
    // Find ```markdown start
    const markdownStart = text.indexOf("```markdown");
    if (markdownStart !== -1) {
      const contentStart = markdownStart + 11; // After "```markdown"
      const remaining = text.substring(contentStart);
      
      // Strategy: Find all ```json blocks and their closings first
      // Then find the ``` that closes the markdown block (should be after all json blocks)
      const jsonPattern = /```json[\s\S]*?```/g;
      const jsonBlocks: Array<{ start: number; end: number }> = [];
      let match;
      
      // Reset regex
      jsonPattern.lastIndex = 0;
      while ((match = jsonPattern.exec(remaining)) !== null) {
        jsonBlocks.push({
          start: match.index,
          end: match.index + match[0].length
        });
      }
      
      // Find the closing ``` for the markdown block
      // It should be the LAST ``` that appears after all json blocks
      if (jsonBlocks.length > 0) {
        // Find the position after the last json block
        const afterLastJson = jsonBlocks[jsonBlocks.length - 1].end;
        // Look for the next ``` after the last json block - that should close the markdown block
        const closingPos = remaining.indexOf("```", afterLastJson);
        if (closingPos !== -1) {
          formattedOutput = remaining.substring(0, closingPos).trim();
        } else {
          // No closing found after json, use everything
          formattedOutput = remaining.trim();
        }
      } else {
        // No json blocks, find first closing ```
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
    
    // Debug: Log if we found a JSON diagram in the output
    console.log("[Gemini API] Raw response length:", text.length);
    console.log("[Gemini API] Formatted output length:", formattedOutput.length);
    
    if (formattedOutput.includes("```json")) {
      console.log("[Gemini API] ✅ Found JSON diagram in response");
      const jsonMatches = formattedOutput.match(/```json\s*([\s\S]*?)```/g);
      if (jsonMatches) {
        console.log(`[Gemini API] Found ${jsonMatches.length} JSON diagram(s)`);
        jsonMatches.forEach((match: string, idx: number) => {
          console.log(`[Gemini API] Diagram ${idx + 1} preview:`, match.substring(0, 150));
        });
      }
    } else {
      console.log("[Gemini API] ⚠️ No JSON diagram found in response");
      console.log("[Gemini API] Response preview (first 1000 chars):", formattedOutput.substring(0, 1000));
      // Check if there's any mention of diagram or json in the response
      if (formattedOutput.toLowerCase().includes("diagram") || formattedOutput.toLowerCase().includes("json")) {
        console.log("[Gemini API] ⚠️ Response mentions 'diagram' or 'json' but no code block found");
      }
    }
    
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