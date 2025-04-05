import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { ContentOptimizer } from './contentOptimizer';
import { Logger } from './logger';
import { ABTestingService } from './abTesting';
import fs from 'fs/promises';
import path from 'path';

export class ContentUpdateJob {
  private optimizer: ContentOptimizer;
  private contentDir: string;
  private backupDir: string;
  private logger: Logger;
  private abTesting: ABTestingService;

  constructor(apiKey: string, contentDir: string) {
    this.optimizer = new ContentOptimizer();
    this.contentDir = contentDir;
    this.backupDir = path.join(process.cwd(), 'content-backups', new Date().toISOString().replace(/:/g, '-'));
    this.logger = new Logger();
    this.abTesting = new ABTestingService(apiKey);
  }

  async run() {
    await this.updateAllContent();
  }

  private async createBackup(filePath: string): Promise<void> {
    try {
      const relativePath = path.relative(process.cwd(), filePath);
      const backupPath = path.join(this.backupDir, relativePath);
      const backupDir = path.dirname(backupPath);
      
      await fs.mkdir(backupDir, { recursive: true });
      
      const content = await fs.readFile(filePath, 'utf-8');
      await fs.writeFile(backupPath, content, 'utf-8');
      
      console.log(`Created backup of ${relativePath}`);
    } catch (error) {
      console.error(`Failed to create backup for ${filePath}:`, error);
      throw error;
    }
  }

  async updateAllContent() {
    const posts = await getCollection('blog');
    const pages = [
      { path: 'src/pages/index.astro', type: 'WebPage' },
      { path: 'src/pages/about.astro', type: 'AboutPage' },
      { path: 'src/pages/portfolio.astro', type: 'CollectionPage' },
      { path: 'src/pages/pricing.astro', type: 'PriceList' }
    ];

    await this.logger.initialize(posts.length + pages.length);
    await this.logger.log(`Creating backups in ${this.backupDir}`);
    
    await this.updateBlogPosts(posts);
    await this.updatePages(pages);
    
    await this.logger.logCompletion();
  }

  private async updateBlogPosts(posts: CollectionEntry<'blog'>[]): Promise<void> {
    for (const post of posts) {
      try {
        const optimized = await this.optimizer.optimizeContent(post);
        await this.updateMarkdownFile(
          path.join(this.contentDir, 'blog', `${post.slug}.md`),
          {
            ...post.data,
            title: optimized.title,
            description: optimized.description,
            keywords: optimized.keywords,
            schema: optimized.schema
          },
          optimized.content
        );
      } catch (error) {
        console.error(`Error updating blog post ${post.slug}:`, error);
      }
    }
  }

  private async updatePages(pages: Array<{ path: string; type: string }>) {
    for (const page of pages) {
      try {
        await this.logger.log(`Optimizing page: ${page.path}`);
        await this.createBackup(page.path);
        
        const content = await fs.readFile(page.path, 'utf-8');
        const frontmatter = this.extractFrontmatter(content);
        
        const variants = await this.abTesting.generateVariants({
          title: frontmatter.title || '',
          description: frontmatter.description || '',
          content: content,
          type: 'page'
        });

        const bestVariant = this.abTesting.selectBestVariant(variants);
        
        await this.logger.log(`Content metrics for ${page.path}:
          Readability: ${bestVariant.metrics.readability.toFixed(2)}
          SEO Score: ${bestVariant.metrics.seoScore.toFixed(2)}
          Keyword Density: ${bestVariant.metrics.keywordDensity.toFixed(2)}%`
        );

        await this.updateAstroFile(
          page.path,
          {
            ...frontmatter,
            title: bestVariant.title,
            description: bestVariant.description,
            keywords: bestVariant.keywords,
            schema: bestVariant.schema
          },
          bestVariant.content
        );

        await this.logger.logProgress(`Page: ${page.path}`);
      } catch (error) {
        await this.logger.logError(error as Error, `Page: ${page.path}`);
      }
    }
  }

  private async updateMarkdownFile(
    filePath: string,
    frontmatter: Record<string, any>,
    content: string
  ) {
    const markdown = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

${content}`;

    await fs.writeFile(filePath, markdown, 'utf-8');
  }

  private async updateAstroFile(
    filePath: string,
    frontmatter: Record<string, any>,
    content: string
  ) {
    const astroContent = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

${content}`;

    await fs.writeFile(filePath, astroContent, 'utf-8');
  }

  private extractFrontmatter(content: string): Record<string, any> {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const frontmatter = match[1];
    const lines = frontmatter.split('\n');
    const result: Record<string, any> = {};

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        try {
          result[key.trim()] = JSON.parse(value);
        } catch {
          result[key.trim()] = value;
        }
      }
    }

    return result;
  }
} 