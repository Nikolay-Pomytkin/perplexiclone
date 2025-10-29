"use client";
import { useState } from "react";
import Answer from "@/components/Answer";
import Sources from "@/components/Sources";
import SourceCard from "@/components/SourceCard";
import ImageCard from "@/components/ImageCard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, Link2, Image } from "lucide-react";
import type { Message } from "@/types";

export default function ChatMessage({ message, isLoading, isCompact }: { message: Message; isLoading?: boolean; isCompact?: boolean }) {
  const isUser = message.role === 'user';
  const date = new Date(message.created_at * 1000);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [activeTab, setActiveTab] = useState<'answer' | 'sources' | 'images'>('answer');
  const [highlightedSource, setHighlightedSource] = useState<number | null>(null);

  const handleCitationClick = (citationNumber: number) => {
    setActiveTab('sources');
    setHighlightedSource(citationNumber);
    // Remove highlight after animation
    setTimeout(() => setHighlightedSource(null), 2000);
  };

  if (isUser) {
    return (
      <div className={`flex justify-end ${isCompact ? 'mb-3' : 'mb-6'}`}>
        <div className={`max-w-[85%] md:max-w-[70%] bg-black text-white border border-black wrap-break-word ${
          isCompact ? 'px-3 py-2' : 'px-4 py-3'
        }`}>
          <p className={`${isCompact ? 'text-xs' : 'text-sm'} leading-relaxed`}>{message.content}</p>
          <p className={`${isCompact ? 'text-[10px]' : 'text-xs'} opacity-70 mt-1`}>{timeStr}</p>
        </div>
      </div>
    );
  }

  const hasSources = message.sources && message.sources.length > 0;
  const hasImages = message.images && message.images.length > 0;

  return (
    <div className={`flex justify-start ${isCompact ? 'mb-3' : 'mb-6'}`}>
      <Card className="max-w-[85%] md:max-w-[70%] border border-border">
        <CardContent className={`wrap-break-word ${isCompact ? 'pt-3 pb-3' : 'pt-6'}`}>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className={`${isCompact ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} />
              <span className={`${isCompact ? 'text-xs' : 'text-sm'} wrap-break-word`}>{message.content}</span>
            </div>
          ) : (
            <>
              {/* Images section */}
              {hasImages && (
                <div className={isCompact ? 'mb-2' : 'mb-4'}>
                  <h4 className={`font-bold uppercase tracking-wider text-muted-foreground ${isCompact ? 'text-[10px] mb-1 px-2' : 'text-xs mb-2 px-2'}`}>
                    Images
                  </h4>
                  <div className="-mx-2 overflow-x-auto scrollbar-thin">
                    <div className={`flex gap-2 px-2 ${isCompact ? 'pb-1' : 'pb-2'}`}>
                      {message.images.map((image, idx) => (
                        <ImageCard key={`${image.url}-${idx}`} image={image} compact={isCompact} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sources section */}
              {hasSources && (
                <div className={isCompact ? 'mb-2' : 'mb-4'}>
                  <h4 className={`font-bold uppercase tracking-wider text-muted-foreground ${isCompact ? 'text-[10px] mb-1 px-2' : 'text-xs mb-2 px-2'}`}>
                    Sources
                  </h4>
                  <div className="-mx-2 overflow-x-auto scrollbar-thin">
                    <div className={`flex gap-2 px-2 ${isCompact ? 'pb-1' : 'pb-2'}`}>
                      {message.sources.map((source, idx) => (
                        <SourceCard key={source.url} source={source} index={idx} compact={isCompact} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab navigation */}
              {(hasSources || hasImages) && (
                <div className={`flex gap-1 ${isCompact ? 'mb-2' : 'mb-4'} border-b border-border`}>
                  <button
                    onClick={() => setActiveTab('answer')}
                    className={`flex items-center gap-1.5 ${isCompact ? 'px-2 py-1.5' : 'px-3 py-2'} text-xs font-medium border-b-2 transition-colors ${
                      activeTab === 'answer'
                        ? 'border-black text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FileText className={`${isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                    {!isCompact && 'Answer'}
                  </button>
                  {hasSources && (
                    <button
                      onClick={() => setActiveTab('sources')}
                      className={`flex items-center gap-1.5 ${isCompact ? 'px-2 py-1.5' : 'px-3 py-2'} text-xs font-medium border-b-2 transition-colors ${
                        activeTab === 'sources'
                          ? 'border-black text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Link2 className={`${isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                      {!isCompact && 'Sources'}
                      <span className="text-xs text-muted-foreground">({message.sources.length})</span>
                    </button>
                  )}
                  {hasImages && (
                    <button
                      onClick={() => setActiveTab('images')}
                      className={`flex items-center gap-1.5 ${isCompact ? 'px-2 py-1.5' : 'px-3 py-2'} text-xs font-medium border-b-2 transition-colors ${
                        activeTab === 'images'
                          ? 'border-black text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Image className={`${isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                      {!isCompact && 'Images'}
                      <span className="text-xs text-muted-foreground">({message.images.length})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Tab content */}
              {(hasSources || hasImages) ? (
                <>
                  {activeTab === 'answer' && (
                    <Answer markdown={message.content} onCitationClick={handleCitationClick} isCompact={isCompact} />
                  )}
                  {activeTab === 'sources' && hasSources && (
                    <div className={isCompact ? 'py-1' : 'py-2'}>
                      <Sources items={message.sources} highlightedIndex={highlightedSource} isCompact={isCompact} />
                    </div>
                  )}
                  {activeTab === 'images' && (
                    <div className={isCompact ? 'py-2' : 'py-4'}>
                      {hasImages ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {message.images.map((image, idx) => (
                            <ImageCard key={`${image.url}-${idx}`} image={image} compact={false} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground text-sm">
                          No images found
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* No tabs, just show the answer */
                <Answer markdown={message.content} onCitationClick={handleCitationClick} isCompact={isCompact} />
              )}

              <div className={`flex items-center gap-2 ${isCompact ? 'mt-2 text-[10px]' : 'mt-3 text-xs'} text-muted-foreground`}>
                {message.model && (
                  <>
                    <span className="font-mono">{message.model}</span>
                    <span>•</span>
                  </>
                )}
                <span>{timeStr}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

