import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { parse } from 'yaml';
import { caseStudySchema } from '../src/config/project.config';

async function validateContent() {
  const portfolioDir = path.join(process.cwd(), 'src/content/portfolio');
  const files = await readdir(portfolioDir);
  
  let hasErrors = false;
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    try {
      const content = await readFile(path.join(portfolioDir, file), 'utf-8');
      const frontmatter = content.split('---')[1];
      const data = parse(frontmatter);
      
      // Validate against schema
      caseStudySchema.parse(data);
      console.log(`✅ ${file} - Valid`);
    } catch (error) {
      hasErrors = true;
      console.error(`❌ ${file} - Invalid:`, error);
    }
  }
  
  if (hasErrors) {
    process.exit(1);
  }
}

validateContent().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
}); 