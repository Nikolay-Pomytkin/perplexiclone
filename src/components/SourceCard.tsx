"use client";
import { ExternalLink } from "lucide-react";
import type { SearchResult } from "@/types";

interface SourceCardProps {
  source: SearchResult;
  index: number;
  compact?: boolean;
}

export default function SourceCard({ source, index, compact }: SourceCardProps) {
  const domain = new URL(source.url).hostname.replace('www.', '');
  
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className={`group shrink-0 border border-border bg-card hover:bg-accent transition-colors flex flex-col ${
        compact ? 'w-32 p-2 gap-1' : 'w-40 p-3 gap-1.5'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`font-mono text-muted-foreground shrink-0 ${compact ? 'text-[10px]' : 'text-xs'}`}>[{index + 1}]</span>
        <ExternalLink className={`text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
      </div>
      <div className={`font-medium line-clamp-2 leading-tight ${compact ? 'text-[10px]' : 'text-xs'}`}>
        {source.title || domain}
      </div>
      <div className={`text-muted-foreground truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>
        {domain}
      </div>
    </a>
  );
}

