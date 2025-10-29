"use client";
import { useEffect, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import type { Message } from "@/types";

export default function ChatHistory({ messages, loading }: { messages: Message[]; loading?: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} isLoading={loading && message.id.startsWith('temp-loading')} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

