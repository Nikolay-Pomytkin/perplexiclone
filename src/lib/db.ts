import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mkdirSync } from 'fs';
import * as schema from './schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use DATABASE_PATH environment variable for Railway volume mounts (e.g., /data)
// Falls back to project root/data for local development
const dbDir = process.env.DATABASE_PATH || join(__dirname, '../../data');
const dbPath = join(dbDir, 'perplexity.db');

// Ensure directory exists
try {
  mkdirSync(dbDir, { recursive: true });
} catch (error) {
  // Directory might already exist, ignore error
}

let libsqlClient: ReturnType<typeof createClient> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;
let initPromise: Promise<void> | null = null;

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  // Create LibSQL client for local SQLite file
  libsqlClient = createClient({
    url: `file:${dbPath}`,
  });
  
  dbInstance = drizzle(libsqlClient, { schema });
  
  // Initialize database tables asynchronously (don't block)
  if (!initPromise) {
    initPromise = initDb();
  }
  
  return dbInstance;
}

// Ensure database is initialized before first use
export async function ensureDbInitialized() {
  getDb(); // Ensure client is created
  if (initPromise) {
    await initPromise;
  }
}

async function initDb() {
  if (!libsqlClient) return;
  
  try {
    // Create tables using raw SQL (Drizzle will handle queries)
    await libsqlClient.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      )
    `);

    await libsqlClient.execute(`
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await libsqlClient.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        sources TEXT,
        images TEXT,
        model TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
      )
    `);

    // Migration: Add model column if it doesn't exist
    try {
      await libsqlClient.execute(`
        ALTER TABLE messages ADD COLUMN model TEXT;
      `);
    } catch (error: any) {
      // Column might already exist, ignore error
      if (!error?.message?.includes('duplicate column')) {
        console.warn('Could not add model column:', error);
      }
    }

    // Migration: Add images column if it doesn't exist
    try {
      await libsqlClient.execute(`
        ALTER TABLE messages ADD COLUMN images TEXT;
      `);
    } catch (error: any) {
      // Column might already exist, ignore error
      if (!error?.message?.includes('duplicate column')) {
        console.warn('Could not add images column:', error);
      }
    }

    // Create indexes for better query performance
    await libsqlClient.execute(`
      CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
      CREATE INDEX IF NOT EXISTS idx_threads_updated_at ON threads(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `);

    // Enable WAL mode for better concurrency
    await libsqlClient.execute(`PRAGMA journal_mode = WAL`);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
