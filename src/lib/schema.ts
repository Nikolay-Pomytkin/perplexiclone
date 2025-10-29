import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const threads = sqliteTable(
  'threads',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    userIdIdx: index('idx_threads_user_id').on(table.userId),
    updatedAtIdx: index('idx_threads_updated_at').on(table.updatedAt),
  })
);

export const messages = sqliteTable(
  'messages',
  {
    id: text('id').primaryKey(),
    threadId: text('thread_id')
      .notNull()
      .references(() => threads.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['user', 'assistant'] }).notNull(),
    content: text('content').notNull(),
    sources: text('sources'), // JSON string
    model: text('model'), // AI model used
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    threadIdIdx: index('idx_messages_thread_id').on(table.threadId),
    createdAtIdx: index('idx_messages_created_at').on(table.createdAt),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

