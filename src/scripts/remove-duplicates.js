import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const portfolioDir = path.join(__dirname, '../content/portfolio');
const archiveDir = path.join(__dirname, '../content/portfolio_archive');

// Create archive directory if it doesn't exist
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

// Files to remove (move to archive)
const filesToArchive = [
  'coinmetro.md',
  'medtrade.md',
  'mydogdna.md',
  'smart-svenska.md'
];

// Move files to archive
filesToArchive.forEach(file => {
  const sourcePath = path.join(portfolioDir, file);
  const destPath = path.join(archiveDir, file);
  
  if (fs.existsSync(sourcePath)) {
    console.log(`Moving ${file} to archive...`);
    fs.renameSync(sourcePath, destPath);
  } else {
    console.log(`Warning: ${file} not found`);
  }
});

console.log('\nDone! Files have been moved to the archive directory.'); 