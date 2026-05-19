import { UIMessage } from 'ai';
import { relations } from 'drizzle-orm';
import { pgEnum } from 'drizzle-orm/pg-core';
import { jsonb } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const snippetRole = pgEnum('snippetRole', ['user', 'assistant']);

export const chats = pgTable('chat_conversation', {
  id: uuid('id').defaultRandom().primaryKey(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  snippet: varchar('snippet'),
  snippetRole: snippetRole(),
  title: varchar('title'),
  draft: varchar('draft'),
});

export const messages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatId: uuid('conversation_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  content: jsonb('content').$type<UIMessage>().notNull(),
  role: varchar('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatRelations = relations(chats, ({ many }) => ({
  messages: many(messages),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));

export type StoredChat = typeof chats.$inferSelect;
export type StoredMessage = typeof messages.$inferSelect;
