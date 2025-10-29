"use client";
import type { SearchResult } from "@/types";

export default function Sources({ items }: { items: SearchResult[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-6 border-t border-border pt-6">
      <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Sources</h3>
      <div className="space-y-2">
        {items.map((s, i) => (
          <div key={s.url} className="border border-border p-3 text-sm">
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
        ))}
      </div>
    </div>
  );
}

