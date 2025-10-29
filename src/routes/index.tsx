import { createFileRoute } from '@tanstack/react-router';
import { useState } from "react";
import ChatForm from "@/components/ChatForm";
import Answer from "@/components/Answer";
import Sources from "@/components/Sources";
import { Card, CardContent } from "@/components/ui/card";
import type { AskResponse } from "@/types";

export const Route = createFileRoute('/')({ component: App });

function App() {
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });
      
      if (!r.ok) {
        const errorData = await r.json();
        throw new Error(errorData.error || "Failed to fetch answer");
      }
      
      const data: AskResponse = await r.json();
      setResp(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to fetch answer.");
      setResp(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl p-6 space-y-6">
        <div className="text-center py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Mini‑<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Perplexity</span>
          </h1>
          <p className="text-muted-foreground">
            Ask a question, get an AI-powered answer with sources
          </p>
        </div>

        <div className="space-y-4">
          <ChatForm onAsk={handleAsk} />

          {loading && (
            <div className="text-sm text-primary animate-pulse text-center py-4">
              Searching, scraping, and synthesizing...
            </div>
          )}

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="text-sm text-destructive">
                  {error}
                </div>
              </CardContent>
            </Card>
          )}

          {resp && (
            <Card>
              <CardContent className="pt-6">
                <Answer markdown={resp.answer_md} />
                <Sources items={resp.sources} />
              </CardContent>
            </Card>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Answers may be imperfect. Check sources.
        </p>
      </main>
    </div>
  );
}
