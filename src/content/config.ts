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

const portfolio = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string().transform((str) => new Date(str)),
    client: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    image: z.string().refine((val) => {
      return val.startsWith('/') || val.startsWith('http') || val.startsWith('https');
    }, {
      message: 'Image path must be absolute (start with /) or be a URL'
    }),
    gallery: z.object({
      design: z.string().refine((val) => {
        return val.startsWith('/') || val.startsWith('http') || val.startsWith('https');
      }, {
        message: 'Image path must be absolute (start with /) or be a URL'
      }),
      prototype: z.string().refine((val) => {
        return val.startsWith('/') || val.startsWith('http') || val.startsWith('https');
      }, {
        message: 'Image path must be absolute (start with /) or be a URL'
      }),
      details: z.string().refine((val) => {
        return val.startsWith('/') || val.startsWith('http') || val.startsWith('https');
      }, {
        message: 'Image path must be absolute (start with /) or be a URL'
      }),
      lifestyle: z.string().refine((val) => {
        return val.startsWith('/') || val.startsWith('http') || val.startsWith('https');
      }, {
        message: 'Image path must be absolute (start with /) or be a URL'
      })
    })
  })
});

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string().datetime(),
    author: z.string(),
    image: z.string().refine((val) => {
      return val.startsWith('/') || val.startsWith('http') || val.startsWith('https');
    }, {
      message: 'Image path must be absolute (start with /) or be a URL'
    }),
    tags: z.array(z.string()),
    category: z.string()
  })
});

export const collections = { portfolio, blog };
export { imageRequirements };
