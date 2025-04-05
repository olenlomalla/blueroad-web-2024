import OpenAI from 'openai';
import type { CollectionEntry } from 'astro:content';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface OptimizationResult {
  title: string;
  description: string;
  content: string;
  keywords: string[];
  schema: Record<string, any>;
}

export class ContentOptimizer {
  async optimizeContent(entry: CollectionEntry<'blog' | 'portfolio'>): Promise<OptimizationResult> {
    const result = await this.generateOptimizedContent(entry);
    return this.parseOptimizationResult(result);
  }

  private async generateOptimizedContent(entry: CollectionEntry<'blog' | 'portfolio'>): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a content optimization expert. Optimize the following content for SEO and readability."
        },
        {
          role: "user",
          content: JSON.stringify(entry.data)
        }
      ]
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No content generated from OpenAI');
    }

    return completion.choices[0].message.content;
  }

  private async generateSchemaMarkup(type: string, data: any): Promise<Record<string, any>> {
    // Implementation here
    return {};
  }

  private async parseOptimizationResult(result: string): Promise<OptimizationResult> {
    try {
      const parsed = JSON.parse(result);
      return {
        title: parsed.title || '',
        description: parsed.description || '',
        content: parsed.content || '',
        keywords: parsed.keywords || [],
        schema: parsed.schema || {}
      };
    } catch (error) {
      console.error('Failed to parse optimization result:', error);
      throw new Error('Failed to parse optimization result');
    }
  }
} 