import fs from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import sanitizeFilename from 'sanitize-filename';
import https from 'https';

// Initialize Turndown for HTML to Markdown conversion
const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Function to download an image
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (error) => {
        fileStream.close();
        reject(error);
      });
    }).on('error', reject);
  });
}

// Function to fetch all blog post URLs
async function getAllBlogUrls() {
  try {
    const response = await fetch('https://blueroad.ee/blog');
    const html = await response.text();
    const dom = new JSDOM(html);
    
    const links = dom.window.document.querySelectorAll('a[href*="tpost"]');
    
    const urls = Array.from(links)
      .map(link => link.href)
      .filter(href => href.includes('tpost'))
      .map(href => {
        if (href.startsWith('/')) {
          return `https://blueroad.ee${href}`;
        }
        return href;
      });
    
    return [...new Set(urls)];
  } catch (error) {
    console.error('Error fetching blog URLs:', error);
    return [];
  }
}

async function fetchTildaPost(url) {
  console.log(`Fetching: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    return html;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

function extractMetadata(dom) {
  const doc = dom.window.document;
  
  // Try multiple selectors to find the title
  const title = 
    doc.querySelector('.t-entry__title')?.textContent ||
    doc.querySelector('.t-title h1')?.textContent ||
    doc.querySelector('.t-title')?.textContent ||
    doc.querySelector('h1')?.textContent ||
    doc.querySelector('title')?.textContent?.split('|')[0] ||
    'Untitled';

  // Try multiple selectors for description
  const description = 
    doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
    doc.querySelector('.t-entry__descr')?.textContent ||
    doc.querySelector('.t-descr')?.textContent ||
    '';

  // Try to find the date
  const dateElement = 
    doc.querySelector('.t-entry__date') ||
    doc.querySelector('.t-date') ||
    doc.querySelector('time');
  
  const dateText = dateElement?.textContent || 
                  dateElement?.getAttribute('datetime') || 
                  new Date().toISOString().split('T')[0];

  // Try to find the main image
  const mainImage = 
    doc.querySelector('.t-entry__pic img')?.getAttribute('src') ||
    doc.querySelector('.t-img')?.getAttribute('src') ||
    doc.querySelector('article img')?.getAttribute('src') ||
    '';
  
  return {
    title: title.trim(),
    description: description.trim(),
    pubDate: dateText.trim(),
    image: mainImage,
    category: "blog",
    author: "Igor Polyakov"
  };
}

function cleanContent(dom) {
  // Try multiple possible content selectors
  const article = 
    dom.window.document.querySelector('.t-entry__post') ||
    dom.window.document.querySelector('.t-text') ||
    dom.window.document.querySelector('article') ||
    dom.window.document.querySelector('.t-content');

  if (!article) {
    console.warn('Could not find main content container');
    return '';
  }
  
  const removeSelectors = [
    '.t-share',
    '.t-comments',
    '.t-related',
    '.t-footer',
    '.t-entry__social',
    '.t-entry__bottom',
    '.t-entry__tags'
  ];
  
  removeSelectors.forEach(selector => {
    article.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  return article.innerHTML;
}

// Function to handle image paths
async function processImages(content, slug) {
  const dom = new JSDOM(content);
  const images = dom.window.document.querySelectorAll('img');
  
  const imagesDir = path.join('public', 'blog', slug);
  await mkdir(imagesDir, { recursive: true }).catch(err => {
    if (err.code !== 'EEXIST') throw err;
  });

  for (const img of images) {
    if (img.src) {
      try {
        const imageUrl = new URL(img.src);
        const imageName = sanitizeFilename(path.basename(imageUrl.pathname));
        const newImagePath = path.join('blog', slug, imageName);
        const fullImagePath = path.join('public', newImagePath);

        await downloadImage(img.src, fullImagePath);
        img.src = `/${newImagePath}`;
      } catch (error) {
        console.error(`Failed to process image ${img.src}:`, error);
      }
    }
  }

  return dom.window.document.body.innerHTML;
}

function createFrontmatter(metadata) {
  return `---
title: "${metadata.title.replace(/"/g, '\\"')}"
description: "${metadata.description.replace(/"/g, '\\"')}"
pubDate: "${metadata.pubDate}"
image: "${metadata.image}"
category: "${metadata.category}"
author: "${metadata.author}"
---

`;
}

async function convertPost(html) {
  if (!html) return null;
  
  const dom = new JSDOM(html);
  const metadata = extractMetadata(dom);
  const content = cleanContent(dom);
  
  const slug = sanitizeFilename(metadata.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''));
  
  const processedContent = await processImages(content, slug);
  
  if (metadata.image) {
    try {
      const imageUrl = new URL(metadata.image);
      const imageName = sanitizeFilename(path.basename(imageUrl.pathname));
      const newImagePath = path.join('blog', slug, imageName);
      const fullImagePath = path.join('public', newImagePath);

      await downloadImage(metadata.image, fullImagePath);
      metadata.image = `/${newImagePath}`;
    } catch (error) {
      console.error('Failed to process main image:', error);
    }
  }
  
  const markdown = turndown.turndown(processedContent);
  
  return {
    metadata,
    content: createFrontmatter(metadata) + markdown,
    slug
  };
}

async function savePost(post, outputDir) {
  if (!post) return;
  
  const filename = `${post.slug || 'untitled'}.md`;
  const filepath = path.join(outputDir, filename);
  
  await mkdir(outputDir, { recursive: true }).catch(err => {
    if (err.code !== 'EEXIST') throw err;
  });
  
  await writeFile(filepath, post.content, 'utf-8');
  console.log(`Saved: ${filepath}`);
}

async function migrateFromTilda(urls, outputDir = 'src/content/blog') {
  for (const url of urls) {
    try {
      console.log(`Processing: ${url}`);
      const html = await fetchTildaPost(url);
      const post = await convertPost(html);
      await savePost(post, outputDir);
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
    }
  }
}

// Main execution
async function main() {
  const blogUrls = await getAllBlogUrls();
  console.log('Found blog posts:', blogUrls.length);
  console.log('URLs:', blogUrls);
  
  if (blogUrls.length > 0) {
    await migrateFromTilda(blogUrls);
  } else {
    console.log('No blog posts found');
  }
}

main().catch(console.error);