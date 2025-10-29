"use client";
import { ExternalLink } from "lucide-react";
import type { SearchResult } from "@/types";

interface SourceCardProps {
  source: SearchResult;
  index: number;
}

export default function SourceCard({ source, index }: SourceCardProps) {
  const domain = new URL(source.url).hostname.replace('www.', '');
  
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className="group flex-shrink-0 w-40 border border-border bg-card hover:bg-accent transition-colors p-3 flex flex-col gap-1.5"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-mono text-muted-foreground shrink-0">[{index + 1}]</span>
        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="text-xs font-medium line-clamp-2 leading-tight">
        {source.title || domain}
      </div>
      <div className="text-xs text-muted-foreground truncate">
        {domain}
      </div>
    </a>
  );
}

