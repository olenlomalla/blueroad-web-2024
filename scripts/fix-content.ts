import { readFile, writeFile, readdir } from 'fs/promises';
import path from 'path';
import { parse, stringify } from 'yaml';

async function fixContent() {
  const portfolioDir = path.join(process.cwd(), 'src/content/portfolio');
  const files = await readdir(portfolioDir);
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    try {
      const filePath = path.join(portfolioDir, file);
      const content = await readFile(filePath, 'utf-8');
      const parts = content.split('---').map(part => part.trim());
      
      if (parts.length < 3) {
        console.error(`Invalid file format for ${file}`);
        continue;
      }
      
      const [before, frontmatter, ...rest] = parts;
      const after = rest.join('---');
      
      if (!frontmatter) {
        console.error(`No frontmatter found in ${file}`);
        continue;
      }
      
      const data = parse(frontmatter);
      let modified = false;
      
      // Get the slug from the filename
      const slug = file.replace('.md', '');
      
      // Fix date format - ensure it's a quoted string in ISO format
      if (data.pubDate) {
        const dateStr = new Date(data.pubDate).toISOString();
        if (data.pubDate !== dateStr) {
          data.pubDate = dateStr;
          modified = true;
        }
      }
      
      // Fix main image path
      if (data.image) {
        const expectedPath = `/images/portfolio/${slug}/main.jpg`;
        if (data.image !== expectedPath) {
          data.image = expectedPath;
          modified = true;
        }
      }
      
      // Fix gallery image paths
      if (data.gallery) {
        const expectedGallery = {
          design: `/images/portfolio/${slug}/design.jpg`,
          prototype: `/images/portfolio/${slug}/prototype.jpg`,
          details: `/images/portfolio/${slug}/details.jpg`,
          lifestyle: `/images/portfolio/${slug}/lifestyle.jpg`,
        };
        
        if (JSON.stringify(data.gallery) !== JSON.stringify(expectedGallery)) {
          data.gallery = expectedGallery;
          modified = true;
        }
      }
      
      // Add missing required fields
      if (!data.title) {
        data.title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        modified = true;
      }
      
      if (!data.description) {
        data.description = `${data.title} - A case study by BlueRoad`;
        modified = true;
      }
      
      if (!data.client) {
        data.client = "BlueRoad";
        modified = true;
      }
      
      if (!data.category) {
        data.category = "Case Study";
        modified = true;
      }
      
      if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
        data.tags = ["Case Study", "Portfolio"];
        modified = true;
      }
      
      if (!data.image) {
        data.image = `/images/portfolio/${slug}/main.jpg`;
        modified = true;
      }
      
      if (!data.gallery) {
        data.gallery = {
          design: `/images/portfolio/${slug}/design.jpg`,
          prototype: `/images/portfolio/${slug}/prototype.jpg`,
          details: `/images/portfolio/${slug}/details.jpg`,
          lifestyle: `/images/portfolio/${slug}/lifestyle.jpg`,
        };
        modified = true;
      }
      
      if (modified) {
        // Write the updated content
        const updatedContent = `---\n${stringify(data)}---\n\n${after}`;
        await writeFile(filePath, updatedContent, 'utf-8');
        console.log(`✅ Updated ${file}`);
      } else {
        console.log(`ℹ️ No changes needed for ${file}`);
      }
    } catch (error) {
      console.error(`Error processing ${file}: ${error}`);
    }
  }
}

import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { mkdir } from 'fs/promises';

const exec = promisify(execCallback);

fixContent().catch(error => {
  console.error('Error fixing content:', error);
  process.exit(1);
}); 