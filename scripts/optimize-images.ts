import { readdir, stat } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { paths, imageConfig } from '../src/config/project.config';
import fs from 'fs/promises';

async function* walkDir(dir: string): AsyncGenerator<string> {
  const files = await readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      yield* walkDir(res);
    } else {
      yield res;
    }
  }
}

async function optimizeImages() {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const portfolioImagesDir = path.join(process.cwd(), paths.public.images.portfolio);
  
  try {
    for await (const filePath of walkDir(portfolioImagesDir)) {
      if (!imageExtensions.includes(path.extname(filePath).toLowerCase())) {
        continue;
      }
      
      const stats = await stat(filePath);
      const sizeMB = stats.size / (1024 * 1024);
      
      if (sizeMB > 0.5) { // Only optimize images larger than 500KB
        console.log(`Optimizing ${filePath} (${sizeMB.toFixed(2)}MB)`);
        
        await sharp(filePath)
          .resize(imageConfig.dimensions.width, imageConfig.dimensions.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: imageConfig.quality })
          .toFile(filePath + '.optimized');
        
        // Replace original with optimized version
        await fs.rename(filePath + '.optimized', filePath);
        
        const newStats = await stat(filePath);
        const newSizeMB = newStats.size / (1024 * 1024);
        console.log(`  Reduced to ${newSizeMB.toFixed(2)}MB (${((1 - newSizeMB/sizeMB) * 100).toFixed(1)}% reduction)`);
      }
    }
    
    console.log('Image optimization complete');
  } catch (error) {
    console.error('Error optimizing images:', error);
    process.exit(1);
  }
}

optimizeImages().catch(error => {
  console.error('Image optimization failed:', error);
  process.exit(1);
}); 