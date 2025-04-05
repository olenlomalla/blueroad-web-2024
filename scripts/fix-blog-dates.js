import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby';

async function fixBlogDates() {
  try {
    // Get all blog post files
    const blogFiles = await globby('src/content/blog/*.md');
    
    for (const file of blogFiles) {
      // Read file content
      const content = await fs.readFile(file, 'utf-8');
      
      // Replace date: with pubDate: in frontmatter
      const updatedContent = content.replace(/^date:/m, 'pubDate:');
      
      // Write back to file
      await fs.writeFile(file, updatedContent, 'utf-8');
      
      console.log(`Updated ${path.basename(file)}`);
    }
    
    console.log('All blog post dates have been updated.');
  } catch (error) {
    console.error('Error updating blog post dates:', error);
  }
}

fixBlogDates(); 