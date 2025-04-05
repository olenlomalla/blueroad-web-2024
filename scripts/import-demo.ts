import { importCaseStudies } from '../src/lib/case-studies/import-rss';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runDemo() {
  try {
    const rssFeedPath = path.join(__dirname, '../demo/case-studies.xml');
    
    console.log('Starting case studies import...');
    await importCaseStudies(rssFeedPath);
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error running demo:', error);
  }
}

runDemo(); 