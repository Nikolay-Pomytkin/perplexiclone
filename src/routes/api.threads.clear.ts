import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import { z } from "zod";
import { getDb, ensureDbInitialized } from "@/lib/db";
import { threads } from "@/lib/schema";
import { eq } from 'drizzle-orm';

const BodySchema = z.object({
  user_id: z.string().uuid(),
});

export const Route = createFileRoute('/api/threads/clear')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { user_id } = BodySchema.parse(body);
          
          const db = getDb();
          await ensureDbInitialized();
          
          // Delete all threads for this user (messages will cascade delete)
          await db.delete(threads).where(eq(threads.userId, user_id));
          
          return json({ success: true });
        } catch (err: any) {
          const msg = err?.message || "Unknown error";
          return json({ error: msg }, { status: 400 });
        }
      }
    }
  }
});

