import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db';

export function getOrCreateUserId(): string {
  // In server context, we'll get user_id from request headers/cookies
  // For now, this will be called from API routes
  throw new Error('getOrCreateUserId should be called with user_id from client');
}

export function getOrCreateUserInDb(userId: string): string {
  const db = getDb();
  const stmt = db.prepare('SELECT id FROM users WHERE id = ?');
  const existing = stmt.get(userId) as { id: string } | undefined;

  if (!existing) {
    const insert = db.prepare('INSERT INTO users (id, created_at) VALUES (?, strftime("%s", "now"))');
    insert.run(userId);
  }

  return userId;
}

