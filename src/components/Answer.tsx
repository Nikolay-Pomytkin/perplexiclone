"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Components } from "react-markdown";

interface AnswerProps {
  markdown: string;
  onCitationClick?: (citationNumber: number) => void;
}

export default function Answer({ markdown, onCitationClick }: AnswerProps) {
  if (!markdown) return null;

  // Custom component to handle citation links [1], [2], etc.
  const components: Components = {
    p: ({ children, ...props }) => {
      // Process text to convert [n] into clickable citations
      const processedChildren = React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          // Split by citation pattern and create clickable elements
          const parts = child.split(/(\[\d+\])/g);
          return parts.map((part, index) => {
            const match = part.match(/\[(\d+)\]/);
            if (match) {
              const citationNum = parseInt(match[1], 10);
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    onCitationClick?.(citationNum);
                  }}
                  className="citation-link inline-flex items-baseline text-[0.7em] font-mono text-primary hover:text-primary/80 hover:underline align-super mx-0.5 cursor-pointer"
                  title={`Go to source ${citationNum}`}
                >
                  {part}
                </button>
              );
            }
            return part;
          });
        }
        return child;
      });

      return <p {...props}>{processedChildren}</p>;
    },
  };

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-primary wrap-break-word overflow-wrap-anywhere">
      <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
    </div>
  );
}

