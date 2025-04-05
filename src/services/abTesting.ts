import { ContentOptimizer } from './contentOptimizer';
import type { OptimizationResult } from './contentOptimizer';

interface Variant {
  title: string;
  description: string;
  content: string;
  keywords: string[];
  schema: Record<string, any>;
  metrics: {
    readability: number;
    seoScore: number;
    keywordDensity: number;
  };
}

export class ABTestingService {
  private contentOptimizer: ContentOptimizer;

  constructor(apiKey: string, competitors: string[] = []) {
    this.contentOptimizer = new ContentOptimizer();
  }

  private calculateReadabilityScore(content: string): number {
    // Simple Flesch-Kincaid readability score
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const syllables = this.countSyllables(content);

    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return Math.max(0, Math.min(100, score));
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    return words.reduce((count, word) => {
      return count + this.countWordSyllables(word);
    }, 0);
  }

  private countWordSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');

    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  }

  private calculateSEOScore(variant: Variant): number {
    let score = 100;

    // Check keyword presence in title and description
    const titleHasKeyword = variant.keywords.some(k => 
      variant.title.toLowerCase().includes(k.toLowerCase())
    );
    const descHasKeyword = variant.keywords.some(k => 
      variant.description.toLowerCase().includes(k.toLowerCase())
    );

    if (!titleHasKeyword) score -= 15;
    if (!descHasKeyword) score -= 10;

    return Math.max(0, score);
  }

  private calculateKeywordDensity(content: string, keywords: string[]): number {
    const wordCount = content.split(/\s+/).length;
    let keywordCount = 0;

    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex) || [];
      keywordCount += matches.length;
    }

    return (keywordCount / wordCount) * 100;
  }

  async generateVariants(content: {
    title: string;
    description: string;
    content: string;
    type: 'page' | 'blog' | 'portfolio';
  }): Promise<Variant[]> {
    // Generate two variants with different optimization strategies
    const variants: Variant[] = [];

    // Variant A: Balanced optimization
    const variantA = await this.contentOptimizer.optimizeContent({
      data: {
        title: `${content.title} - Balanced`,
        description: content.description,
        content: content.content,
        type: content.type
      }
    } as any);
    
    // Variant B: Aggressive SEO optimization
    const variantB = await this.contentOptimizer.optimizeContent({
      data: {
        title: `${content.title} - SEO Focus`,
        description: content.description,
        content: content.content,
        type: content.type
      }
    } as any);

    // Calculate metrics for each variant
    const createVariant = (result: OptimizationResult, id: string): Variant => ({
      title: result.title,
      description: result.description,
      content: result.content,
      keywords: result.keywords,
      schema: result.schema,
      metrics: {
        readability: this.calculateReadabilityScore(result.content),
        seoScore: this.calculateSEOScore({
          ...result,
          metrics: { readability: 0, seoScore: 0, keywordDensity: 0 }
        }),
        keywordDensity: this.calculateKeywordDensity(result.content, result.keywords)
      }
    });

    variants.push(
      createVariant(variantA, 'variant-a'),
      createVariant(variantB, 'variant-b')
    );

    return variants;
  }

  selectBestVariant(variants: Variant[]): Variant {
    // Weight factors for scoring
    const weights = {
      readability: 0.3,
      seoScore: 0.5,
      keywordDensity: 0.2
    };

    // Calculate weighted scores
    const scores = variants.map(variant => {
      const weightedScore =
        variant.metrics.readability * weights.readability +
        variant.metrics.seoScore * weights.seoScore +
        (variant.metrics.keywordDensity >= 1 && variant.metrics.keywordDensity <= 3 
          ? 100 * weights.keywordDensity 
          : 0);
      
      return {
        variant,
        score: weightedScore
      };
    });

    // Return the variant with the highest score
    return scores.reduce((best, current) => 
      current.score > best.score ? current : best
    ).variant;
  }
} 