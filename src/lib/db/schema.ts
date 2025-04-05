import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable, timestamp } from 'drizzle-orm/sqlite-core';

export const rssFeeds = sqliteTable('rss_feeds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  lastFetched: timestamp('last_fetched').default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const rssItems = sqliteTable('rss_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  feedId: integer('feed_id').references(() => rssFeeds.id),
  guid: text('guid').notNull().unique(),
  title: text('title').notNull(),
  link: text('link').notNull(),
  description: text('description'),
  content: text('content'),
  pubDate: timestamp('pub_date').notNull(),
  author: text('author'),
  categories: text('categories'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}); 