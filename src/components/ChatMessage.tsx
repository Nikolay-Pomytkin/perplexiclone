"use client";
import Answer from "@/components/Answer";
import Sources from "@/components/Sources";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Message } from "@/types";

export default function ChatMessage({ message, isLoading }: { message: Message; isLoading?: boolean }) {
  const isUser = message.role === 'user';
  const date = new Date(message.created_at * 1000);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
              <Answer markdown={message.content} />
              {message.sources && message.sources.length > 0 && (
                <div className="mt-4">
                  <Sources items={message.sources} />
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

