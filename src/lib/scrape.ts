import { JSDOM } from "jsdom";
// @ts-ignore—package doesn't ship types
import { Readability } from "@mozilla/readability";
import type { ScrapedDoc } from "@/types";

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0 (ResearchBot)" }});
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function clean(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\|/g, "|")
    .trim();
}

export async function scrapeMany(urls: string[]): Promise<Pick<ScrapedDoc,"title"|"url"|"content">[]> {
  const jobs = urls.map(async (url) => {
    try {
      const html = await fetchWithTimeout(url);
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      const title = article?.title || dom.window.document.title || url;
      const content = clean((article?.textContent || "").slice(0, 20_000));
      return { title, url, content };
    } catch {
      return { title: url, url, content: "" };
    }
  });
  const results = await Promise.all(jobs);
  return results.filter((r) => r.content.length > 200);
}

