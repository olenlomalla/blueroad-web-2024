import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { globby } from 'globby';

const BLOG_DIR = 'src/content/blog';

interface BlogFrontmatter {
  title: string;
  description: string;
  pubDate: string;
  author: string;
  image?: string;
  tags?: string[];
  category?: string;
  draft?: boolean;
  [key: string]: any; // Allow dynamic properties
}

function cleanValue(value: any): string | string[] {
  if (!value) return '';
  
  // Remove surrounding quotes and extra whitespace
  let cleanedValue = value.toString().trim();
  
  // Remove all forms of quote escaping and multiple quotes
  cleanedValue = cleanedValue
    .replace(/\\"/g, '"')
    .replace(/"{2,}/g, '"')
    .replace(/'{2,}/g, "'")
    .replace(/^["'](.*)["']$/, '$1');
  
  // Handle arrays that might be stringified
  if (cleanedValue.startsWith('[') && cleanedValue.endsWith(']')) {
    try {
      return JSON.parse(cleanedValue.replace(/'/g, '"'));
    } catch {
      // If parsing fails, treat as regular string
      return cleanedValue;
    }
  }
  
  return cleanedValue;
}

function formatValue(key: string, value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  
  const stringValue = String(value).trim();
  
  // Don't quote dates
  if (key === 'date' && /^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
    return stringValue;
  }
  
  // If value contains newlines, create a literal block
  if (stringValue.includes('\n')) {
    const lines = stringValue.split('\n').map(line => line.trim()).filter(Boolean);
    return `"${lines.join(' ')}"`;
  }
  
  // Handle values that need folding (long strings)
  if (stringValue.length > 80 && key !== 'image') {
    const words = stringValue.split(/\s+/);
    let currentLine = '';
    const lines: string[] = [];
    
    words.forEach(word => {
      if (!currentLine) {
        currentLine = word;
      } else if ((currentLine + ' ' + word).length <= 80) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return `"${lines.join(' ')}"`;
  }
  
  // Always quote image paths
  if (key === 'image') {
    return `"${stringValue}"`;
  }
  
  // If value contains special characters or starts with special characters, quote it
  if (/[:#{}\[\],&*?|<>=!%@`]/.test(stringValue) || /^[- ]/.test(stringValue)) {
    // Escape any existing quotes and wrap in quotes
    return `"${stringValue.replace(/"/g, '\\"')}"`;
  }
  
  // If value contains spaces or is empty, quote it
  if (stringValue.includes(' ') || stringValue === '') {
    return `"${stringValue}"`;
  }
  
  return stringValue;
}

interface ExtractedContent {
  frontmatter: string;
  content: string;
}

function extractFrontmatterAndContent(content: string): ExtractedContent | null {
  // Look for frontmatter at the start of the file
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  
  const [_, frontmatter, mainContent] = match;
  return { frontmatter, content: mainContent };
}

function parseFrontmatter(frontmatter: string): BlogFrontmatter {
  const data: BlogFrontmatter = {
    title: '',
    description: '',
    pubDate: '',
    author: '',
    tags: []
  };
  
  let currentKey: string | null = null;
  let currentValue: string[] = [];
  let indentLevel = 0;
  
  frontmatter.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    
    // Calculate the indentation level
    const indent = line.match(/^( *)/)?.[1].length ?? 0;
    
    // Check if this is a new key-value pair
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmedLine.slice(0, colonIndex).trim();
      const value = trimmedLine.slice(colonIndex + 1).trim();
      
      // If this line is less indented than the current block, or at root level
      if (indent <= indentLevel || indent === 0) {
        // Save previous key-value pair if exists
        if (currentKey) {
          const existingValue = data[currentKey];
          // Only keep the non-default value
          if (!existingValue || isDefaultValue(existingValue)) {
            data[currentKey] = currentValue.join('\n').trim();
          }
          currentValue = [];
        }
        
        currentKey = key;
        indentLevel = indent;
        
        // Check if this is a multiline value
        if (value === '|' || value === '>-' || value === '>') {
          currentValue = [];
        } else {
          // Check if this value looks like an image path
          if (value.startsWith('/') && /\.(png|jpe?g|gif|svg|webp)$/i.test(value)) {
            data.image = cleanValue(value) as string;
          } else {
            data[currentKey] = cleanValue(value);
          }
          currentKey = null;
        }
      }
    } else if (currentKey && indent > indentLevel) {
      // This is a continuation of a multiline value
      // Check if this line looks like an image path
      if (trimmedLine.startsWith('/') && /\.(png|jpe?g|gif|svg|webp)$/i.test(trimmedLine)) {
        data.image = trimmedLine;
      } else {
        currentValue.push(trimmedLine);
      }
    }
  });
  
  // Save the last key-value pair if exists
  if (currentKey) {
    const existingValue = data[currentKey];
    if (!existingValue || isDefaultValue(existingValue)) {
      data[currentKey] = currentValue.join('\n').trim();
    }
  }
  
  return data;
}

function isDefaultValue(value: any): boolean {
  const defaultValues = ['Untitled', 'No description provided.', 'BlueRoad Team'];
  return !value || defaultValues.includes(value);
}

function ensureValidDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
    
    // If date is invalid or in the future, use today's date
    if (isNaN(date.getTime()) || date > now) {
      return now.toISOString().split('T')[0];
    }
    
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

async function fixFrontmatter(filePath: string): Promise<void> {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Extract frontmatter and content
    const extracted = extractFrontmatterAndContent(content);
    if (!extracted) {
      console.warn(`No frontmatter found in ${filePath}`);
      return;
    }
    
    const { frontmatter, content: mainContent } = extracted;
    
    // Parse frontmatter
    const data = parseFrontmatter(frontmatter);
    
    // Convert dates and ensure they're not in the future
    if (data.pubDate) {
      data.pubDate = ensureValidDate(data.pubDate);
    }
    
    // Ensure required fields
    if (!data.title) data.title = "Untitled";
    if (!data.description) data.description = "No description provided.";
    if (!data.pubDate) data.pubDate = new Date().toISOString().split('T')[0];
    if (!data.author) data.author = "BlueRoad Team";
    
    // Convert tags
    if (data.tags) {
      if (typeof data.tags === 'string') {
        try {
          if ((data.tags as string).startsWith('[')) {
            data.tags = JSON.parse((data.tags as string).replace(/'/g, '"'));
          } else {
            data.tags = (data.tags as string).split(',').map((tag: string) => tag.trim()).filter(Boolean);
          }
        } catch {
          data.tags = [];
        }
      }
      // Ensure tags is always an array
      if (!Array.isArray(data.tags)) {
        data.tags = [];
      }
    }
    
    // Remove unnecessary fields
    delete data.category;
    delete data.draft;
    
    // Generate new frontmatter
    const newFrontmatter = Object.entries(data)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}: ${formatValue(key, value)}`)
      .join('\n');
    
    // Write the updated file
    const updatedContent = `---\n${newFrontmatter}\n---\n${mainContent}`;
    await writeFile(filePath, updatedContent, 'utf-8');
    console.log(`✓ Updated ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function main(): Promise<void> {
  try {
    const files = await globby(['**/*.md', '**/*.mdx'], {
      cwd: BLOG_DIR,
      absolute: true,
    });
    
    console.log(`Found ${files.length} blog posts to process...`);
    
    for (const file of files) {
      await fixFrontmatter(file);
    }
    
    console.log('\nDone! All blog posts have been processed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 