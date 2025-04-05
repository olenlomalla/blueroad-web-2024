import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import OpenAI from 'openai';

if (!import.meta.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

interface CaseStudySubmission {
  title: string;
  description: string;
  client: string;
  category: string;
  tags: string[];
  images: {
    main: File;
    design: File;
    prototype: File;
    details: File;
    lifestyle: File;
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const submission = await processFormData(formData);
    
    // Optimize content with OpenAI
    const optimizedContent = await optimizeContent(submission);
    
    // Save case study
    await saveCaseStudy(optimizedContent);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing case study submission:', error);
    return new Response(JSON.stringify({ error: 'Failed to process submission' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function processFormData(formData: FormData): Promise<CaseStudySubmission> {
  return {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    client: formData.get('client') as string,
    category: formData.get('category') as string,
    tags: JSON.parse(formData.get('tags') as string),
    images: {
      main: formData.get('main') as File,
      design: formData.get('design') as File,
      prototype: formData.get('prototype') as File,
      details: formData.get('details') as File,
      lifestyle: formData.get('lifestyle') as File
    }
  };
}

async function optimizeContent(submission: CaseStudySubmission) {
  // Use OpenAI to optimize content for SEO
  const prompt = `Optimize the following case study content for SEO while maintaining readability:
Title: ${submission.title}
Description: ${submission.description}
Category: ${submission.category}
Tags: ${submission.tags.join(', ')}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a content optimization expert. Optimize the following content for SEO and readability."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content generated from OpenAI');
  }

  const optimizedData = JSON.parse(content);

  return {
    ...submission,
    title: optimizedData.title,
    description: optimizedData.description,
    tags: optimizedData.tags
  };
}

async function saveCaseStudy(submission: CaseStudySubmission) {
  const slug = submission.title.toLowerCase().replace(/\s+/g, '-');
  
  // Create directories
  const portfolioDir = path.join(process.cwd(), 'src/content/portfolio');
  const imagesDir = path.join(process.cwd(), 'public/images/portfolio', slug);
  
  await mkdir(portfolioDir, { recursive: true });
  await mkdir(imagesDir, { recursive: true });
  
  // Process and save images
  for (const [type, file] of Object.entries(submission.images)) {
    const buffer = await file.arrayBuffer();
    await sharp(buffer)
      .resize(1920, 1080, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(path.join(imagesDir, `${type}.jpg`));
  }
  
  // Generate and save markdown
  const markdown = `---
title: "${submission.title}"
description: "${submission.description}"
pubDate: "${new Date().toISOString()}"
client: "${submission.client}"
category: "${submission.category}"
tags: ${JSON.stringify(submission.tags)}
image: "/images/portfolio/${slug}/main.jpg"
gallery:
  design: "/images/portfolio/${slug}/design.jpg"
  prototype: "/images/portfolio/${slug}/prototype.jpg"
  details: "/images/portfolio/${slug}/details.jpg"
  lifestyle: "/images/portfolio/${slug}/lifestyle.jpg"
---

${submission.description}
`;

  await writeFile(
    path.join(portfolioDir, `${slug}.md`),
    markdown
  );
} 