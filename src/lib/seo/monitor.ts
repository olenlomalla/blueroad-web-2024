import OpenAI from 'openai';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface SEOMetrics {
  pageViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  searchRankings: {
    keyword: string;
    position: number;
  }[];
}

interface ContentOptimization {
  title: string;
  description: string;
  content: string;
  tags: string[];
}

export async function monitorAndOptimize() {
  try {
    // Get all case studies
    const files = await glob('src/content/portfolio/*.md');
    
    for (const file of files) {
      // Get current metrics
      const metrics = await getPageMetrics();
      
      // Check if optimization is needed
      if (shouldOptimize(metrics)) {
        // Get current content
        const fileContent = await readFile(file, 'utf-8');
        
        // Optimize content
        const optimized = await optimizeContent(fileContent, metrics);
        
        // Update file
        await updateContent(file, optimized);
        
        console.log(`Optimized: ${path.basename(file)}`);
      }
    }
  } catch (error) {
    console.error('Error in SEO monitoring:', error);
  }
}

async function getPageMetrics(): Promise<SEOMetrics> {
  // Here you would integrate with your analytics service (Google Analytics, Plausible, etc.)
  // For now, returning mock data
  return {
    pageViews: 100,
    averageTimeOnPage: 120,
    bounceRate: 0.5,
    searchRankings: [
      { keyword: 'web design', position: 15 },
      { keyword: 'portfolio', position: 8 }
    ]
  };
}

function shouldOptimize(metrics: SEOMetrics): boolean {
  // Define thresholds for optimization
  const THRESHOLDS = {
    minPageViews: 50,
    maxBounceRate: 0.7,
    minTimeOnPage: 60,
    maxSearchPosition: 10
  };
  
  return (
    metrics.pageViews < THRESHOLDS.minPageViews ||
    metrics.bounceRate > THRESHOLDS.maxBounceRate ||
    metrics.averageTimeOnPage < THRESHOLDS.minTimeOnPage ||
    metrics.searchRankings.some(r => r.position > THRESHOLDS.maxSearchPosition)
  );
}

async function optimizeContent(fileContent: string, metrics: SEOMetrics): Promise<ContentOptimization> {
  const prompt = `
Analyze and optimize the following content for SEO while maintaining readability and authenticity.
Current metrics:
- Page views: ${metrics.pageViews}
- Average time on page: ${metrics.averageTimeOnPage}s
- Bounce rate: ${metrics.bounceRate}
- Search rankings: ${metrics.searchRankings.map(r => `${r.keyword}: ${r.position}`).join(', ')}

Content:
${fileContent}

Provide optimized version in JSON format with the following structure:
{
  "title": "optimized title",
  "description": "optimized meta description",
  "content": "optimized content",
  "tags": ["relevant", "keywords"]
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an SEO expert. Optimize the content while maintaining its authenticity and readability."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const responseContent = completion.choices[0]?.message?.content;
  if (!responseContent) {
    throw new Error('No content generated from OpenAI');
  }

  return JSON.parse(responseContent);
}

async function updateContent(file: string, optimization: ContentOptimization) {
  const content = `---
title: "${optimization.title}"
description: "${optimization.description}"
tags: ${JSON.stringify(optimization.tags)}
---

${optimization.content}
`;

  await writeFile(file, content);
}

// Schedule monitoring
export function scheduleSEOMonitoring(intervalHours = 24) {
  setInterval(monitorAndOptimize, intervalHours * 60 * 60 * 1000);
} 