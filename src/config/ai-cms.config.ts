import { z } from 'zod';

// AI CMS Configuration
export const aiCmsConfig = {
  // Content Generation
  contentGeneration: {
    maxTokens: 2000,
    temperature: 0.7,
    model: 'gpt-4-turbo-preview',
    systemPrompt: 'You are an expert content strategist and SEO specialist. Your role is to help create and optimize content that ranks well in search engines while maintaining a natural, engaging tone.',
  },

  // SEO Monitoring
  seoMonitoring: {
    checkFrequency: 'daily',
    metrics: [
      'keyword rankings',
      'backlinks',
      'page speed',
      'mobile responsiveness',
      'content quality',
    ],
    competitors: {
      maxCompetitors: 5,
      analysisDepth: 'comprehensive',
    },
  },

  // Content Optimization
  contentOptimization: {
    targetMetrics: {
      readability: 'grade 8-10',
      keywordDensity: '1-3%',
      contentLength: 'min 1000 words',
    },
    optimizationFrequency: 'weekly',
  },

  // Templates
  templates: {
    categories: [
      'landing pages',
      'blog posts',
      'case studies',
      'product pages',
      'about pages',
    ],
    defaultStyles: {
      typography: 'modern',
      colorScheme: 'brand-aligned',
      layout: 'responsive',
    },
  },

  // AI Assistant
  aiAssistant: {
    capabilities: [
      'content suggestions',
      'seo recommendations',
      'competitor analysis',
      'performance insights',
      'content updates',
    ],
    interactionMode: 'chat',
  },
} as const;

// Schema for AI-generated content
export const aiContentSchema = z.object({
  title: z.string(),
  content: z.string(),
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  tone: z.enum(['professional', 'casual', 'technical', 'conversational']),
  targetAudience: z.string(),
  seoScore: z.number().min(0).max(100),
  readabilityScore: z.number().min(0).max(100),
  suggestedImprovements: z.array(z.string()),
});

// Schema for SEO monitoring results
export const seoMonitoringSchema = z.object({
  date: z.string().datetime(),
  metrics: z.object({
    keywordRankings: z.record(z.number()),
    backlinks: z.number(),
    pageSpeed: z.number(),
    mobileScore: z.number(),
    contentScore: z.number(),
  }),
  competitors: z.array(z.object({
    domain: z.string(),
    metrics: z.object({
      keywordOverlap: z.number(),
      backlinkCount: z.number(),
      contentQuality: z.number(),
    }),
  })),
  recommendations: z.array(z.string()),
}); 