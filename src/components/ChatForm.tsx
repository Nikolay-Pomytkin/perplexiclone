"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatFormProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
}

export default function ChatForm({ onSubmit, disabled = false }: ChatFormProps) {
  const [q, setQ] = useState("");
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
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ask anything…"
        className="flex-1"
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled}>Ask</Button>
    </form>
  );
}
