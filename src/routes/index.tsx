import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import ChatForm from "@/components/ChatForm";
import ChatHistory from "@/components/ChatHistory";
import { AppSidebar } from "@/components/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import type { AskResponse, Thread, Message } from "@/types";

const USER_ID_KEY = 'perplexity_user_id';

export const Route = createFileRoute('/')({ component: App });

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(true);

  // Initialize user ID
  useEffect(() => {
    let storedUserId = localStorage.getItem(USER_ID_KEY);
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem(USER_ID_KEY, storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Load threads when user ID is available
  useEffect(() => {
    if (!userId) return;

    const loadThreads = async () => {
      try {
        const r = await fetch(`/api/threads?user_id=${userId}`);
        if (!r.ok) throw new Error('Failed to load threads');
        const data = await r.json();
        setThreads(data.threads || []);
      } catch (e) {
        console.error('Failed to load threads:', e);
      } finally {
        setLoadingThreads(false);
      }
    };

    loadThreads();
  }, [userId]);

  // Load messages when thread is selected
  useEffect(() => {
    if (!currentThreadId || !userId) return;

    const loadMessages = async () => {
      try {
        const r = await fetch(`/api/threads/${currentThreadId}`);
        if (!r.ok) throw new Error('Failed to load messages');
        const data = await r.json();
        setMessages(data.messages || []);
      } catch (e) {
        console.error('Failed to load messages:', e);
        setError('Failed to load messages');
      }
    };

    loadMessages();
  }, [currentThreadId, userId]);

  const handleSendMessage = async (query: string) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query,
          user_id: userId,
          thread_id: currentThreadId || undefined,
        })
      });
      
      if (!r.ok) {
        const errorData = await r.json();
        throw new Error(errorData.error || "Failed to fetch answer");
      }
      
      const data: AskResponse = await r.json();
      
      // If we created a new thread, update threads list and set as current
      if (!currentThreadId && data.thread_id) {
        setCurrentThreadId(data.thread_id);
        // Reload threads to get the new one
        const threadsRes = await fetch(`/api/threads?user_id=${userId}`);
        if (threadsRes.ok) {
          const threadsData = await threadsRes.json();
          setThreads(threadsData.threads || []);
        }
      }

      // Reload messages to show the new ones
      if (data.thread_id) {
        const messagesRes = await fetch(`/api/threads/${data.thread_id}`);
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages(messagesData.messages || []);
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to fetch answer.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewThread = async () => {
    if (!userId) return;

    try {
      const r = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!r.ok) throw new Error('Failed to create thread');
      const data = await r.json();

      setCurrentThreadId(data.thread.id);
      setMessages([]);
      
      // Reload threads
      const threadsRes = await fetch(`/api/threads?user_id=${userId}`);
      if (threadsRes.ok) {
        const threadsData = await threadsRes.json();
        setThreads(threadsData.threads || []);
      }
    } catch (e) {
      console.error('Failed to create thread:', e);
      setError('Failed to create new thread');
    }
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!userId) return;

    try {
      const r = await fetch(`/api/threads/${threadId}`, {
        method: "DELETE",
      });

      if (!r.ok) throw new Error('Failed to delete thread');

      // If deleted thread was current, clear it
      if (currentThreadId === threadId) {
        setCurrentThreadId(null);
        setMessages([]);
      }

      // Reload threads
      const threadsRes = await fetch(`/api/threads?user_id=${userId}`);
      if (threadsRes.ok) {
        const threadsData = await threadsRes.json();
        setThreads(threadsData.threads || []);
      }
    } catch (e) {
      console.error('Failed to delete thread:', e);
      setError('Failed to delete thread');
    }
  };

  if (loadingThreads || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const currentThread = threads.find(t => t.id === currentThreadId);

  return (
    <SidebarProvider>
      <AppSidebar
        threads={threads}
        currentThreadId={currentThreadId}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
        onDeleteThread={handleDeleteThread}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">
            {currentThread?.title || 'Mini‑Perplexity'}
          </h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex-1 overflow-y-auto">
            {error && (
              <Card className="border-destructive mb-4">
                <CardContent className="pt-6">
                  <div className="text-sm text-destructive">
                    {error}
                  </div>
                </CardContent>
              </Card>
            )}

            {loading && (
              <div className="text-sm text-primary animate-pulse text-center py-4">
                Searching, scraping, and synthesizing...
              </div>
            )}

            <ChatHistory messages={messages} />
          </div>

          <div className="border-t pt-4">
            <ChatForm onSubmit={handleSendMessage} disabled={loading} />
            <p className="text-xs text-muted-foreground text-center mt-2">
              Answers may be imperfect. Check sources.
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
