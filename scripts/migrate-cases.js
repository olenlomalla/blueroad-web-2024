import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const TILDA_URL = 'https://blueroad.ee';
const CASE_STUDIES_SELECTOR = '.t-feed__posts-grid-wrapper article a'; // Tilda blog grid
const OUTPUT_DIR = 'src/content/portfolio';
const IMAGES_DIR = 'public/images/portfolio';

// Ensure directories exist
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(IMAGES_DIR, { recursive: true });

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const buffer = await response.buffer();
    fs.writeFileSync(filename, buffer);
    return filename;
  } catch (error) {
    console.error(`Failed to download image ${url}:`, error);
    return null;
  }
}

function cleanText(text) {
  return text?.replace(/[\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || '';
}

function extractClientInfo(text) {
  const clientMatch = text.match(/Client:\s*([^.]+)/);
  return clientMatch ? cleanText(clientMatch[1]) : '';
}

function extractProjectInfo(text) {
  const projectMatch = text.match(/Project:\s*([^.]+)/);
  return projectMatch ? cleanText(projectMatch[1]) : '';
}

function getElementContent(element) {
  if (!element) return '';
  
  if (element.tagName === 'UL') {
    return Array.from(element.querySelectorAll('li'))
      .map(li => `- ${cleanText(li.textContent)}`)
      .join('\n');
  }
  
  return cleanText(element.textContent);
}

async function scrapeCase(url) {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Get title from h1
  const title = cleanText(document.querySelector('h1')?.textContent);

  // Get date and categories from the metadata line
  const metaText = cleanText(document.querySelector('.t-blog__post-meta')?.textContent);
  const [dateStr, ...categories] = metaText?.split(' ') || [];
  const publishedAt = dateStr ? new Date(dateStr).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  // Find all paragraphs in the document
  const paragraphs = Array.from(document.querySelectorAll('p'));

  // Get client and project info from the first paragraphs
  const introText = paragraphs.slice(0, 2).map(p => p.textContent).join(' ');
  const client = extractClientInfo(introText);
  const projectDesc = extractProjectInfo(introText);

  // Get description (combine project info and first content paragraph)
  const firstContentParagraph = paragraphs.find(p => 
    !p.textContent.includes('Client:') && 
    !p.textContent.includes('Project:') &&
    p.textContent.trim().length > 10
  );
  const description = firstContentParagraph 
    ? `${projectDesc}. ${cleanText(firstContentParagraph.textContent)}`
    : projectDesc;

  // Get all images with absolute URLs
  const images = Array.from(document.querySelectorAll('img'))
    .map(img => {
      const src = img.src || img.getAttribute('src');
      if (!src) return null;
      return src.startsWith('http') ? src : `https://blueroad.ee${src}`;
    })
    .filter(Boolean);

  // Get main content sections
  const contentSections = [];
  const sections = new Map();
  let currentHeading = null;

  // First pass: collect all content under each heading
  for (const element of document.body.children) {
    if (element.tagName === 'H3') {
      currentHeading = cleanText(element.textContent);
      sections.set(currentHeading, []);
    } else if (currentHeading && (element.tagName === 'P' || element.tagName === 'UL')) {
      const content = getElementContent(element);
      if (content && !content.includes('Client:') && !content.includes('Project:')) {
        sections.get(currentHeading).push(content);
      }
    }
  }

  // Second pass: format sections into markdown
  for (const [heading, contents] of sections) {
    if (contents.length > 0) {
      contentSections.push(`## ${heading}\n\n${contents.join('\n\n')}`);
    }
  }

  // Extract meaningful tags
  const tags = Array.from(document.querySelectorAll('strong'))
    .map(el => cleanText(el.textContent))
    .filter(tag => 
      tag && 
      tag.length > 2 && 
      !tag.includes('Client:') &&
      !tag.toLowerCase().includes('overview')
    );

  return {
    title,
    description,
    publishedAt,
    client,
    category: categories[0] || 'Video Production',
    images,
    content: contentSections.join('\n\n'),
    tags
  };
}

async function migrateCase(url) {
  console.log(`Migrating case study: ${url}`);
  const caseData = await scrapeCase(url);
  
  // Download and save images
  const imagesPaths = await Promise.all(
    caseData.images.map(async (imgUrl, index) => {
      const filename = `${path.basename(url)}-${index}.jpg`;
      const localPath = path.join(IMAGES_DIR, filename);
      await downloadImage(imgUrl, localPath);
      return `/images/portfolio/${filename}`;
    })
  );

  // Filter out any null values from failed downloads
  const validImagePaths = imagesPaths.filter(Boolean);

  // Create markdown file
  const markdown = `---
title: "${caseData.title}"
description: "${caseData.description}"
publishedAt: ${caseData.publishedAt}
client: "${caseData.client}"
category: "${caseData.category}"
image: "${validImagePaths[0] || ''}"
gallery: ${JSON.stringify(validImagePaths.slice(1))}
tags: ${JSON.stringify(caseData.tags)}
---

${caseData.content}
`;

  const filename = `${path.basename(url)}.md`;
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), markdown);
  console.log(`Successfully migrated: ${filename}`);
}

async function main() {
  try {
    // First try the direct URL provided
    await migrateCase('https://blueroad.ee/tpost/xmi113j201-case-study-video-production-for-infopath');
    
    // Then try to find other case studies
    const response = await fetch(TILDA_URL);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const caseUrls = Array.from(document.querySelectorAll(CASE_STUDIES_SELECTOR))
      .map(link => link.href)
      .filter(url => url && url !== 'https://blueroad.ee/tpost/xmi113j201-case-study-video-production-for-infopath');

    // Migrate each case study
    for (const url of caseUrls) {
      try {
        await migrateCase(url);
      } catch (error) {
        console.error(`Failed to migrate ${url}:`, error);
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main().catch(console.error); 