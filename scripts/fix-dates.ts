import { readFile, writeFile, readdir } from 'fs/promises';
import path from 'path';

async function fixDates() {
  const contentDirs = [
    path.join(process.cwd(), 'src/content/blog'),
    path.join(process.cwd(), 'src/content/portfolio')
  ];
  
  for (const dir of contentDirs) {
    const files = await readdir(dir);
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      try {
        const filePath = path.join(dir, file);
        const content = await readFile(filePath, 'utf-8');
        
        // Replace unquoted dates with quoted dates
        const updatedContent = content.replace(
          /^(pubDate:\s*)(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}\.\d{3}Z)?)/m,
          (_, prefix, date) => `${prefix}"${date}"`
        );
        
        if (content !== updatedContent) {
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
}

fixDates().catch(error => {
  console.error('Error fixing dates:', error);
  process.exit(1);
}); 