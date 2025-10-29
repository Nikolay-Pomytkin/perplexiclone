"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

interface ChatFormProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
}

export default function ChatForm({ onSubmit, disabled = false }: ChatFormProps) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim().length < 3 || disabled) return;
        const query = q.trim();
        setQ("");
        onSubmit(query);
      }}
      className="flex gap-2 w-full"
    >
      <Input
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ask anything…"
        className="flex-1 h-11"
        disabled={disabled}
        autoComplete="off"
      />
      <Button 
        type="submit" 
        disabled={disabled || q.trim().length < 3}
        size="lg"
        className="px-6 bg-black hover:bg-black/90 text-white disabled:bg-black/50"
      >
        {disabled ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Ask
          </>
        )}
      </Button>
    </form>
  );
}
