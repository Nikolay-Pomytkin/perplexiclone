"use client";
import type { SearchResult } from "@/types";

export default function Sources({ items }: { items: SearchResult[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="font-semibold mb-4 text-foreground">Sources</h3>
      <ol className="space-y-3 list-decimal pl-5">
        {items.map((s, i) => (
          <li key={s.url} className="text-sm text-muted-foreground">
            <a 
              className="underline text-primary hover:text-primary/80 font-medium" 
              href={s.url} 
              target="_blank" 
              rel="noreferrer"
            >
              {s.title || s.url}
            </a>
            {s.snippet ? (
              <div className="text-muted-foreground/80 mt-1 line-clamp-2">
                {s.snippet}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

