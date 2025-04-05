import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const images = [
  {
    name: 'ecommerce.jpg',
    url: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80'
  },
  {
    name: 'ecommerce-1.jpg',
    url: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80'
  },
  {
    name: 'ecommerce-2.jpg',
    url: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80'
  },
  {
    name: 'ecommerce-3.jpg',
    url: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80'
  },
  {
    name: 'web-app.jpg',
    url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80'
  },
  {
    name: 'web-design.jpg',
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=80'
  },
  {
    name: 'ui-design.jpg',
    url: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80'
  },
  {
    name: 'mobile-app.jpg',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80'
  },
  {
    name: 'video-prod.jpg',
    url: 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=800&q=80'
  },
  {
    name: 'corporate-video.jpg',
    url: 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?w=800&q=80'
  }
];

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(__dirname, '..', 'public', 'images', 'portfolio', filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
};

async function downloadAllImages() {
  try {
    const dir = path.join(__dirname, '..', 'public', 'images', 'portfolio');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    for (const image of images) {
      await downloadImage(image.url, image.name);
    }
    console.log('All images downloaded successfully!');
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

downloadAllImages(); 