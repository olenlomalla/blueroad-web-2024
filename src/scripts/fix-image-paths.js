import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const portfolioDir = path.join(__dirname, '../content/portfolio');
const blogDir = path.join(__dirname, '../content/blog');

function analyzeFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  try {
    return yaml.load(match[1]);
  } catch (e) {
    console.error('Error parsing frontmatter:', e);
    return null;
  }
}

function fixImagePath(imagePath, type, slug) {
  if (!imagePath) return imagePath;
  
  // Remove leading slash if present
  imagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Check if path follows our convention
  const expectedPrefix = `images/${type}/${slug}/`;
  if (!imagePath.startsWith(expectedPrefix)) {
    // Fix the path to follow our convention
    const filename = path.basename(imagePath);
    return `images/${type}/${slug}/${filename}`;
  }
  
  return imagePath;
}

function processDirectory(dirPath, type) {
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatter = analyzeFrontmatter(content);
    
    if (!frontmatter) {
      console.log(`Warning: No frontmatter found in ${file}`);
      return;
    }
    
    const slug = file.replace(/\.(md|mdx)$/, '');
    let needsUpdate = false;
    let updatedContent = content;
    
    // Check main image
    if (frontmatter.image) {
      const fixedPath = fixImagePath(frontmatter.image, type, slug);
      if (fixedPath !== frontmatter.image) {
        console.log(`\nIn ${file}:`);
        console.log(`- Updating main image path from: ${frontmatter.image}`);
        console.log(`- To: ${fixedPath}`);
        updatedContent = updatedContent.replace(
          `image: ${frontmatter.image}`,
          `image: ${fixedPath}`
        );
        needsUpdate = true;
      }
    }
    
    // Check gallery images if present
    if (frontmatter.gallery) {
      Object.entries(frontmatter.gallery).forEach(([key, value]) => {
        const fixedPath = fixImagePath(value, type, slug);
        if (fixedPath !== value) {
          console.log(`\nIn ${file}:`);
          console.log(`- Updating gallery ${key} path from: ${value}`);
          console.log(`- To: ${fixedPath}`);
          updatedContent = updatedContent.replace(
            `${key}: ${value}`,
            `${key}: ${fixedPath}`
          );
          needsUpdate = true;
        }
      });
    }
    
    if (needsUpdate) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`Updated ${file}`);
    }
  });
}

console.log('Processing portfolio files...');
processDirectory(portfolioDir, 'portfolio');

console.log('\nProcessing blog files...');
processDirectory(blogDir, 'blog');

console.log('\nDone!'); 