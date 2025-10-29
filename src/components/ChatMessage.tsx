"use client";
import Answer from "@/components/Answer";
import Sources from "@/components/Sources";
import { Card, CardContent } from "@/components/ui/card";
import type { Message } from "@/types";

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const date = new Date(message.created_at * 1000);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg px-4 py-2">
          <p className="text-sm">{message.content}</p>
          <p className="text-xs opacity-70 mt-1">{timeStr}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <Card className="max-w-[80%]">
        <CardContent className="pt-6">
          <Answer markdown={message.content} />
          {message.sources && message.sources.length > 0 && (
            <Sources items={message.sources} />
          )}
          <p className="text-xs text-muted-foreground mt-2">{timeStr}</p>
        </CardContent>
      </Card>
    </div>
  );
}

