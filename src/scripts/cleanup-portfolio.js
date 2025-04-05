import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const portfolioDir = path.join(__dirname, '../content/portfolio');
const files = fs.readdirSync(portfolioDir);

// Map of base names to their corresponding files
const fileMap = new Map();

// Process each file
files.forEach(file => {
  if (file === '.DS_Store') return;
  
  const baseName = file.replace(/^(case-study-)?/, '').replace(/\.md$/, '');
  if (!fileMap.has(baseName)) {
    fileMap.set(baseName, []);
  }
  fileMap.get(baseName).push(file);
});

// Process duplicates
fileMap.forEach((files, baseName) => {
  if (files.length > 1) {
    console.log(`\nFound duplicates for ${baseName}:`);
    files.forEach(file => {
      const content = fs.readFileSync(path.join(portfolioDir, file), 'utf8');
      const hasCaseStudy = file.startsWith('case-study-');
      const lines = content.split('\n');
      const hasContent = lines.length > 10; // More than just frontmatter
      
      console.log(`- ${file} (${hasCaseStudy ? 'case-study' : 'regular'}, ${hasContent ? 'has content' : 'empty'})`);
    });
  }
});

console.log('\nRecommendations:');
fileMap.forEach((files, baseName) => {
  if (files.length > 1) {
    const caseStudyFiles = files.filter(f => f.startsWith('case-study-'));
    const regularFiles = files.filter(f => !f.startsWith('case-study-'));
    
    if (caseStudyFiles.length > 0) {
      console.log(`\nFor ${baseName}:`);
      console.log(`- Keep: ${caseStudyFiles[0]}`);
      console.log(`- Remove: ${[...caseStudyFiles.slice(1), ...regularFiles].join(', ')}`);
    } else {
      console.log(`\nFor ${baseName}:`);
      console.log(`- Keep: ${regularFiles[0]}`);
      console.log(`- Remove: ${regularFiles.slice(1).join(', ')}`);
    }
  }
}); 