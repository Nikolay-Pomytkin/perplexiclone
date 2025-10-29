"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatForm({ onAsk }: { onAsk: (q: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim().length < 3) return;
        onAsk(q.trim());
      }}
      className="flex gap-2 w-full"
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ask anything…"
        className="flex-1"
      />
      <Button type="submit">Ask</Button>
    </form>
  );
}

