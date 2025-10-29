import type { ScrapedDoc } from "@/types";

export function buildSystemPrompt() {
  return (
    `You are a careful research assistant. ` +
    `Given a question and a set of web excerpts with numbered sources, write a concise, factual answer in Markdown. ` +
    `Use inline numeric citations like [1], [2] immediately after the sentences they support. ` +
    `Avoid speculation. If evidence conflicts, note it briefly with citations. ` +
    `At the end, include a short bullet list titled Sources mapping [n] to Title — URL.`
  );
}

export function buildUserPrompt(question: string, docs: ScrapedDoc[]) {
  const header = `Question: ${question}\n\nSources:`;
  const body = docs.map(d => `\n[${d.id}] ${d.title}\nURL: ${d.url}\nExcerpt: ${d.content.slice(0, 2000)}`).join("\n\n");
  const tail = `\n\nWrite the answer now.`;
  return `${header}\n${body}${tail}`;
}

