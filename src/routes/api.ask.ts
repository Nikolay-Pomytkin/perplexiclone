import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import OpenAI from "openai";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { webSearch, imageSearch } from "@/lib/search";
import { scrapeMany } from "@/lib/scrape";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import { getDb, ensureDbInitialized } from "@/lib/db";
import { getOrCreateUserInDb } from "@/lib/user";
import { threads, messages } from "@/lib/schema";
import { eq, desc } from 'drizzle-orm';
import type { AskResponse, ScrapedDoc } from "@/types";

const BodySchema = z.object({ 
  query: z.string().min(3),
  user_id: z.string().uuid(),
  thread_id: z.string().uuid().optional(),
  model: z.string().optional(),
  stream: z.boolean().optional(),
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const Route = createFileRoute('/api/ask')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { query, user_id, thread_id, model, stream } = BodySchema.parse(body);
          const db = getDb();
          await ensureDbInitialized();

          // Ensure user exists
          await getOrCreateUserInDb(user_id);

          // Get or create thread
          let currentThreadId = thread_id;
          if (!currentThreadId) {
            // Create new thread with title from first question
            currentThreadId = uuidv4();
            const title = query.length > 50 ? query.substring(0, 50) + '...' : query;
            await db.insert(threads).values({
              id: currentThreadId,
              userId: user_id,
              title,
            });
          } else {
            // Update thread's updated_at
            await db.update(threads)
              .set({ updatedAt: Math.floor(Date.now() / 1000) })
              .where(eq(threads.id, currentThreadId));
          }

          // Fetch previous messages for context (limit to last 10 messages to avoid context overflow)
          const prevMessages = await db.select({
            role: messages.role,
            content: messages.content,
          })
            .from(messages)
            .where(eq(messages.threadId, currentThreadId))
            .orderBy(desc(messages.createdAt))
            .limit(10);
          
          const reversedMessages = prevMessages.reverse();

          // 1) Search - both web and images
          const [results, imageResults] = await Promise.all([
            webSearch(query, 5),
            imageSearch(query, 6),
          ]);

          // 2) Scrape (best-effort)
          const docsRaw = await scrapeMany(results.map(r => r.url));

          // Attach 1-based ids to align with [n]
          const docs: ScrapedDoc[] = docsRaw.map((d, i) => ({ id: i + 1, ...d }));

          // 3) Build prompts
          const system = buildSystemPrompt();
          const user = buildUserPrompt(query, docs);

          // 4) Build conversation history
          const conversationHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: system },
          ];

          // Add previous messages (they already have user/assistant roles)
          for (const msg of reversedMessages) {
            conversationHistory.push({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            });
          }

          // Add current query
          conversationHistory.push({ role: 'user', content: user });

          // Save user message immediately
          await db.insert(messages).values({
            id: uuidv4(),
            threadId: currentThreadId,
            role: 'user',
            content: query,
            sources: null,
            images: null,
            model: null,
          });

          const selectedModel = model || "gpt-4o-mini";

          // 5) Handle streaming or non-streaming response
          if (stream) {
            // Streaming mode
            const encoder = new TextEncoder();
            const streamResponse = new ReadableStream({
              async start(controller) {
                try {
                  // Send metadata first
                  const metadata = {
                    sources: results,
                    images: imageResults,
                    thread_id: currentThreadId,
                  };
                  controller.enqueue(encoder.encode(`event: metadata\ndata: ${JSON.stringify(metadata)}\n\n`));

                  // Stream from OpenAI
                  const stream = await openai.chat.completions.create({
                    model: selectedModel,
                    messages: conversationHistory,
                    temperature: 0.2,
                    stream: true,
                  });

                  let fullContent = '';
                  for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                      fullContent += content;
                      controller.enqueue(encoder.encode(`event: token\ndata: ${JSON.stringify({ content })}\n\n`));
                    }
                  }

                  // Save complete message to DB
                  const messageId = uuidv4();
                  await db.insert(messages).values({
                    id: messageId,
                    threadId: currentThreadId,
                    role: 'assistant',
                    content: fullContent,
                    sources: JSON.stringify(results),
                    images: imageResults.length > 0 ? JSON.stringify(imageResults) : null,
                    model: selectedModel,
                  });

                  // Send done event
                  controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ message_id: messageId })}\n\n`));
                  controller.close();
                } catch (error: any) {
                  const errorMsg = error?.message || "Streaming error";
                  controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: errorMsg })}\n\n`));
                  controller.close();
                }
              },
            });

            return new Response(streamResponse, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
              },
            });
          } else {
            // Non-streaming mode (original behavior)
            const completion = await openai.chat.completions.create({
              model: selectedModel,
              messages: conversationHistory,
              temperature: 0.2,
            });

            const answer_md = completion.choices[0]?.message?.content?.trim() || "No answer.";

            // Save assistant message to DB
            const messageId = uuidv4();
            await db.insert(messages).values({
              id: messageId,
              threadId: currentThreadId,
              role: 'assistant',
              content: answer_md,
              sources: JSON.stringify(results),
              images: imageResults.length > 0 ? JSON.stringify(imageResults) : null,
              model: selectedModel,
            });

            const payload: AskResponse = {
              answer_md,
              sources: results,
              images: imageResults,
              thread_id: currentThreadId,
              message_id: messageId,
            };

            return json(payload);
          }
        } catch (err: any) {
          const msg = err?.message || "Unknown error";
          return json({ error: msg }, { status: 400 });
        }
      }
    }
  }
});
