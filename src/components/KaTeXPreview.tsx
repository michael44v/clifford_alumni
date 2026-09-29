import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface KaTeXPreviewProps {
  text: string;
  className?: string;
}

export default function KaTeXPreview({ text, className = "" }: KaTeXPreviewProps) {
  if (!text) return <span className={`text-gray-400 italic ${className}`}>No preview available</span>;

  // Render function that converts latex strings or raw mathematical expressions into KaTeX HTML
  const renderLaTeX = (content: string) => {
    // Regex matches inline $...$ or \(...\) or raw latex commands like \frac, \sqrt, \int, ^, _, \alpha, etc.
    const parts = content.split(/(\$[^\$]+\$|\\\([^\)]+\\\))/g);

    return parts.map((part, index) => {
      if (!part) return null;

      let latexStr = "";
      let isMath = false;

      if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
        latexStr = part.slice(1, -1);
        isMath = true;
      } else if (part.startsWith("\\(") && part.endsWith("\\)") && part.length > 4) {
        latexStr = part.slice(2, -2);
        isMath = true;
      } else if (/\\(frac|sqrt|int|sum|lim|alpha|beta|theta|pi|infty)|(\^|_)/.test(part)) {
        // Automatically detect raw LaTeX formula expressions even if $ is omitted
        latexStr = part;
        isMath = true;
      }

      if (isMath) {
        try {
          const html = katex.renderToString(latexStr, {
            throwOnError: false,
            displayMode: false,
          });
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{ __html: html }}
              className="inline-block px-1"
            />
          );
        } catch (err) {
          return <span key={index} className="text-red-500 font-mono text-xs">{part}</span>;
        }
      }

      return <span key={index}>{part}</span>;
    });
  };

  return <div className={`inline-text leading-relaxed ${className}`}>{renderLaTeX(text)}</div>;
}
