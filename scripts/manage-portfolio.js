import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORTFOLIO_DIR = path.join(__dirname, '..', 'src', 'content', 'portfolio');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'portfolio');

async function ensureDirectories() {
  await fs.mkdir(PORTFOLIO_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });
}

async function createPortfolioItem({
  slug,
  title,
  description,
  pubDate,
  client,
  category,
  image,
  gallery = [],
  tags = []
}) {
  const content = `---
title: "${title}"
description: "${description}"
pubDate: "${pubDate}"
client: "${client}"
category: "${category}"
image: "${image}"
${gallery.length > 0 ? `gallery: ${JSON.stringify(gallery)}` : ''}
tags: ${JSON.stringify(tags)}
---

${description}

## Project Overview

${category === '3D Rendering' ? `Our team utilized advanced 3D modeling and rendering techniques to create photorealistic visualizations that brought the client's vision to life. The project involved careful attention to lighting, textures, and materials to achieve the desired aesthetic impact.` : ''}
${category === 'Video Production' ? `We delivered a comprehensive video production solution that included pre-production planning, filming, post-production editing, and motion graphics. Our team worked closely with the client to ensure their message was conveyed effectively through compelling visual storytelling.` : ''}
${category === 'Visual Design' ? `Through careful consideration of color theory, typography, and visual hierarchy, we created designs that not only look stunning but also effectively communicate the client's brand message and values.` : ''}
${category === 'Web Design' ? `We developed a modern, responsive website that combines aesthetic appeal with optimal user experience. The design process included careful consideration of user flows, interaction design, and performance optimization.` : ''}

## Key Features

- Professional ${category} services tailored to client needs
- Comprehensive project management and communication
- High-quality deliverables meeting industry standards
- Attention to detail and brand consistency
`;

  const filePath = path.join(PORTFOLIO_DIR, `${slug}.md`);
  await fs.writeFile(filePath, content, 'utf-8');
  console.log(`Created portfolio item: ${filePath}`);
}

async function main() {
  await ensureDirectories();

  const items = [
    {
      slug: 'video-production-infopathy',
      title: 'Video Production for Infopathy Glowing IC Pad 3',
      description: 'A comprehensive video production project showcasing the Infopathy Glowing IC Pad 3, including storyboarding, filming, 3D animation, and voice-over recording.',
      pubDate: '2024-03-08',
      client: 'Infopathy',
      category: 'Video Production',
      image: '/images/portfolio/video-production-infopathy/main.jpg',
      gallery: [
        '/images/portfolio/video-production-infopathy/shot-1.jpg',
        '/images/portfolio/video-production-infopathy/shot-2.jpg',
        '/images/portfolio/video-production-infopathy/shot-3.jpg'
      ],
      tags: ['Video Production', '3D Animation', 'Voice Over', 'Medical Device']
    },
    {
      slug: '3d-architectural-visualization',
      title: '3D Architectural Visualization for Modern Office Complex',
      description: 'Photorealistic 3D renderings of a contemporary office complex, showcasing interior and exterior spaces with detailed materials and lighting.',
      pubDate: '2024-03-07',
      client: 'ZaRender',
      category: '3D Rendering',
      image: '/images/portfolio/3d-architectural-visualization/main.jpg',
      gallery: [
        '/images/portfolio/3d-architectural-visualization/exterior-1.jpg',
        '/images/portfolio/3d-architectural-visualization/interior-1.jpg',
        '/images/portfolio/3d-architectural-visualization/aerial-view.jpg'
      ],
      tags: ['3D Rendering', 'Architecture', 'Commercial', 'Visualization']
    },
    {
      slug: 'corporate-website-redesign',
      title: 'Corporate Website Redesign for Tech Innovation Company',
      description: 'Complete website redesign focusing on modern aesthetics, improved user experience, and optimized performance for a leading tech innovation company.',
      pubDate: '2024-03-06',
      client: 'TechInnovate',
      category: 'Web Design',
      image: '/images/portfolio/corporate-website-redesign/main.jpg',
      gallery: [
        '/images/portfolio/corporate-website-redesign/homepage.jpg',
        '/images/portfolio/corporate-website-redesign/services.jpg',
        '/images/portfolio/corporate-website-redesign/mobile.jpg'
      ],
      tags: ['Web Design', 'UI/UX', 'Responsive Design', 'Corporate']
    },
    {
      slug: 'brand-identity-design',
      title: 'Brand Identity Design for Sustainable Fashion Brand',
      description: 'Comprehensive brand identity design including logo, color palette, typography, and brand guidelines for an eco-conscious fashion brand.',
      pubDate: '2024-03-05',
      client: 'EcoStyle',
      category: 'Visual Design',
      image: '/images/portfolio/brand-identity-design/main.jpg',
      gallery: [
        '/images/portfolio/brand-identity-design/logo.jpg',
        '/images/portfolio/brand-identity-design/collateral.jpg',
        '/images/portfolio/brand-identity-design/guidelines.jpg'
      ],
      tags: ['Visual Design', 'Branding', 'Logo Design', 'Fashion']
    }
  ];

  for (const item of items) {
    await createPortfolioItem(item);
  }
}

main().catch(console.error); 