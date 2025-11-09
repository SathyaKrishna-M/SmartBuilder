"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
// Use a theme that works in both light and dark modes
import "highlight.js/styles/github.css";
import DiagramRenderer from "./diagram-renderer";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface ParsedContent {
  markdown: string;
  diagrams: Array<{ json: string; index: number; position?: number }>;
}

export default function MarkdownRenderer({ 
  content, 
  className = "" 
}: MarkdownRendererProps) {
  // Parse content to extract JSON diagrams and clean markdown
  const parsedContent = useMemo((): ParsedContent => {
    if (!content) return { markdown: "", diagrams: [] };

    const diagrams: Array<{ json: string; index: number; position: number }> = [];
    
    // Extract all JSON diagram blocks with their positions
    // Look for ```json blocks that contain diagram structure (nodes and edges)
    const jsonRegex = /```json\s*([\s\S]*?)```/g;
    let match;
    const diagramMatches: Array<{ json: string; start: number; end: number; index: number }> = [];
    let diagramIndex = 0;

    // Reset regex lastIndex to ensure we catch all matches
    jsonRegex.lastIndex = 0;
    
    while ((match = jsonRegex.exec(content)) !== null) {
      const jsonContent = match[1].trim();
      
      // Check if this JSON block contains diagram structure (nodes and edges)
      try {
        const parsed = JSON.parse(jsonContent);
        if (parsed.nodes && parsed.edges && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
          console.log(`[MarkdownRenderer] Found JSON diagram ${diagramIndex} with ${parsed.nodes.length} nodes and ${parsed.edges.length} edges`);
          diagramMatches.push({
            json: jsonContent,
            start: match.index,
            end: match.index + match[0].length,
            index: diagramIndex++,
          });
          diagrams.push({ 
            json: jsonContent, 
            index: diagramIndex - 1,
            position: match.index 
          });
        }
      } catch (err) {
        // Not a valid JSON diagram, skip it
        console.log(`[MarkdownRenderer] Skipping invalid JSON block at position ${match.index}`);
      }
    }

    if (diagrams.length === 0) {
      console.log("[MarkdownRenderer] No JSON diagrams found in content");
      console.log("[MarkdownRenderer] Content preview:", content.substring(0, 500));
    } else {
      console.log(`[MarkdownRenderer] Extracted ${diagrams.length} diagram(s)`);
    }

    // Remove JSON diagram blocks from content
    let cleanedContent = content;
    // Replace from end to start to preserve indices
    for (let i = diagramMatches.length - 1; i >= 0; i--) {
      const diagram = diagramMatches[i];
      const placeholder = `\n\n__DIAGRAM_${diagram.index}__\n\n`;
      cleanedContent = 
        cleanedContent.substring(0, diagram.start) + 
        placeholder + 
        cleanedContent.substring(diagram.end);
    }

    // Clean and preprocess the markdown content
    let cleaned = cleanedContent
      // Fix escaped newlines
      .replace(/\\n/g, "\n")
      // Convert \( ... \) to $ ... $
      .replace(/\\\(/g, "$")
      .replace(/\\\)/g, "$")
      // Convert \[ ... \] to $$ ... $$
      .replace(/\\\[/g, "$$")
      .replace(/\\\]/g, "$$")
      // Fix uppercase Pi inside $ delimiters
      .replace(/\$Pi\$/g, "$\\Pi$")
      // Fix uppercase Sigma inside $ delimiters
      .replace(/\$Sigma\$/g, "$\\Sigma$")
      // Fix \bar to \overline (KaTeX-supported)
      .replace(/\\bar/g, "\\overline")
      // Fix dot operator variants (bullet character)
      .replace(/•/g, "\\cdot")
      .trim();
    
    // Helper function to fix math content inside $ delimiters
    const fixMathContent = (mathContent: string): string => {
      return mathContent
        // Fix Pi (only if not already escaped)
        .replace(/\bPi\b/gi, (m, offset, str) => {
          return (offset > 0 && str[offset - 1] === '\\') ? m : '\\Pi';
        })
        // Fix Sigma (only if not already escaped)
        .replace(/\bSigma\b/gi, (m, offset, str) => {
          return (offset > 0 && str[offset - 1] === '\\') ? m : '\\Sigma';
        })
        // Fix '*' to \cdot in math context (only standalone * operators)
        .replace(/([A-Za-z0-9\)])\s*\*\s*([A-Za-z0-9\(])/g, '$1 \\cdot $2')
        // Fix misplaced dot before closing parenthesis
        .replace(/\.\s*\)/g, "\\cdot)")
        // Fix \text{} commands in math - replace with \mathrm{} which KaTeX supports
        // KaTeX doesn't fully support \text{}, so we convert it to \mathrm{}
        .replace(/\\text\{([^}]+)\}/g, '\\mathrm{$1}');
    };
    
    // Fix Pi and Sigma inside math blocks (more comprehensive)
    // Process all $$...$$ blocks first (block math)
    cleaned = cleaned.replace(/\$\$([^$]+?)\$\$/g, (match, mathContent) => {
      return `$$${fixMathContent(mathContent)}$$`;
    });
    
    // Process all $...$ blocks (inline math)
    cleaned = cleaned.replace(/\$([^$]+?)\$/g, (match, mathContent) => {
      return `$${fixMathContent(mathContent)}$`;
    });
    
    // Finally, fix any remaining \text{} outside of math blocks (in regular text)
    // This should only match \text{} that's not inside $ delimiters
    cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, (match, content) => {
      // Check if we're inside a math block by looking at surrounding context
      // If we've already processed all math blocks, this should be safe
      // Just extract the text content
      return content;
    });

    return {
      markdown: cleaned,
      diagrams: diagrams.map(d => ({ json: d.json, index: d.index })),
    };
  }, [content]);

  // Split markdown by diagram placeholders and render diagrams in between
  const renderContent = useMemo(() => {
    console.log(`[MarkdownRenderer] Rendering content with ${parsedContent.diagrams.length} diagram(s)`);
    
    // If no diagrams, render entire content as markdown
    if (parsedContent.diagrams.length === 0) {
      console.log("[MarkdownRenderer] No diagrams to render, rendering markdown only");
      return (
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
            [remarkMath, { singleDollarTextMath: true }]
          ]}
          rehypePlugins={[
            rehypeKatex,
            [rehypeHighlight, { detect: true, ignoreMissing: true }],
            rehypeRaw
          ]}
        >
          {parsedContent.markdown}
        </ReactMarkdown>
      );
    }

    const parts: Array<{ type: "markdown" | "diagram"; content?: string; json?: string; diagramIndex?: number }> = [];

    // Split by diagram placeholders and create parts
    const placeholderRegex = /__DIAGRAM_(\d+)__/g;
    let lastIndex = 0;
    let match;
    const matches: Array<{ index: number; position: number; diagramIdx: number }> = [];

    // Find all placeholder positions
    while ((match = placeholderRegex.exec(parsedContent.markdown)) !== null) {
      matches.push({
        index: match.index,
        position: match.index + match[0].length,
        diagramIdx: parseInt(match[1], 10),
      });
    }

    // Sort matches by position (should already be sorted, but just in case)
    matches.sort((a, b) => a.index - b.index);

    // Build parts array
    matches.forEach((matchInfo) => {
      // Add markdown before diagram
      if (matchInfo.index > lastIndex) {
        const markdownPart = parsedContent.markdown.substring(lastIndex, matchInfo.index).trim();
        if (markdownPart) {
          parts.push({ type: "markdown", content: markdownPart });
        }
      }

      // Add diagram
      const diagram = parsedContent.diagrams.find(d => d.index === matchInfo.diagramIdx);
      if (diagram) {
        console.log(`[MarkdownRenderer] Adding diagram ${diagram.index} to render queue`);
        parts.push({ type: "diagram", json: diagram.json, diagramIndex: diagram.index });
      } else {
        console.warn(`[MarkdownRenderer] Diagram with index ${matchInfo.diagramIdx} not found!`);
      }

      lastIndex = matchInfo.position;
    });

    // Add remaining markdown
    if (lastIndex < parsedContent.markdown.length) {
      const markdownPart = parsedContent.markdown.substring(lastIndex).trim();
      if (markdownPart) {
        parts.push({ type: "markdown", content: markdownPart });
      }
    }

    // Render parts
    return (
      <>
        {parts.map((part, index) => {
          if (part.type === "diagram" && part.json) {
            return (
              <DiagramRenderer 
                key={`diagram-${part.diagramIndex}-${index}`} 
                json={part.json} 
              />
            );
          } else if (part.type === "markdown" && part.content) {
            return (
              <ReactMarkdown
                key={`markdown-${index}`}
                remarkPlugins={[
                  remarkGfm,
                  [remarkMath, { singleDollarTextMath: true }]
                ]}
                rehypePlugins={[
                  rehypeKatex,
                  [rehypeHighlight, { detect: true, ignoreMissing: true }],
                  rehypeRaw
                ]}
              >
                {part.content}
              </ReactMarkdown>
            );
          }
          return null;
        })}
      </>
    );
  }, [parsedContent]);

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none leading-relaxed ${className}`}>
      {renderContent}
    </div>
  );
}