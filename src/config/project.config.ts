import { z } from 'zod';

// Environment variable schema
export const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Project paths
export const paths = {
  content: {
    portfolio: 'src/content/portfolio',
    blog: 'src/content/blog'
  },
  public: {
    images: {
      portfolio: 'public/images/portfolio',
      blog: 'public/images/blog'
    }
  }
} as const;

// Image processing configuration
export const imageConfig = {
  dimensions: {
    width: 1920,
    height: 1080
  },
  quality: 85,
  format: 'jpg' as const
} as const;

// Content schemas
export const caseStudySchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.string().datetime(),
  client: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  image: z.string(),
  gallery: z.object({
    design: z.string(),
    prototype: z.string(),
    details: z.string(),
    lifestyle: z.string()
  })
});

// Feature flags
export const features = {
  seoOptimization: true,
  imageOptimization: true,
  adminInterface: true,
} as const;

// Version tracking
export const version = {
  major: 1,
  minor: 0,
  patch: 0,
  toString: () => `${version.major}.${version.minor}.${version.patch}`,
} as const; 