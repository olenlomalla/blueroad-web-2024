import { caseStudyPatterns } from './case-study-patterns';

interface CaseStudyData {
  title: string;
  description: string;
  pubDate: string;
  client: string;
  category: string;
  tags: string[];
  image: string;
  gallery?: {
    design?: string;
    prototype?: string;
    details?: string;
    lifestyle?: string;
  };
  overview: string;
  process: string[];
  keyFeatures: string[];
  technicalDetails: string[];
  additionalFocus: string[];
  results: {
    metrics: string[];
    testimonial?: {
      quote: string;
      author: string;
      position: string;
    };
  };
}

export function generateCaseStudyContent(
  type: keyof typeof caseStudyPatterns,
  data: Partial<CaseStudyData>
): CaseStudyData {
  const pattern = caseStudyPatterns[type];
  
  // Merge tags with common tags from pattern
  const tags = [...(data.tags || []), ...pattern.commonTags];
  
  // Generate default gallery paths if not provided
  const defaultGallery = {
    design: `/images/portfolio/${data.title?.toLowerCase().replace(/\s+/g, '-')}/design.jpg`,
    prototype: `/images/portfolio/${data.title?.toLowerCase().replace(/\s+/g, '-')}/prototype.jpg`,
    details: `/images/portfolio/${data.title?.toLowerCase().replace(/\s+/g, '-')}/details.jpg`,
    lifestyle: `/images/portfolio/${data.title?.toLowerCase().replace(/\s+/g, '-')}/lifestyle.jpg`,
  };

  return {
    title: data.title || 'Case Study Title',
    description: data.description || 'Case study description',
    pubDate: data.pubDate || new Date().toISOString(),
    client: data.client || 'Client Name',
    category: pattern.category,
    tags: Array.from(new Set(tags)), // Remove duplicates
    image: data.image || `/images/portfolio/${data.title?.toLowerCase().replace(/\s+/g, '-')}/main.jpg`,
    gallery: data.gallery || defaultGallery,
    overview: data.overview || 'Project overview',
    process: data.process || pattern.processPoints,
    keyFeatures: data.keyFeatures || [],
    technicalDetails: data.technicalDetails || pattern.technicalPoints,
    additionalFocus: data.additionalFocus || [],
    results: {
      metrics: data.results?.metrics || pattern.resultMetrics,
      testimonial: data.results?.testimonial || undefined,
    },
  };
}

export function formatCaseStudyMarkdown(caseStudy: CaseStudyData): string {
  return `---
title: "${caseStudy.title}"
description: "${caseStudy.description}"
pubDate: "${caseStudy.pubDate}"
client: "${caseStudy.client}"
category: "${caseStudy.category}"
tags: ${JSON.stringify(caseStudy.tags)}
image: "${caseStudy.image}"
gallery:
  design: "${caseStudy.gallery?.design}"
  prototype: "${caseStudy.gallery?.prototype}"
  details: "${caseStudy.gallery?.details}"
  lifestyle: "${caseStudy.gallery?.lifestyle}"
---

## Project Overview

${caseStudy.overview}

## ${caseStudyPatterns[caseStudy.category.toLowerCase() as keyof typeof caseStudyPatterns].sections.processTitle}

${caseStudy.process.map(point => `- ${point}`).join('\n')}

## ${caseStudyPatterns[caseStudy.category.toLowerCase() as keyof typeof caseStudyPatterns].sections.keyFeaturesTitle}

${caseStudy.keyFeatures.map(feature => `- ${feature}`).join('\n')}

## ${caseStudyPatterns[caseStudy.category.toLowerCase() as keyof typeof caseStudyPatterns].sections.technicalTitle}

${caseStudy.technicalDetails.map(detail => `- ${detail}`).join('\n')}

## ${caseStudyPatterns[caseStudy.category.toLowerCase() as keyof typeof caseStudyPatterns].sections.additionalTitle}

${caseStudy.additionalFocus.map(focus => `- ${focus}`).join('\n')}

## Results

${caseStudy.results.metrics.map(metric => `- ${metric}`).join('\n')}

${caseStudy.results.testimonial ? `
### Client Testimonial

> "${caseStudy.results.testimonial.quote}"
>
> — ${caseStudy.results.testimonial.author}, ${caseStudy.results.testimonial.position}` : ''}
`;}

// Example usage:
// const woodenTrayData = generateCaseStudyContent('productDesign', {
//   title: 'Wooden Tray',
//   description: 'A sustainable and durable wooden tray designed for IKEA compatibility',
//   client: 'Nordic Home Essentials',
//   // ... other specific data
// });
// 
// const markdown = formatCaseStudyMarkdown(woodenTrayData); 