// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string().transform(str => new Date(str)),
    image: z.string().optional(),
    category: z.string().optional(),
    author: z.string().optional(),
  })
});

const portfolioCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().transform(str => new Date(str)),
    thumbnail: z.string(),
    category: z.string(),
    gallery: z.array(z.object({
      url: z.string(),
      alt: z.string().optional()
    })).optional(),
    client: z.string().optional(),
    services: z.array(z.string()).optional(),
  })
});

export const collections = {
  'blog': blogCollection,
  'portfolio': portfolioCollection,
};
