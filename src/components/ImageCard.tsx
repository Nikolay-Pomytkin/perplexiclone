"use client";
import { ExternalLink } from "lucide-react";
import type { ImageResult } from "@/types";
import { useState } from "react";

interface ImageCardProps {
  image: ImageResult;
  compact?: boolean;
}

export default function ImageCard({ image, compact = false }: ImageCardProps) {
  const [imageError, setImageError] = useState(false);
  const imgSrc = image.thumbnail || image.url;

  if (imageError) return null;

  return (
    <a
      href={image.url}
      target="_blank"
      rel="noreferrer"
      className={`group shrink-0 border border-border bg-card hover:bg-accent transition-colors flex flex-col overflow-hidden ${
        compact ? 'w-24' : 'w-32'
      }`}
    >
      <div className={`relative bg-muted ${compact ? 'h-24' : 'h-32'}`}>
        <img
          src={imgSrc}
          alt={image.title || 'Search result image'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      </div>
      {!compact && image.title && (
        <div className="p-2">
          <div className="text-xs line-clamp-2 leading-tight">
            {image.title}
          </div>
        </div>
      )}
    </a>
  );
}

