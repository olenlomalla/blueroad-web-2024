import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

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

interface CaseStudyData extends Omit<CaseStudyInput, 'type'> {
  slug: string;
  category: string;
  image: string;
  gallery?: string[];
  tags?: string[];
  process?: string;
  technicalDetails?: string;
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

function generateCaseStudyContent(type: keyof typeof caseStudyPatterns, input: Omit<CaseStudyInput, 'type'>): CaseStudyData {
  const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const pattern = caseStudyPatterns[type];

  return {
    ...input,
    slug,
    category: pattern.category,
    image: pattern.image,
    gallery: pattern.gallery,
    tags: [],
    process: '',
    technicalDetails: ''
  };
}

function formatCaseStudyMarkdown(data: CaseStudyData): string {
  return `---
title: ${data.title}
description: ${data.description}
pubDate: ${data.pubDate}
client: ${data.client}
category: ${data.category}
image: ${data.image}
${data.gallery ? `gallery: ${JSON.stringify(data.gallery)}` : ''}
${data.tags ? `tags: ${JSON.stringify(data.tags)}` : ''}
---

# ${data.title}

## Overview
${data.overview}

## Key Features
${data.keyFeatures.map(feature => `- ${feature}`).join('\n')}

## Additional Focus Areas
${data.additionalFocus.map(focus => `- ${focus}`).join('\n')}

${data.process ? `
## Process
${data.process}
` : ''}

${data.technicalDetails ? `
## Technical Details
${data.technicalDetails}
` : ''}

${data.results?.testimonial ? `
## Client Testimonial
> "${data.results.testimonial.quote}"
> 
> — ${data.results.testimonial.author}, ${data.results.testimonial.position}
` : ''}
`;
}

function createCaseStudy(input: CaseStudyInput) {
  // Generate the case study content
  const caseStudyData = generateCaseStudyContent(input.type, {
    ...input,
    // Additional data can be added here
  });

  // Format the content as markdown
  const markdown = formatCaseStudyMarkdown(caseStudyData);

  // Create the file path
  const fileName = input.title.toLowerCase().replace(/\s+/g, '-');
  const filePath = join(process.cwd(), 'src', 'content', 'portfolio', `${fileName}.md`);

  // Create image directories
  const imageDir = join(process.cwd(), 'public', 'images', 'portfolio', fileName);
  try {
    mkdirSync(imageDir, { recursive: true });
  } catch (error) {
    console.warn(`Warning: Could not create image directory ${imageDir}`);
  }

  // Write the markdown file
  try {
    writeFileSync(filePath, markdown);
    console.log(`Successfully created case study at ${filePath}`);
  } catch (error) {
    console.error(`Error writing case study file: ${error}`);
    process.exit(1);
  }
}

// Example usage:
// createCaseStudy({
//   title: "Smart Svenska",
//   description: "A comprehensive language learning platform for Swedish learners",
//   pubDate: "2024-03-15T00:00:00.000Z",
//   client: "Svenska Institute",
//   type: "webDesign",
//   overview: "Smart Svenska is an innovative language learning platform...",
//   keyFeatures: [
//     "Interactive learning modules",
//     "Real-time pronunciation feedback",
//     "Personalized learning paths"
//   ],
//   additionalFocus: [
//     "Accessibility features",
//     "Mobile-first design",
//     "Offline learning capabilities"
//   ],
//   results: {
//     testimonial: {
//       quote: "Smart Svenska has revolutionized how we teach Swedish...",
//       author: "Maria Andersson",
//       position: "Director of Education, Svenska Institute"
//     }
//   }
// }); 