"use client";
import { useEffect, useRef } from "react";
import type { SearchResult } from "@/types";

interface SourcesProps {
  items: SearchResult[];
  highlightedIndex?: number | null;
  isCompact?: boolean;
}

export default function Sources({ items, highlightedIndex, isCompact }: SourcesProps) {
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
    <div className={`${isCompact ? 'mt-3 border-t border-border pt-3' : 'mt-6 border-t border-border pt-6'}`}>
      <h3 className={`font-semibold uppercase tracking-wider ${isCompact ? 'mb-2 text-xs' : 'mb-4 text-sm'}`}>Sources</h3>
      <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
        {items.map((s, i) => {
          const isHighlighted = highlightedIndex === i + 1;
          return (
            <div 
              key={s.url} 
              ref={(el) => { sourceRefs.current[i] = el; }}
              id={`source-${i + 1}`}
              className={`border border-border ${isCompact ? 'p-2 text-xs' : 'p-3 text-sm'} transition-all duration-300 ${
                isHighlighted ? 'bg-accent border-black shadow-sm' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <span className={`font-mono text-muted-foreground shrink-0 ${isCompact ? 'text-[10px]' : 'text-xs'}`}>[{i + 1}]</span>
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
                    <p className={`text-muted-foreground ${isCompact ? 'mt-0.5 text-[10px] line-clamp-1' : 'mt-1 text-xs line-clamp-2'}`}>
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

