import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

async function* walkDir(dir: string): AsyncGenerator<string> {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      yield* walkDir(filePath);
    } else if (stat.isFile() && file.endsWith('.md')) {
      yield filePath;
    }
  }
}

async function fixImagePaths() {
  const portfolioDir = path.join(process.cwd(), 'src/content/portfolio');
  const blogDir = path.join(process.cwd(), 'src/content/blog');

  // Process portfolio files
  for await (const filePath of walkDir(portfolioDir)) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data, content: markdown } = matter(content);

    // Fix main image path
    if (data.image && !data.image.startsWith('/')) {
      data.image = '/' + data.image;
    }

    // Fix gallery image paths
    if (data.gallery) {
      for (const [key, value] of Object.entries(data.gallery)) {
        if (value && !value.startsWith('/')) {
          data.gallery[key] = '/' + value;
        }
      }
    }

    // Write back to file
    const updatedContent = matter.stringify(markdown, data);
    await fs.writeFile(filePath, updatedContent);
  }

  // Process blog files
  for await (const filePath of walkDir(blogDir)) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data, content: markdown } = matter(content);

    // Fix main image path
    if (data.image && !data.image.startsWith('/')) {
      data.image = '/' + data.image;
    }

    // Write back to file
    const updatedContent = matter.stringify(markdown, data);
    await fs.writeFile(filePath, updatedContent);
  }
}

// Run the script
fixImagePaths().catch(console.error); 