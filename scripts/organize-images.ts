import { readdir, mkdir, rename } from 'fs/promises';
import path from 'path';

async function organizeImages() {
  const baseDir = process.cwd();
  const sourceDir = path.join(baseDir, 'public/images');
  const targetDir = path.join(baseDir, 'src/content/images');

  try {
    // Create target directory if it doesn't exist
    await mkdir(targetDir, { recursive: true });

    // Read all files in source directory
    const files = await readdir(sourceDir);

    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      try {
        await rename(sourcePath, targetPath);
        console.log(`Moved ${file} to content directory`);
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          console.log(`File not found: ${file}`);
        } else {
          console.error(`Error moving file ${file}:`, error);
        }
      }
    }

    console.log('Image organization completed');
  } catch (error) {
    console.error('Error during image organization:', error);
    process.exit(1);
  }
}

organizeImages().catch(console.error); 