"use client";
import ReactMarkdown from "react-markdown";

export default function Answer({ markdown }: { markdown: string }) {
  if (!markdown) return null;
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-primary wrap-break-word overflow-wrap-anywhere">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

