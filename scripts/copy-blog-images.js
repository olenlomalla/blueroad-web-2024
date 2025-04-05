import { promises as fs } from 'fs';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Function to copy file
function copyFile(source, target) {
  try {
    if (!existsSync(source)) {
      return false;
    }
    ensureDirectoryExists(dirname(target));
    copyFileSync(source, target);
    console.log(`Copied ${source} to ${target}`);
    return true;
  } catch (err) {
    console.error(`Error copying ${source} to ${target}:`, err);
    return false;
  }
}

// Function to extract image paths from markdown content
function extractImagePaths(content) {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const frontmatterImageRegex = /image:\s*["'](.+?)["']/g;
  const imagePaths = new Set();
  
  // Extract images from markdown content
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    imagePaths.add(match[1]);
  }
  
  // Extract images from frontmatter
  while ((match = frontmatterImageRegex.exec(content)) !== null) {
    imagePaths.add(match[1]);
  }
  
  return Array.from(imagePaths);
}

// Function to get blog post slug from filename
function getSlugFromFilename(filename) {
  return basename(filename, '.md').replace(/\.mdx$/, '');
}

// Main function to copy blog images
async function copyBlogImages() {
  const projectRoot = process.cwd();
  const backupBlogDir = join(projectRoot, 'backup/content/blog');
  const sourceBlogDir = join(projectRoot, 'src/content/blog');
  const publicBlogDir = join(projectRoot, 'public/blog');
  
  // Ensure public blog directory exists
  ensureDirectoryExists(publicBlogDir);
  
  let copiedFiles = 0;
  let errors = 0;
  let missingImages = new Set();
  
  // Get list of blog posts from both source and backup
  const blogPosts = new Set();
  
  // Add posts from source directory
  if (existsSync(sourceBlogDir)) {
    const sourceFiles = await fs.readdir(sourceBlogDir);
    sourceFiles.filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
      .forEach(file => blogPosts.add(file));
  }
  
  // Add posts from backup directory
  if (existsSync(backupBlogDir)) {
    const backupFiles = await fs.readdir(backupBlogDir);
    backupFiles.filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
      .forEach(file => blogPosts.add(file));
  }
  
  console.log(`Found ${blogPosts.size} blog posts to process`);
  
  for (const post of blogPosts) {
    let content;
    try {
      // Try to read from source first, then backup
      const sourcePath = join(sourceBlogDir, post);
      const backupPath = join(backupBlogDir, post);
      
      if (existsSync(sourcePath)) {
        content = await fs.readFile(sourcePath, 'utf-8');
      } else if (existsSync(backupPath)) {
        content = await fs.readFile(backupPath, 'utf-8');
      } else {
        console.error(`Could not find post file: ${post}`);
        continue;
      }
    } catch (err) {
      console.error(`Error reading post ${post}:`, err);
      continue;
    }
    
    const imagePaths = extractImagePaths(content);
    const postSlug = getSlugFromFilename(post);
    
    // Create post directory in public/blog
    const postPublicDir = join(publicBlogDir, postSlug);
    ensureDirectoryExists(postPublicDir);
    
    // Try to find and copy images from multiple possible locations
    for (const imagePath of imagePaths) {
      const relativePath = imagePath.replace(/^\/blog\//, '').replace(/^\//, '');
      const imageFilename = basename(relativePath);
      
      // Possible source locations for the image
      const possibleSources = [
        // Direct path in backup
        join(backupBlogDir, relativePath),
        // In backup under post slug
        join(backupBlogDir, postSlug, imageFilename),
        // In source under post slug
        join(sourceBlogDir, postSlug, imageFilename),
        // In public/blog under post slug
        join(publicBlogDir, postSlug, imageFilename),
        // In backup/images
        join(projectRoot, 'backup/images', imageFilename),
        // In src/images
        join(projectRoot, 'src/images', imageFilename),
        // In backup/uploads
        join(projectRoot, 'backup/uploads', imageFilename),
        // In public/images
        join(projectRoot, 'public/images', imageFilename),
        // In backup/content/images
        join(projectRoot, 'backup/content/images', imageFilename),
        // In src/content/images
        join(projectRoot, 'src/content/images', imageFilename),
        // In the post's own directory
        join(dirname(sourceBlogDir), postSlug, imageFilename),
        join(dirname(backupBlogDir), postSlug, imageFilename)
      ];
      
      // Try each possible source location
      let copied = false;
      for (const source of possibleSources) {
        if (copyFile(source, join(postPublicDir, imageFilename))) {
          copiedFiles++;
          copied = true;
          break;
        }
      }
      
      if (!copied) {
        missingImages.add(`${postSlug}: ${imageFilename}`);
        errors++;
      }
    }
  }
  
  console.log(`
Image copying completed:
- Total files copied: ${copiedFiles}
- Errors encountered: ${errors}

Missing images:
${Array.from(missingImages).map(img => `- ${img}`).join('\n')}
`);
}

// Run the script
try {
  await copyBlogImages();
} catch (err) {
  console.error('Failed to copy blog images:', err);
  process.exit(1);
} 