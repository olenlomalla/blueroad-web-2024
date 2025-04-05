import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import sanitizeFilename from 'sanitize-filename';
import fetch from 'node-fetch';
import matter from 'gray-matter';
import { parse as parseHTML } from 'node-html-parser';

// Content source types
export enum ContentSource {
  TILDA = 'tilda',
  WORDPRESS = 'wordpress',
  CUSTOM = 'custom'
}

// Content types
export enum ContentType {
  BLOG = 'blog',
  PORTFOLIO = 'portfolio',
  CASE_STUDY = 'case-study',
  PAGE = 'page'
}

export interface ContentItem {
  title: string;
  date: string;
  content: string;
  images: string[];
  author: string;
  description: string;
  category: string;
  slug: string;
  source: ContentSource;
  type: ContentType;
  metadata: Record<string, any>;
}

export interface SiteConfig {
  source: ContentSource;
  baseUrl: string;
  contentTypes: ContentType[];
  selectors: {
    title: string[];
    date: string[];
    content: string[];
    images: string[];
    author: string[];
    description: string[];
    category: string[];
  };
}

export class ContentRetriever {
  private turndown: TurndownService;
  private configs: Map<string, SiteConfig>;
  private outputDir: string;

  constructor() {
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });

    this.configs = new Map();
    this.outputDir = path.join(process.cwd(), 'src', 'content');
  }

  // Add a site configuration
  addSiteConfig(name: string, config: SiteConfig) {
    this.configs.set(name, config);
  }

  // Download and save an image
  private async downloadImage(url: string, outputPath: string): Promise<string> {
    try {
      const response = await fetch(url);
      const buffer = await response.buffer();
      await fs.writeFile(outputPath, buffer);
      return path.basename(outputPath);
    } catch (error) {
      console.error(`Failed to download image ${url}:`, error);
      return '';
    }
  }

  // Process images in content
  private async processImages(content: string, type: ContentType, slug: string): Promise<string> {
    const dom = new JSDOM(content);
    const images = dom.window.document.querySelectorAll('img');
    
    const imagesDir = path.join('public', type, slug);
    await fs.mkdir(imagesDir, { recursive: true }).catch(err => {
      if (err.code !== 'EEXIST') throw err;
    });

    for (const img of images) {
      if (img.src) {
        try {
          const imageUrl = new URL(img.src);
          const imageName = sanitizeFilename(path.basename(imageUrl.pathname));
          const newImagePath = path.join(type, slug, imageName);
          const fullImagePath = path.join('public', newImagePath);

          await this.downloadImage(img.src, fullImagePath);
          img.src = `/${newImagePath}`;
        } catch (error) {
          console.error(`Failed to process image ${img.src}:`, error);
        }
      }
    }

    return dom.window.document.body.innerHTML;
  }

  // Extract content using site config
  private async extractContent(html: string, config: SiteConfig): Promise<Partial<ContentItem>> {
    const root = parseHTML(html);
    
    // Helper function to try multiple selectors
    const trySelectors = (selectors: string[], defaultValue: string = ''): string => {
      for (const selector of selectors) {
        const element = root.querySelector(selector);
        if (element) {
          return element.text.trim();
        }
      }
      return defaultValue;
    };

    // Extract content using config selectors
    const title = trySelectors(config.selectors.title);
    const date = trySelectors(config.selectors.date, new Date().toISOString());
    const content = trySelectors(config.selectors.content);
    const author = trySelectors(config.selectors.author, 'BlueRoad Team');
    const description = trySelectors(config.selectors.description);
    const category = trySelectors(config.selectors.category, 'Uncategorized');

    // Extract images
    const images = config.selectors.images.flatMap(selector => 
      Array.from(root.querySelectorAll(selector))
        .map(img => img.getAttribute('src'))
        .filter(Boolean) as string[]
    );

    return {
      title,
      date,
      content,
      images,
      author,
      description,
      category,
      source: config.source
    };
  }

  // Create frontmatter for content
  private createFrontmatter(item: ContentItem): string {
    const frontmatter = {
      title: item.title,
      pubDate: new Date(item.date).toISOString(),
      description: item.description,
      author: item.author,
      category: item.category,
      source: item.source,
      type: item.type,
      ...item.metadata
    };

    return matter.stringify('', frontmatter).trim() + '\n\n';
  }

  // Save content to file
  private async saveContent(item: ContentItem): Promise<void> {
    const contentDir = path.join(this.outputDir, item.type);
    await fs.mkdir(contentDir, { recursive: true });

    const markdown = this.turndown.turndown(item.content);
    const frontmatter = this.createFrontmatter(item);
    const content = frontmatter + markdown;

    const filepath = path.join(contentDir, `${item.slug}.md`);
    await fs.writeFile(filepath, content, 'utf-8');
    console.log(`✓ Saved: ${filepath}`);
  }

  // Retrieve content from a URL
  async retrieveContent(siteName: string, url: string, type: ContentType): Promise<void> {
    const config = this.configs.get(siteName);
    if (!config) {
      throw new Error(`No configuration found for site: ${siteName}`);
    }

    try {
      console.log(`Retrieving content from: ${url}`);
      
      // Fetch and parse content
      const response = await fetch(url);
      const html = await response.text();
      const extractedContent = await this.extractContent(html, config);

      if (!extractedContent.title) {
        throw new Error('Could not extract title from content');
      }

      // Create slug
      const slug = sanitizeFilename(extractedContent.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''));

      // Process images
      const processedContent = await this.processImages(extractedContent.content || '', type, slug);

      // Create content item
      const contentItem: ContentItem = {
        ...extractedContent as ContentItem,
        content: processedContent,
        slug,
        type,
        metadata: {}
      };

      // Save content
      await this.saveContent(contentItem);
      console.log(`✓ Successfully retrieved: ${contentItem.title}`);
    } catch (error) {
      console.error(`× Failed to retrieve content from ${url}:`, error);
    }
  }

  // Retrieve multiple content items
  async retrieveMultiple(siteName: string, urls: string[], type: ContentType): Promise<void> {
    for (const url of urls) {
      await this.retrieveContent(siteName, url, type);
    }
  }
}

export async function main() {
  const retriever = new ContentRetriever();
  
  // Add your site configurations here
  // retriever.addSiteConfig('example', {
  //   source: ContentSource.CUSTOM,
  //   baseUrl: 'https://example.com',
  //   contentTypes: [ContentType.BLOG],
  //   selectors: {
  //     title: ['h1'],
  //     date: ['.date'],
  //     content: ['.content'],
  //     images: ['img'],
  //     author: ['.author'],
  //     description: ['.description'],
  //     category: ['.category']
  //   }
  // });
  
  // Process URLs
  // await retriever.retrieveMultiple('example', [
  //   'https://example.com/post1',
  //   'https://example.com/post2'
  // ], ContentType.BLOG);
}

// Only run if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 