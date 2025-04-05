import { readFile, readdir, writeFile } from 'fs/promises';
import path from 'path';
import { parse, stringify } from 'yaml';
import OpenAI from 'openai';
import { paths } from '../src/config/project.config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SEOSuggestions {
  title?: string;
  description?: string;
  tags?: string[];
  contentSuggestions?: string[];
}

async function analyzeSEO() {
  const portfolioDir = path.join(process.cwd(), paths.content.portfolio);
  const files = await readdir(portfolioDir);
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    console.log(`Analyzing ${file}...`);
    const filePath = path.join(portfolioDir, file);
    const content = await readFile(filePath, 'utf-8');
    const [_, frontmatter, markdown] = content.split('---');
    const data = parse(frontmatter);
    
    try {
      const suggestions = await getSEOSuggestions(data, markdown);
      if (Object.keys(suggestions).length > 0) {
        await applySEOSuggestions(filePath, data, markdown, suggestions);
        console.log(`✅ Applied SEO improvements to ${file}`);
      } else {
        console.log(`✨ No SEO improvements needed for ${file}`);
      }
    } catch (error) {
      console.error(`❌ Error analyzing ${file}:`, error);
    }
  }
}

async function getSEOSuggestions(
  frontmatter: Record<string, any>,
  content: string
): Promise<SEOSuggestions> {
  const prompt = `Analyze this case study for SEO optimization:
Title: ${frontmatter.title}
Description: ${frontmatter.description}
Tags: ${frontmatter.tags.join(', ')}
Content:
${content.trim()}

Provide specific suggestions for improving SEO in JSON format:
{
  "title": "improved title if needed",
  "description": "improved meta description if needed",
  "tags": ["additional", "relevant", "tags"],
  "contentSuggestions": ["specific content improvement suggestions"]
}
Only include fields that need improvement.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const suggestions = JSON.parse(response.choices[0].message.content || '{}');
  return suggestions;
}

async function applySEOSuggestions(
  filePath: string,
  frontmatter: Record<string, any>,
  content: string,
  suggestions: SEOSuggestions
) {
  // Update frontmatter
  if (suggestions.title) frontmatter.title = suggestions.title;
  if (suggestions.description) frontmatter.description = suggestions.description;
  if (suggestions.tags) {
    frontmatter.tags = Array.from(new Set([...frontmatter.tags, ...suggestions.tags]));
  }
  
  // Update content with suggestions
  let updatedContent = content;
  if (suggestions.contentSuggestions) {
    updatedContent = content.trim() + '\n\n' + suggestions.contentSuggestions.join('\n\n');
  }
  
  // Write updated file
  const updatedFile = `---\n${stringify(frontmatter)}---\n\n${updatedContent.trim()}\n`;
  await writeFile(filePath, updatedFile);
}

analyzeSEO().catch(error => {
  console.error('SEO analysis failed:', error);
  process.exit(1);
}); 