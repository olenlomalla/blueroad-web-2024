import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import { imageRequirements } from '../src/content/config';

async function processImage(
  inputPath: string,
  outputPath: string,
  type: keyof typeof imageRequirements.dimensions
) {
  const dimensions = imageRequirements.dimensions[type];
  
  try {
    await sharp(inputPath)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: imageRequirements.quality,
        chromaSubsampling: '4:4:4'
      })
      .toFile(outputPath);
    
    console.log(`✓ Processed: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`✗ Error processing ${path.basename(inputPath)}:`, error);
  }
}

async function processPortfolioImages() {
  const projectDirs = await glob('public/images/portfolio/*/', { withFileTypes: true });
  
  for (const dir of projectDirs) {
    const projectName = path.basename(dir.name);
    console.log(`\nProcessing images for: ${projectName}`);
    
    // Process each image type
    for (const type of Object.keys(imageRequirements.dimensions)) {
      const sourceGlob = `public/images/portfolio/${projectName}/source/${type}.*`;
      const sources = await glob(sourceGlob);
      
      if (sources.length > 0) {
        const source = sources[0];
        const output = `public/images/portfolio/${projectName}/${type}.jpg`;
        
        await processImage(source, output, type as keyof typeof imageRequirements.dimensions);
      } else {
        console.warn(`⚠ No source image found for: ${projectName}/${type}`);
      }
    }
  }
}

// Run the script
console.log('Starting image processing...');
processPortfolioImages()
  .then(() => console.log('\nImage processing complete!'))
  .catch(error => console.error('\nError during processing:', error)); 