// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const imageRequirements = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  formats: ['jpg', 'webp', 'avif'],
  dimensions: {
    thumbnail: { width: 300, height: 200 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 800 },
    full: { width: 1920, height: 1080 }
  }
};

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

const portfolio = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
  portfolio,
};
export { imageRequirements };
