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
const STREAMING_KEY = 'perplexity_streaming';

export const Route = createFileRoute('/')({ component: App });

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [streaming, setStreaming] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize user ID
  useEffect(() => {
    let storedUserId = localStorage.getItem(USER_ID_KEY);
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem(USER_ID_KEY, storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Initialize theme
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  // Initialize streaming preference
  useEffect(() => {
    const storedStreaming = localStorage.getItem(STREAMING_KEY);
    if (storedStreaming !== null) {
      setStreaming(storedStreaming === 'true');
    }
  }, []);

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

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

  const handleSendMessage = async (query: string, model: string, useStreaming: boolean) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    
    // Add user message immediately to the UI
    const tempUserMessage: Message = {
      id: 'temp-user-' + Date.now(),
      thread_id: currentThreadId || '',
      role: 'user',
      content: query,
      created_at: Math.floor(Date.now() / 1000),
    };
    
    // Add loading/streaming message
    const tempAssistantId = 'temp-assistant-' + Date.now();
    const tempLoadingMessage: Message = {
      id: tempAssistantId,
      thread_id: currentThreadId || '',
      role: 'assistant',
      content: 'Searching, scraping, and synthesizing...',
      created_at: Math.floor(Date.now() / 1000),
    };
    
    setMessages(prev => [...prev, tempUserMessage, tempLoadingMessage]);
    
    try {
      if (useStreaming) {
        // Streaming mode
        const r = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            query,
            user_id: userId,
            thread_id: currentThreadId || undefined,
            model,
            stream: true, // Always true in this branch since useStreaming was checked
          })
        });
        
        if (!r.ok) {
          throw new Error("Failed to fetch answer");
        }

        const reader = r.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) {
          throw new Error("No reader available");
        }

        let buffer = '';
        let accumulatedContent = '';
        let metadata: { sources?: any[], images?: any[], thread_id?: string } = {};

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              // Skip event type lines
              continue;
            }
            
            if (line.startsWith('data:')) {
              const data = line.substring(5).trim();
              if (!data) continue;

              try {
                const parsed = JSON.parse(data);
                
                // Handle different event types based on the data structure
                if (parsed.sources || parsed.images || parsed.thread_id) {
                  // This is metadata
                  metadata = parsed;
                  
                  // Update thread if new
                  if (!currentThreadId && parsed.thread_id) {
                    setCurrentThreadId(parsed.thread_id);
                    // Reload threads
                    const threadsRes = await fetch(`/api/threads?user_id=${userId}`);
                    if (threadsRes.ok) {
                      const threadsData = await threadsRes.json();
                      setThreads(threadsData.threads || []);
                    }
                  }
                  
                  // Update the temp message with sources and images, but keep loading text
                  setMessages(prev => prev.map(m => 
                    m.id === tempAssistantId 
                      ? { 
                          ...m, 
                          sources: parsed.sources || undefined,
                          images: parsed.images || undefined,
                          content: '' // Clear loading message when we get metadata
                        }
                      : m
                  ));
                } else if (parsed.content !== undefined) {
                  // This is a token
                  accumulatedContent += parsed.content;
                  setMessages(prev => prev.map(m => 
                    m.id === tempAssistantId 
                      ? { ...m, content: accumulatedContent }
                      : m
                  ));
                } else if (parsed.message_id) {
                  // This is done event - we don't need to do anything with the message_id here
                  // as we'll reload messages from the DB after streaming completes
                } else if (parsed.error) {
                  // This is an error event
                  throw new Error(parsed.error);
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }

        // After streaming completes, reload messages from DB to get the final saved version
        const threadIdToUse = metadata.thread_id || currentThreadId;
        if (threadIdToUse) {
          const messagesRes = await fetch(`/api/threads/${threadIdToUse}`);
          if (messagesRes.ok) {
            const messagesData = await messagesRes.json();
            setMessages(messagesData.messages || []);
          }
        }
      } else {
        // Non-streaming mode (original behavior)
        const r = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            query,
            user_id: userId,
            thread_id: currentThreadId || undefined,
            model,
            stream: false,
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

        // Reload messages to show the new ones (this will replace temp messages)
        if (data.thread_id) {
          const messagesRes = await fetch(`/api/threads/${data.thread_id}`);
          if (messagesRes.ok) {
            const messagesData = await messagesRes.json();
            setMessages(messagesData.messages || []);
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to fetch answer.");
      // Remove temp messages on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
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

  const handleClearHistory = async () => {
    if (!userId) return;
    
    if (!confirm('Are you sure you want to clear all conversation history? This cannot be undone.')) {
      return;
    }
    
    try {
      const r = await fetch('/api/threads/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      
      if (!r.ok) throw new Error('Failed to clear history');
      
      setThreads([]);
      setCurrentThreadId(null);
      setMessages([]);
    } catch (e) {
      console.error('Failed to clear history:', e);
      setError('Failed to clear history');
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
    <SidebarProvider defaultOpen={true}>
        <AppSidebar
          threads={threads}
          currentThreadId={currentThreadId}
          onSelectThread={handleSelectThread}
          onNewThread={handleNewThread}
          onDeleteThread={handleDeleteThread}
          onClearHistory={handleClearHistory}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 bg-background z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-6" />
          <h1 className="text-base font-semibold tracking-tight">
            {currentThread?.title || 'Mini‑Perplexity'}
          </h1>
        </header>
        <div className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
            {error && (
              <Card className="border-destructive mb-4">
                <CardContent className="pt-6">
                  <div className="text-sm text-destructive">
                    {error}
                  </div>
                </CardContent>
              </Card>
            )}

            {!currentThreadId && messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="max-w-md space-y-6 border border-border p-8">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Welcome to Perplexiclone
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Ask me anything and I'll search the web, scrape relevant sources, 
                    and provide you with a synthesized answer backed by citations.
                  </p>
                </div>
              </div>
            )}

            <ChatHistory messages={messages} loading={loading} isCompact={isCompact} />
          </div>

          <div className="shrink-0 border-t bg-background p-4 md:p-6">
            <div className="mx-auto max-w-3xl">
              <ChatForm 
                onSubmit={handleSendMessage} 
                disabled={loading}
                isCompact={isCompact}
                onCompactToggle={() => setIsCompact(!isCompact)}
                streaming={streaming}
                onStreamingToggle={() => {
                  const newStreaming = !streaming;
                  setStreaming(newStreaming);
                  localStorage.setItem(STREAMING_KEY, String(newStreaming));
                }}
              />
              <p className="text-xs text-muted-foreground text-center mt-2">
                Answers may be imperfect. Check sources.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
