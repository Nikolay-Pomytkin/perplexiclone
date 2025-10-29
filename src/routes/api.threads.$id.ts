import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import { getDb, ensureDbInitialized } from "@/lib/db";
import { threads, messages } from "@/lib/schema";
import { eq, asc } from 'drizzle-orm';
import type { Thread, Message, SearchResult } from "@/types";

export const Route = createFileRoute('/api/threads/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { id } = params;
          const db = getDb();
          await ensureDbInitialized();

          // Get thread
          const threadResult = await db.select().from(threads).where(eq(threads.id, id)).limit(1);
          
          if (threadResult.length === 0) {
            return json({ error: 'Thread not found' }, { status: 404 });
          }

          const t = threadResult[0];
          const thread: Thread = {
            id: t.id,
            user_id: t.userId,
            title: t.title,
            created_at: t.createdAt,
            updated_at: t.updatedAt,
          };

          // Get messages
          const messagesRaw = await db.select().from(messages)
            .where(eq(messages.threadId, id))
            .orderBy(asc(messages.createdAt));

          const messagesList: Message[] = messagesRaw.map(msg => ({
            id: msg.id,
            thread_id: msg.threadId,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            sources: msg.sources ? JSON.parse(msg.sources) as SearchResult[] : undefined,
            created_at: msg.createdAt,
          }));

          return json({ thread, messages: messagesList });
        } catch (err: any) {
          const msg = err?.message || "Unknown error";
          return json({ error: msg }, { status: 400 });
        }
      },
      DELETE: async ({ params }) => {
        try {
          const { id } = params;
          const db = getDb();
          await ensureDbInitialized();

          // Delete thread (messages will be cascade deleted)
          await db.delete(threads).where(eq(threads.id, id));

          // Verify deletion by checking if thread still exists
          const deleted = await db.select().from(threads).where(eq(threads.id, id)).limit(1);
          if (deleted.length > 0) {
            return json({ error: 'Thread not found' }, { status: 404 });
          }

          return json({ success: true });
        } catch (err: any) {
          const msg = err?.message || "Unknown error";
          return json({ error: msg }, { status: 400 });
        }
      }
    }
  }
});
