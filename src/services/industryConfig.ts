interface IndustryKeywords {
  primary: string[];
  secondary: string[];
  technical: string[];
}

interface IndustryConfig {
  keywords: IndustryKeywords;
  contentRules: {
    minWordCount: number;
    maxWordCount: number;
    headingFrequency: number;
    imageFrequency: number;
  };
  seoRules: {
    titleLength: { min: number; max: number };
    descriptionLength: { min: number; max: number };
    keywordDensity: { min: number; max: number };
  };
}

export const videoProductionConfig: IndustryConfig = {
  keywords: {
    primary: [
      'video production',
      'commercial video',
      'corporate video',
      'animation',
      'motion graphics'
    ],
    secondary: [
      'video marketing',
      'brand storytelling',
      'visual content',
      'promotional videos',
      'product videos'
    ],
    technical: [
      '4K video',
      'post-production',
      'color grading',
      'sound design',
      'VFX'
    ]
  },
  contentRules: {
    minWordCount: 300,
    maxWordCount: 2000,
    headingFrequency: 150, // One heading every ~150 words
    imageFrequency: 300    // One image every ~300 words
  },
  seoRules: {
    titleLength: { min: 40, max: 60 },
    descriptionLength: { min: 140, max: 160 },
    keywordDensity: { min: 1, max: 3 } // percentage
  }
};

export class IndustryOptimizer {
  private config: IndustryConfig;

  constructor(config: IndustryConfig = videoProductionConfig) {
    this.config = config;
  }

  validateContent(content: string): { valid: boolean; suggestions: string[] } {
    const wordCount = content.split(/\s+/).length;
    const headings = (content.match(/^#{1,6}\s/gm) || []).length;
    const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    
    const suggestions: string[] = [];

    if (wordCount < this.config.contentRules.minWordCount) {
      suggestions.push(`Content is too short (${wordCount} words). Aim for at least ${this.config.contentRules.minWordCount} words.`);
    }

    if (wordCount > this.config.contentRules.maxWordCount) {
      suggestions.push(`Content is too long (${wordCount} words). Keep it under ${this.config.contentRules.maxWordCount} words.`);
    }

    const expectedHeadings = Math.floor(wordCount / this.config.contentRules.headingFrequency);
    if (headings < expectedHeadings) {
      suggestions.push(`Add more headings. Aim for one heading every ${this.config.contentRules.headingFrequency} words.`);
    }

    const expectedImages = Math.floor(wordCount / this.config.contentRules.imageFrequency);
    if (images < expectedImages) {
      suggestions.push(`Add more images. Aim for one image every ${this.config.contentRules.imageFrequency} words.`);
    }

    return {
      valid: suggestions.length === 0,
      suggestions
    };
  }

  validateSEO(title: string, description: string, content: string): { valid: boolean; suggestions: string[] } {
    const suggestions: string[] = [];

    // Validate title length
    if (title.length < this.config.seoRules.titleLength.min) {
      suggestions.push(`Title is too short (${title.length} chars). Aim for at least ${this.config.seoRules.titleLength.min} characters.`);
    }
    if (title.length > this.config.seoRules.titleLength.max) {
      suggestions.push(`Title is too long (${title.length} chars). Keep it under ${this.config.seoRules.titleLength.max} characters.`);
    }

    // Validate description length
    if (description.length < this.config.seoRules.descriptionLength.min) {
      suggestions.push(`Description is too short (${description.length} chars). Aim for at least ${this.config.seoRules.descriptionLength.min} characters.`);
    }
    if (description.length > this.config.seoRules.descriptionLength.max) {
      suggestions.push(`Description is too long (${description.length} chars). Keep it under ${this.config.seoRules.descriptionLength.max} characters.`);
    }

    // Check keyword density
    for (const keyword of this.config.keywords.primary) {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex) || [];
      const density = (matches.length / content.split(/\s+/).length) * 100;

      if (density < this.config.seoRules.keywordDensity.min) {
        suggestions.push(`Keyword "${keyword}" density is too low (${density.toFixed(1)}%). Aim for at least ${this.config.seoRules.keywordDensity.min}%.`);
      }
      if (density > this.config.seoRules.keywordDensity.max) {
        suggestions.push(`Keyword "${keyword}" density is too high (${density.toFixed(1)}%). Keep it under ${this.config.seoRules.keywordDensity.max}%.`);
      }
    }

    return {
      valid: suggestions.length === 0,
      suggestions
    };
  }

  getRelevantKeywords(content: string): string[] {
    const allKeywords = [
      ...this.config.keywords.primary,
      ...this.config.keywords.secondary,
      ...this.config.keywords.technical
    ];

    return allKeywords.filter(keyword => {
      const regex = new RegExp(keyword, 'gi');
      return content.match(regex);
    });
  }
} 