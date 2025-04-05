import { writeFile } from 'fs/promises';
import path from 'path';

interface CaseStudyInput {
  title: string;
  description: string;
  pubDate: string;
  client: string;
  type: 'video' | 'web' | 'design';
  overview: string;
  keyFeatures: string[];
  additionalFocus: string[];
  results?: {
    testimonial?: {
      quote: string;
      author: string;
      position: string;
    };
  };
}

interface CaseStudyData {
  title: string;
  description: string;
  pubDate: string;
  client: string;
  overview: string;
  keyFeatures: string[];
  additionalFocus: string[];
  results?: {
    testimonial?: {
      quote: string;
      author: string;
      position: string;
    };
  };
  slug: string;
  category: string;
  image: string;
  gallery?: string[];
  tags?: string[];
}

const caseStudyPatterns = {
  video: {
    category: 'Video Production',
    image: '/images/portfolio/video-production.jpg',
    gallery: [
      '/images/portfolio/video-production-1.jpg',
      '/images/portfolio/video-production-2.jpg'
    ]
  },
  web: {
    category: 'Web Development',
    image: '/images/portfolio/web-development.jpg',
    gallery: [
      '/images/portfolio/web-development-1.jpg',
      '/images/portfolio/web-development-2.jpg'
    ]
  },
  design: {
    category: 'UI/UX Design',
    image: '/images/portfolio/ui-design.jpg',
    gallery: [
      '/images/portfolio/ui-design-1.jpg',
      '/images/portfolio/ui-design-2.jpg'
    ]
  }
};

async function generateCaseStudy(input: CaseStudyInput) {
  const pattern = caseStudyPatterns[input.type];
  const { type, ...rest } = input;
  const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const caseStudyData: CaseStudyData = {
    ...rest,
    slug,
    category: pattern.category,
    image: pattern.image,
    gallery: pattern.gallery,
    tags: []
  };

  const content = `---
title: ${caseStudyData.title}
description: ${caseStudyData.description}
pubDate: ${caseStudyData.pubDate}
client: ${caseStudyData.client}
category: ${caseStudyData.category}
image: ${caseStudyData.image}
${caseStudyData.gallery ? `gallery: ${JSON.stringify(caseStudyData.gallery)}` : ''}
${caseStudyData.tags ? `tags: ${JSON.stringify(caseStudyData.tags)}` : ''}
---

# ${caseStudyData.title}

## Overview
${caseStudyData.overview}

## Key Features
${caseStudyData.keyFeatures.map(feature => `- ${feature}`).join('\n')}

## Additional Focus Areas
${caseStudyData.additionalFocus.map(focus => `- ${focus}`).join('\n')}

${caseStudyData.results?.testimonial ? `
## Client Testimonial
> "${caseStudyData.results.testimonial.quote}"
> 
> — ${caseStudyData.results.testimonial.author}, ${caseStudyData.results.testimonial.position}
` : ''}
`;

  const filePath = path.join(process.cwd(), 'src/content/portfolio', `${caseStudyData.slug}.md`);
  await writeFile(filePath, content);
  console.log(`Generated case study: ${filePath}`);
}

// Example usage
const input: CaseStudyInput = {
  title: 'Video Production for Client X',
  description: 'A comprehensive video production project showcasing our capabilities',
  pubDate: new Date().toISOString().split('T')[0],
  client: 'Client X',
  type: 'video',
  overview: 'This project involved creating a series of promotional videos...',
  keyFeatures: [
    'High-quality video production',
    'Professional editing',
    'Motion graphics'
  ],
  additionalFocus: [
    'Brand consistency',
    'Engaging storytelling'
  ],
  results: {
    testimonial: {
      quote: 'The final product exceeded our expectations',
      author: 'John Doe',
      position: 'Marketing Director'
    }
  }
};

generateCaseStudy(input).catch(console.error); 