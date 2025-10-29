export type SearchResult = {
  title: string;
  url: string;
  snippet?: string;
  score?: number;
};

export type ImageResult = {
  url: string;
  title?: string;
  source?: string;
  thumbnail?: string;
};

export type ScrapedDoc = {
  id: number; // 1-based index for citation labels
  title: string;
  url: string;
  content: string; // cleaned readability text
};

export type AskResponse = {
  answer_md: string; // markdown with inline [n] citations
  sources: SearchResult[]; // shown in Sources list
  thread_id?: string;
  message_id?: string;
};

export type Message = {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SearchResult[];
  model?: string;
  created_at: number;
};

export type Thread = {
  id: string;
  user_id: string;
  title: string;
  created_at: number;
  updated_at: number;
};

export type User = {
  id: string;
  created_at: number;
};

