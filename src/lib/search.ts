import { z } from "zod";
import type { SearchResult, ImageResult } from "@/types";

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

export async function webSearch(query: string, topK = 5): Promise<SearchResult[]> {
  if (SERPAPI_API_KEY) {
    const u = new URL("https://serpapi.com/search.json");
    u.searchParams.set("engine", "google");
    u.searchParams.set("q", query);
    u.searchParams.set("num", String(Math.min(10, topK)));
    u.searchParams.set("api_key", SERPAPI_API_KEY);
    const r = await fetch(u);
    const j = await r.json();
    const organic: any[] = j.organic_results || [];
    return organic.slice(0, topK).map((o, i) => ({
      title: o.title || o.link,
      url: o.link,
      snippet: o.snippet,
      score: organic.length ? (organic.length - i) / organic.length : undefined,
    }));
  }

  // Fallback: no provider configured
  throw new Error("No search provider configured. Set SERPAPI_API_KEY in .env");
}

export async function imageSearch(query: string, topK = 6): Promise<ImageResult[]> {
  if (SERPAPI_API_KEY) {
    const u = new URL("https://serpapi.com/search.json");
    u.searchParams.set("engine", "google_images");
    u.searchParams.set("q", query);
    u.searchParams.set("num", String(Math.min(10, topK)));
    u.searchParams.set("api_key", SERPAPI_API_KEY);
    
    try {
      const r = await fetch(u);
      const j = await r.json();
      const images: any[] = j.images_results || [];
      return images.slice(0, topK).map((img) => ({
        url: img.original || img.link,
        title: img.title || img.source,
        source: img.source,
        thumbnail: img.thumbnail,
      }));
    } catch (error) {
      console.error('Image search failed:', error);
      return [];
    }
  }

  // Return empty array if no provider
  return [];
}

