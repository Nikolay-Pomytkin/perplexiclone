"use client";
import { useState } from "react";
import Answer from "@/components/Answer";
import Sources from "@/components/Sources";
import SourceCard from "@/components/SourceCard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, Link2, Image } from "lucide-react";
import type { Message } from "@/types";

export default function ChatMessage({ message, isLoading }: { message: Message; isLoading?: boolean }) {
  const isUser = message.role === 'user';
  const date = new Date(message.created_at * 1000);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [activeTab, setActiveTab] = useState<'answer' | 'sources' | 'images'>('answer');

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%] md:max-w-[70%] bg-black text-white px-4 py-3 border border-black wrap-break-word">
          <p className="text-sm leading-relaxed">{message.content}</p>
          <p className="text-xs opacity-70 mt-1.5">{timeStr}</p>
        </div>
      </div>
    );
  }

  const hasSources = message.sources && message.sources.length > 0;

  return (
    <div className="flex justify-start mb-6">
      <Card className="max-w-[85%] md:max-w-[70%] border border-border">
        <CardContent className="pt-6 wrap-break-word">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm wrap-break-word">{message.content}</span>
            </div>
          ) : (
            <>
              {/* Horizontal source cards at top */}
              {hasSources && (
                <div className="mb-4 -mx-2 overflow-x-auto scrollbar-thin">
                  <div className="flex gap-2 px-2 pb-2">
                    {message.sources.map((source, idx) => (
                      <SourceCard key={source.url} source={source} index={idx} />
                    ))}
                  </div>
                </div>
              )}

              {/* Tab navigation */}
              {hasSources && (
                <div className="flex gap-1 mb-4 border-b border-border">
                  <button
                    onClick={() => setActiveTab('answer')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                      activeTab === 'answer'
                        ? 'border-black text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Answer
                  </button>
                  <button
                    onClick={() => setActiveTab('sources')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                      activeTab === 'sources'
                        ? 'border-black text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Sources
                    <span className="text-xs text-muted-foreground">({message.sources.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('images')}
                    disabled
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 border-transparent text-muted-foreground opacity-50 cursor-not-allowed"
                  >
                    <Image className="h-3.5 w-3.5" />
                    Images
                  </button>
                </div>
              )}

              {/* Tab content */}
              {activeTab === 'answer' && <Answer markdown={message.content} />}
              {activeTab === 'sources' && hasSources && (
                <div className="py-2">
                  <Sources items={message.sources} />
                </div>
              )}
              {activeTab === 'images' && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Image search coming soon
                </div>
              )}

              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
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

