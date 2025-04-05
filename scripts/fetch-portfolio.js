import { XMLParser } from 'fast-xml-parser';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.buffer();
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, buffer);
    return true;
  } catch (error) {
    console.error(`Error downloading image ${imageUrl}:`, error);
    return false;
  }
}

async function fetchRSS() {
  try {
    console.log('Fetching RSS feed...');
    const response = await fetch('https://blueroad.ee/rss-feed-303667326861.xml');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xml = await response.text();
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "text",
      removeNSPrefix: true,
      parseAttributeValue: true,
      trimValues: true
    });
    
    const feed = parser.parse(xml);
    
    // Extract case studies from the feed
    const caseStudies = feed.rss.channel.item.filter(item => {
      const title = item.title?.toLowerCase() || '';
      return title.includes('case study');
    });

    console.log(`Found ${caseStudies.length} case studies`);

    // Process each case study
    for (const study of caseStudies) {
      const title = study.title;
      const slug = slugify(title, { lower: true, strict: true });
      
      // Extract category from title or content
      let category = 'Case Study';
      if (title.toLowerCase().includes('video production')) {
        category = 'Video Production';
      } else if (title.toLowerCase().includes('3d')) {
        category = '3D Renderings';
      } else if (title.toLowerCase().includes('branding')) {
        category = 'Branding';
      } else if (title.toLowerCase().includes('web') || title.toLowerCase().includes('website')) {
        category = 'Web Design and Development';
      }

      // Handle image
      let imagePath = '/images/portfolio/default.jpg';
      if (study.enclosure?.["@_url"]) {
        const imageUrl = study.enclosure["@_url"];
        const imageExt = path.extname(imageUrl) || '.jpg';
        const imageFileName = `main${imageExt}`;
        imagePath = `/images/portfolio/${slug}/${imageFileName}`;
        
        const imageOutputPath = path.join(__dirname, '..', 'public', imagePath);
        console.log(`Downloading image from ${imageUrl} to ${imageOutputPath}`);
        await downloadImage(imageUrl, imageOutputPath);
      }

      // Format the date properly
      const pubDate = new Date(study.pubDate).toISOString().split('T')[0];

      // Extract client name if available
      const content = study.description || '';
      const clientMatch = content.match(/Client:\s*([^,\n]+)/i);
      const client = clientMatch ? clientMatch[1].trim() : '';

      // Create markdown content
      const mdContent = `---
title: "${title}"
description: "${study.description || ''}"
pubDate: ${pubDate}
image: "${imagePath}"
client: "${client}"
category: "${category}"
tags: ["case study", "${category.toLowerCase()}", "portfolio"]
---

${study.description || ''}
`;

      const filePath = path.join(__dirname, '..', 'src', 'content', 'portfolio', `${slug}.md`);
      await fs.writeFile(filePath, mdContent, 'utf-8');
      console.log(`Created case study: ${slug}`);
    }

    console.log(`Processed ${caseStudies.length} case studies`);
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response text:', await error.response.text());
    }
  }
}

fetchRSS(); 