import Parser from 'rss-parser';
import { db } from '../db';
import { rssFeeds, rssItems } from '../db/schema';
import { eq } from 'drizzle-orm';

const parser = new Parser();

export interface RSSFeed {
  url: string;
  title: string;
  description?: string;
}

export interface RSSItem {
  guid: string;
  title: string;
  link: string;
  description?: string;
  content?: string;
  pubDate: string;
  author?: string;
  categories?: string[];
}

export class RSSService {
  static async addFeed(feed: RSSFeed) {
    const existingFeed = await db.select().from(rssFeeds).where(eq(rssFeeds.url, feed.url));
    
    if (existingFeed.length > 0) {
      return existingFeed[0];
    }

    const [newFeed] = await db.insert(rssFeeds).values({
      url: feed.url,
      title: feed.title,
      description: feed.description,
    }).returning();

    return newFeed;
  }

  static async fetchAndStoreFeed(feedId: number, feedUrl: string) {
    try {
      const feed = await parser.parseURL(feedUrl);
      
      // Update feed metadata
      await db.update(rssFeeds)
        .set({
          title: feed.title,
          description: feed.description,
          lastFetched: new Date(),
        })
        .where(eq(rssFeeds.id, feedId));

      // Process and store items
      for (const item of feed.items) {
        const existingItem = await db.select()
          .from(rssItems)
          .where(eq(rssItems.guid, item.guid || item.link));

        if (existingItem.length === 0) {
          await db.insert(rssItems).values({
            feedId,
            guid: item.guid || item.link,
            title: item.title,
            link: item.link,
            description: item.description,
            content: item.content,
            pubDate: new Date(item.pubDate || item.isoDate),
            author: item.author,
            categories: item.categories?.join(','),
          });
        }
      }

      return true;
    } catch (error) {
      console.error(`Error fetching feed ${feedUrl}:`, error);
      return false;
    }
  }

  static async getAllFeeds() {
    return await db.select().from(rssFeeds);
  }

  static async getFeedItems(feedId: number, limit = 20) {
    return await db.select()
      .from(rssItems)
      .where(eq(rssItems.feedId, feedId))
      .orderBy(rssItems.pubDate)
      .limit(limit);
  }

  static async refreshAllFeeds() {
    const feeds = await this.getAllFeeds();
    const results = await Promise.all(
      feeds.map(feed => this.fetchAndStoreFeed(feed.id, feed.url))
    );
    return results.every(result => result);
  }
} 