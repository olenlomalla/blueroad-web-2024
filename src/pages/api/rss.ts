import { RSSService } from '../../lib/services/rss-parser';
import { initDatabase } from '../../lib/db';

export async function GET() {
  await initDatabase();
  const feeds = await RSSService.getAllFeeds();
  return new Response(JSON.stringify(feeds), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  await initDatabase();
  const body = await request.json();
  
  try {
    const feed = await RSSService.addFeed({
      url: body.url,
      title: body.title,
      description: body.description,
    });

    // Fetch and store feed items
    await RSSService.fetchAndStoreFeed(feed.id, feed.url);

    return new Response(JSON.stringify(feed), {
      headers: { 'Content-Type': 'application/json' },
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to add feed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}

export async function PUT() {
  await initDatabase();
  const success = await RSSService.refreshAllFeeds();
  
  return new Response(JSON.stringify({ success }), {
    headers: { 'Content-Type': 'application/json' },
  });
} 