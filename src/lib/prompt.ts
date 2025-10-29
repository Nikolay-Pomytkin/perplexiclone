import type { ScrapedDoc } from "@/types";

export function buildSystemPrompt() {
  return (
    `You are a careful research assistant. ` +
    `Given a question and a set of web excerpts with numbered sources, write a concise, factual answer in Markdown. ` +
    `IMPORTANT: Use inline numeric citations like [1], [2], [3] frequently throughout your answer. ` +
    `Cite MULTIPLE sources when making claims - use at least 3-4 different sources if available. ` +
    `Each major point should have citations. Prefer citing multiple sources [1][2] for important facts. ` +
    `Avoid speculation. If evidence conflicts, note it briefly with citations. ` +
    `DO NOT include a "Sources mapping" section at the end - the sources will be displayed separately.`
  );
}

export function buildUserPrompt(question: string, docs: ScrapedDoc[]) {
  const header = `Question: ${question}\n\nSources:`;
  const body = docs.map(d => `\n[${d.id}] ${d.title}\nURL: ${d.url}\nExcerpt: ${d.content.slice(0, 2000)}`).join("\n\n");
  const tail = `\n\nWrite the answer now.`;
  return `${header}\n${body}${tail}`;
}

