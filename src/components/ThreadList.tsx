"use client";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MessageSquare } from "lucide-react";
import type { Thread } from "@/types";

interface ThreadListProps {
  threads: Thread[];
  currentThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: string) => void;
}

export default function ThreadList({
  threads,
  currentThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
}: ThreadListProps) {
  return (
    <div className="w-64 border-r bg-card h-full flex flex-col">
      <div className="p-4 border-b">
        <Button onClick={onNewThread} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Thread
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-accent ${
                  currentThreadId === thread.id ? 'bg-accent' : ''
                }`}
                onClick={() => onSelectThread(thread.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate">{thread.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteThread(thread.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

