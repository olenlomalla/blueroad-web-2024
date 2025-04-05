import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { parse as parseHTML } from 'node-html-parser';
import matter from 'gray-matter';

interface TildaPost {
  title: string;
  date: string;
  content: string;
  images: string[];
  author: string;
  description: string;
  category: string;
}

async function downloadImage(url: string, outputPath: string) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  await fs.writeFile(outputPath, buffer);
  return path.basename(outputPath);
}

async function migrateBlogPost(post: TildaPost) {
  // Create frontmatter
  const frontmatter = {
    title: post.title,
    publishDate: new Date(post.date).toISOString(),
    description: post.description,
    author: post.author,
    image: post.images[0] ? {
      url: `/blog-images/${path.basename(post.images[0])}`,
      alt: post.title
    } : undefined,
    tags: [post.category]
  };

  // Download images
  for (const imageUrl of post.images) {
    const filename = path.basename(imageUrl);
    await downloadImage(
      imageUrl,
      path.join(process.cwd(), 'public', 'blog-images', filename)
    );
  }

  // Create markdown content
  const markdown = matter.stringify(post.content, frontmatter);
  
  // Save to file
  const slug = post.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
    
  await fs.writeFile(
    path.join(process.cwd(), 'src', 'content', 'blog', `${slug}.md`),
    markdown
  );
}

async function migratePortfolioItem(item: TildaPost) {
  // Similar to blog post migration but with portfolio schema
  const frontmatter = {
    title: item.title,
    completionDate: new Date(item.date).toISOString(),
    description: item.description,
    client: "Client Name", // You'll need to extract this from Tilda
    gallery: await Promise.all(item.images.map(async (img) => {
      const filename = await downloadImage(
        img,
        path.join(process.cwd(), 'public', 'portfolio-images', path.basename(img))
      );
      return {
        url: `/portfolio-images/${filename}`,
        alt: item.title
      };
    })),
    category: item.category,
    technologies: [] // You'll need to extract this from Tilda
  };

  const markdown = matter.stringify(item.content, frontmatter);
  
  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
    
  await fs.writeFile(
    path.join(process.cwd(), 'src', 'content', 'portfolio', `${slug}.md`),
    markdown
  );
}

async function scrapeFromTilda(url: string): Promise<TildaPost> {
  const response = await fetch(url);
  const html = await response.text();
  const root = parseHTML(html);

  // Tilda typically uses specific div classes for content
  const articleDiv = root.querySelector('.t-container') || root.querySelector('.t-content');
  
  // Extract title - Tilda often uses 't-title' or specific header classes
  const title = root.querySelector('.t-title, .t-heading')?.text?.trim() 
    || root.querySelector('h1')?.text?.trim() 
    || '';

  // Extract date - Tilda might store this in a data attribute or specific div
  const dateEl = root.querySelector('[data-published-date], .t-date');
  const date = dateEl?.getAttribute('data-published-date') 
    || dateEl?.text?.trim() 
    || new Date().toISOString();

  // Get all images, filtering out icons and small images
  const images = Array.from(root.querySelectorAll('img'))
    .map(img => img.getAttribute('src'))
    .filter(src => src && !src.includes('icon') && !src.includes('logo'))
    .filter(Boolean) as string[];

  // Extract content - Tilda usually wraps main content in specific divs
  const contentElements = root.querySelectorAll('.t-text, .t-body, .t-content p');
  const content = Array.from(contentElements)
    .map(el => el.text.trim())
    .filter(Boolean)
    .join('\n\n');

  // Try to find author information
  const author = root.querySelector('.t-author, .author-name')?.text?.trim() || 'BlueRoad Team';

  // Get meta description or generate from content
  const description = root.querySelector('meta[name="description"]')?.getAttribute('content') 
    || content.slice(0, 160) + '...';

  // Try to find category information
  const category = root.querySelector('.t-category, .category-tag')?.text?.trim() 
    || 'Uncategorized';

  return {
    title,
    date,
    content,
    images,
    author,
    description,
    category
  };
}

// Add this helper function to clean up URLs
function normalizeUrl(url: string): string {
  return url.startsWith('http') ? url : `https:${url}`;
}

// Modify the main function to include error handling and logging
async function main() {
  try {
    // Create necessary directories
    const dirs = [
      'public/blog-images',
      'public/portfolio-images',
      'src/content/blog',
      'src/content/portfolio'
    ];

    for (const dir of dirs) {
      await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
    }

    // Example URLs - replace these with your actual Tilda URLs
    const blogUrls = [
      'https://hotsnow.blueroad.ee/post1',
      'https://hotsnow.blueroad.ee/post2'
    ];

    const portfolioUrls = [
      'https://zarender.blueroad.ee/project1',
      'https://zarender.blueroad.ee/project2'
    ];

    console.log('Starting migration...');

    // Migrate blog posts
    for (const url of blogUrls) {
      try {
        console.log(`Processing blog post: ${url}`);
        const post = await scrapeFromTilda(url);
        await migrateBlogPost(post);
        console.log(`✓ Successfully migrated: ${post.title}`);
      } catch (error) {
        console.error(`× Failed to migrate ${url}:`, error);
      }
    }

    // Migrate portfolio items
    for (const url of portfolioUrls) {
      try {
        console.log(`Processing portfolio item: ${url}`);
        const item = await scrapeFromTilda(url);
        await migratePortfolioItem(item);
        console.log(`✓ Successfully migrated: ${item.title}`);
      } catch (error) {
        console.error(`× Failed to migrate ${url}:`, error);
      }
    }

    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main().catch(console.error); 