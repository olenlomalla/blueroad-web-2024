import { readdir, rename, rmdir } from 'fs/promises';
import path from 'path';

async function cleanupXmi113j201() {
  const baseDir = process.cwd();
  const dirs = [
    path.join(baseDir, 'src/content/portfolio/xmi113j201'),
    path.join(baseDir, 'src/content/blog/xmi113j201')
  ];

  for (const dir of dirs) {
    try {
      const files = await readdir(dir);
      for (const file of files) {
        const oldPath = path.join(dir, file);
        const newPath = path.join(path.dirname(dir), file);
        await rename(oldPath, newPath);
        console.log(`Moved ${oldPath} to ${newPath}`);
      }
      await rmdir(dir);
      console.log(`Removed directory: ${dir}`);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        console.log(`Directory not found: ${dir}`);
      } else {
        console.error(`Error processing directory ${dir}:`, error);
      }
    }
  }
}

cleanupXmi113j201().catch(error => {
  console.error('Error cleaning up directories:', error);
  process.exit(1);
}); 