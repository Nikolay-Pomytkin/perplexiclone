"use client";
import { useEffect, useRef } from "react";
import type { SearchResult } from "@/types";

interface SourcesProps {
  items: SearchResult[];
  highlightedIndex?: number | null;
}

export default function Sources({ items, highlightedIndex }: SourcesProps) {
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (highlightedIndex !== null && highlightedIndex !== undefined) {
      const index = highlightedIndex - 1; // Convert 1-based to 0-based
      const element = sourceRefs.current[index];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedIndex]);

  if (!items?.length) return null;
  
  return (
    <div className="mt-6 border-t border-border pt-6">
      <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Sources</h3>
      <div className="space-y-2">
        {items.map((s, i) => {
          const isHighlighted = highlightedIndex === i + 1;
          return (
            <div 
              key={s.url} 
              ref={(el) => { sourceRefs.current[i] = el; }}
              id={`source-${i + 1}`}
              className={`border border-border p-3 text-sm transition-all duration-300 ${
                isHighlighted ? 'bg-accent border-black shadow-sm' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="font-mono text-xs text-muted-foreground shrink-0">[{i + 1}]</span>
                <div className="flex-1 min-w-0">
                  <a 
                    className="font-medium text-foreground hover:underline block truncate" 
                    href={s.url} 
                    target="_blank" 
                    rel="noreferrer"
                    title={s.title || s.url}
                  >
                    {s.title || s.url}
                  </a>
                  {s.snippet && (
                    <p className="text-muted-foreground mt-1 text-xs line-clamp-2">
                      {s.snippet}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

