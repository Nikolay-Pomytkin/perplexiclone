import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export function getOrCreateUserId(): string {
  // In server context, we'll get user_id from request headers/cookies
  // For now, this will be called from API routes
  throw new Error('getOrCreateUserId should be called with user_id from client');
}

export async function getOrCreateUserInDb(userId: string): Promise<string> {
  const db = getDb();
  
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);

  if (existing.length === 0) {
    await db.insert(users).values({ id: userId });
  }

  return userId;
}

