import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { getDb } from "@/lib/db";
import { getOrCreateUserInDb } from "@/lib/user";
import { threads } from "@/lib/schema";
import { eq, desc } from 'drizzle-orm';
import type { Thread } from "@/types";

const PostBodySchema = z.object({ 
  user_id: z.string().uuid(),
  title: z.string().optional(),
});

export const Route = createFileRoute('/api/threads')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const user_id = url.searchParams.get('user_id');
          
          if (!user_id) {
            return json({ error: 'user_id required' }, { status: 400 });
          }

          const db = getDb();
          const threadsList = await db.select().from(threads)
            .where(eq(threads.userId, user_id))
            .orderBy(desc(threads.updatedAt));

          // Map Drizzle schema fields to API response format
          const mappedThreads: Thread[] = threadsList.map(t => ({
            id: t.id,
            user_id: t.userId,
            title: t.title,
            created_at: t.createdAt,
            updated_at: t.updatedAt,
          }));

          return json({ threads: mappedThreads });
        } catch (err: any) {
          const msg = err?.message || "Unknown error";
          return json({ error: msg }, { status: 400 });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { user_id, title } = PostBodySchema.parse(body);
          const db = getDb();

          // Ensure user exists
          await getOrCreateUserInDb(user_id);

          // Create new thread
          const threadId = uuidv4();
          const threadTitle = title || 'New Conversation';
          await db.insert(threads).values({
            id: threadId,
            userId: user_id,
            title: threadTitle,
          });

          const threadResult = await db.select().from(threads).where(eq(threads.id, threadId)).limit(1);
          const t = threadResult[0];
          if (!t) {
            throw new Error('Failed to create thread');
          }

          // Map Drizzle schema fields to API response format
          const thread: Thread = {
            id: t.id,
            user_id: t.userId,
            title: t.title,
            created_at: t.createdAt,
            updated_at: t.updatedAt,
          };

          return json({ thread });
        } catch (err: any) {
          const msg = err?.message || "Unknown error";
          return json({ error: msg }, { status: 400 });
        }
      }
    }
  }
});

