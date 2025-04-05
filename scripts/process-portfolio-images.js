import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORTFOLIO_DIR = path.join(__dirname, '..', 'src', 'content', 'portfolio');
const PUBLIC_IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'portfolio');

async function processImage(inputPath, outputPath, options = {}) {
  const {
    width = 1200,
    height = 800,
    quality = 80,
    fit = 'cover'
  } = options;

  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    await sharp(inputPath)
      .resize(width, height, { fit })
      .jpeg({ quality })
      .toFile(outputPath);
      
    console.log(`Processed image: ${outputPath}`);
  } catch (error) {
    console.error(`Error processing image ${inputPath}:`, error);
  }
}

async function processPortfolioImages() {
  try {
    // Ensure output directory exists
    await fs.mkdir(PUBLIC_IMAGES_DIR, { recursive: true });

    // Read all portfolio items
    const files = await fs.readdir(PORTFOLIO_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    for (const file of mdFiles) {
      const content = await fs.readFile(path.join(PORTFOLIO_DIR, file), 'utf-8');
      
      // Match image paths in frontmatter
      const imageMatches = content.match(/image: "([^"]+)"/);
      const galleryMatches = content.match(/gallery: (\[[^\]]+\])/);

      if (imageMatches) {
        const imagePath = imageMatches[1];
        const inputPath = path.join(__dirname, '..', 'src', imagePath);
        const outputPath = path.join(__dirname, '..', 'public', imagePath);
        await processImage(inputPath, outputPath);
      }

      if (galleryMatches) {
        const gallery = JSON.parse(galleryMatches[1]);
        for (const imagePath of gallery) {
          const inputPath = path.join(__dirname, '..', 'src', imagePath);
          const outputPath = path.join(__dirname, '..', 'public', imagePath);
          await processImage(inputPath, outputPath);
        }
      }
    }

    console.log('Portfolio images processed successfully');
  } catch (error) {
    console.error('Error processing portfolio images:', error);
  }
}

processPortfolioImages(); 