import { XMLParser } from 'fast-xml-parser';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import fetch from 'node-fetch';
import { paths, imageConfig, caseStudySchema } from '../../config/project.config';

interface RSSCaseStudy {
  title: string;
  description: string;
  pubDate: string;
  client: string;
  category: string;
  tags: string;
  images: {
    main: string;
    design: string;
    prototype: string;
    details: string;
    lifestyle: string;
  };
}

export async function importCaseStudies(rssFeedPath: string) {
  try {
    // Read local XML file
    const xmlData = await readFile(rssFeedPath, 'utf-8');
    
    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const rssData = parser.parse(xmlData);
    
    // Process each case study
    const caseStudies = rssData.rss.channel.item;
    for (const study of caseStudies) {
      await processCaseStudy(study);
    }
    
    console.log('Case studies import completed successfully');
  } catch (error) {
    console.error('Error importing case studies:', error);
    throw error;
  }
}

async function processCaseStudy(study: RSSCaseStudy) {
  const slug = study.title.toLowerCase().replace(/\s+/g, '-');
  
  // Create directories
  const portfolioDir = path.join(process.cwd(), paths.content.portfolio);
  const imagesDir = path.join(process.cwd(), paths.public.images.portfolio, slug);
  
  await mkdir(portfolioDir, { recursive: true });
  await mkdir(imagesDir, { recursive: true });
  
  // Download and process images
  for (const [type, url] of Object.entries(study.images)) {
    await downloadAndProcessImage(url, path.join(imagesDir, `${type}.${imageConfig.format}`));
  }
  
  // Create markdown file
  const markdown = generateMarkdown(study, slug);
  await writeFile(
    path.join(portfolioDir, `${slug}.md`),
    markdown
  );
  
  // Validate against schema
  const content = {
    title: study.title,
    description: study.description,
    pubDate: study.pubDate,
    client: study.client,
    category: study.category,
    tags: study.tags.split(',').map(tag => tag.trim()),
    image: `/images/portfolio/${slug}/main.${imageConfig.format}`,
    gallery: {
      design: `/images/portfolio/${slug}/design.${imageConfig.format}`,
      prototype: `/images/portfolio/${slug}/prototype.${imageConfig.format}`,
      details: `/images/portfolio/${slug}/details.${imageConfig.format}`,
      lifestyle: `/images/portfolio/${slug}/lifestyle.${imageConfig.format}`,
    },
  };
  
  // This will throw if validation fails
  caseStudySchema.parse(content);
}

async function downloadAndProcessImage(url: string, outputPath: string) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  
  await sharp(buffer)
    .resize(imageConfig.dimensions.width, imageConfig.dimensions.height, { fit: 'cover' })
    .jpeg({ quality: imageConfig.quality })
    .toFile(outputPath);
}

function generateMarkdown(study: RSSCaseStudy, slug: string): string {
  const content = {
    title: study.title,
    description: study.description,
    pubDate: study.pubDate,
    client: study.client,
    category: study.category,
    tags: study.tags.split(',').map(tag => tag.trim()),
    image: `/images/portfolio/${slug}/main.${imageConfig.format}`,
    gallery: {
      design: `/images/portfolio/${slug}/design.${imageConfig.format}`,
      prototype: `/images/portfolio/${slug}/prototype.${imageConfig.format}`,
      details: `/images/portfolio/${slug}/details.${imageConfig.format}`,
      lifestyle: `/images/portfolio/${slug}/lifestyle.${imageConfig.format}`,
    },
  };

  return `---
${Object.entries(content)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

${study.description}
`;
} 