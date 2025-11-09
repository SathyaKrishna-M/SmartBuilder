"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
// Use a theme that works in both light and dark modes
import "highlight.js/styles/github.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ 
  content, 
  className = "" 
}: MarkdownRendererProps) {
  // Clean and preprocess the content before rendering
  const cleanedContent = React.useMemo(() => {
    if (!content) return "";
    
    let cleaned = content
      // Fix escaped newlines
      .replace(/\\n/g, "\n")
      // Remove json code block markers (keep the code)
      .replace(/```json\n/g, "```\n")
      .replace(/```json/g, "```")
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
        .replace(/\.\s*\)/g, "\\cdot)");
    };
    
    // Fix Pi and Sigma inside math blocks (more comprehensive)
    // Process all $...$ blocks
    cleaned = cleaned.replace(/\$([^$]+?)\$/g, (match, mathContent) => {
      return `$${fixMathContent(mathContent)}$`;
    });
    
    // Process all $$...$$ blocks
    cleaned = cleaned.replace(/\$\$([^$]+?)\$\$/g, (match, mathContent) => {
      return `$$${fixMathContent(mathContent)}$$`;
    });
    
    return cleaned;
  }, [content]);

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          [remarkMath, { singleDollarTextMath: true }] // Enable $ for inline math
        ]}
        rehypePlugins={[
          rehypeKatex,
          [rehypeHighlight, { detect: true, ignoreMissing: true }],
          rehypeRaw
        ]}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}