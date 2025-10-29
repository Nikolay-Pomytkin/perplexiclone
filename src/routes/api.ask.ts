import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import OpenAI from "openai";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { webSearch } from "@/lib/search";
import { scrapeMany } from "@/lib/scrape";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import { getDb } from "@/lib/db";
import { getOrCreateUserInDb } from "@/lib/user";
import type { AskResponse, ScrapedDoc } from "@/types";

const BodySchema = z.object({ 
  query: z.string().min(3),
  user_id: z.string().uuid(),
  thread_id: z.string().uuid().optional(),
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const Route = createFileRoute('/api/ask')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { query, user_id, thread_id } = BodySchema.parse(body);
          const db = getDb();

          // Ensure user exists
          getOrCreateUserInDb(user_id);

          // Get or create thread
          let currentThreadId = thread_id;
          if (!currentThreadId) {
            // Create new thread with title from first question
            currentThreadId = uuidv4();
            const title = query.length > 50 ? query.substring(0, 50) + '...' : query;
            const insertThread = db.prepare('INSERT INTO threads (id, user_id, title, created_at, updated_at) VALUES (?, ?, ?, strftime("%s", "now"), strftime("%s", "now"))');
            insertThread.run(currentThreadId, user_id, title);
          } else {
            // Update thread's updated_at
            const updateThread = db.prepare('UPDATE threads SET updated_at = strftime("%s", "now") WHERE id = ?');
            updateThread.run(currentThreadId);
          }

          // Fetch previous messages for context (limit to last 10 messages to avoid context overflow)
          const getMessages = db.prepare('SELECT role, content FROM messages WHERE thread_id = ? ORDER BY created_at DESC LIMIT 10');
          const prevMessages = (getMessages.all(currentThreadId) as { role: string; content: string }[]).reverse();

          // 1) Search
          const results = await webSearch(query, 5);

          // 2) Scrape (best-effort)
          const docsRaw = await scrapeMany(results.map(r => r.url));

          // Attach 1-based ids to align with [n]
          const docs: ScrapedDoc[] = docsRaw.map((d, i) => ({ id: i + 1, ...d }));

          // 3) Build prompts
          constйтесь system = buildSystemPrompt();
          const user = buildUserPrompt(query, docs);

          // 4) Build conversation history
          const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: system },
          ];

          // Add previous messages (they already have user/assistant roles)
          for (const msg of prevMessages) {
            messages.push({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            });
          }

          // Add current query
          messages.push({ role: 'user', content: user });

          // 5) Ask LLM
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.2,
          });

          const answer_md = completion.choices[0]?.message?.content?.trim() || "No answer.";

          // 6) Save messages to DB
          const messageId = uuidv4();
          const insertUserMsg = db.prepare('INSERT INTO messages (id, thread_id, role, content, sources, created_at) VALUES (?, ?, ?, ?, ?, strftime("%s", "now"))');
          const insertAssistantMsg = db.prepare('INSERT INTO messages (id, thread_id, role, content, sources, created_at) VALUES (?, ?, ?, ?, ?, strftime("%s", "now"))');

          insertUserMsg.run(uuidv4(), currentThreadId, 'user', query, null);
          insertAssistantMsg.run(messageId, currentThreadId, 'assistant', answer_md, JSON.stringify(results));

          const payload: AskResponse = {
            answer_md,
            sources: results,
            thread_id: currentThreadId,
            message_id: messageId,
          };

          return json(payload);
        } catch (err: any) {
          const msg = err?.message || "Unknown error";
          return json({ error: msg }, { status: 400 });
        }
      }
    }
  }
});
