import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { globby } from 'globby';

const BLOG_DIR = 'src/content/blog';

function cleanValue(value) {
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

function formatValue(key, value) {
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
    const lines = [];
    
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

function extractFrontmatterAndContent(content) {
  // Look for frontmatter at the start of the file
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  
  const [_, frontmatter, mainContent] = match;
  return { frontmatter, content: mainContent };
}

function parseFrontmatter(frontmatter) {
  const data = {
    title: '',
    description: '',
    date: '',
    author: '',
  };
  
  let currentKey = null;
  let currentValue = [];
  let isMultiline = false;
  let indentLevel = 0;
  let contentBuffer = [];
  
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
      
      // Check if this looks like content rather than frontmatter
      if (value.length > 100 || (value.includes('. ') && !value.startsWith('"'))) {
        contentBuffer.push(trimmedLine);
        return;
      }
      
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
          isMultiline = true;
          currentValue = [];
        } else {
          // Check if this value looks like an image path
          if (value.startsWith('/') && /\.(png|jpe?g|gif|svg|webp)$/i.test(value)) {
            data.image = cleanValue(value);
          } else {
            // Handle nested description in description
            if (key === 'description' && value.startsWith('description:')) {
              data[key] = cleanValue(value.replace('description:', '').trim());
            } else {
              data[key] = cleanValue(value);
            }
          }
          currentKey = null;
          isMultiline = false;
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
    } else {
      // This might be content that was incorrectly included in frontmatter
      contentBuffer.push(line);
    }
  });
  
  // Save the last key-value pair if exists
  if (currentKey) {
    const existingValue = data[currentKey];
    if (!existingValue || isDefaultValue(existingValue)) {
      data[currentKey] = currentValue.join('\n').trim();
    }
  }
  
  // Clean up any nested descriptions
  if (data.description && data.description.startsWith('description:')) {
    data.description = cleanValue(data.description.replace('description:', '').trim());
  }
  
  return { data, contentBuffer };
}

function isDefaultValue(value) {
  const defaultValues = ['Untitled', 'No description provided.', 'BlueRoad Team'];
  return !value || defaultValues.includes(value);
}

function ensureValidDate(dateStr) {
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

function generateTitle(content) {
  // Try to find a heading in the content
  const headingMatch = content.match(/^#\s+(.+)$/m) || content.match(/^(.+?)[.!?](\s|$)/);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  
  // If no heading found, use the first sentence or first 60 characters
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length > 60) {
    return firstLine.slice(0, 57) + '...';
  }
  return firstLine || 'Untitled';
}

function generateDescription(content) {
  // Remove headings and special characters
  const cleanContent = content
    .replace(/^#.*$/gm, '')
    .replace(/[#*_`]/g, '')
    .trim();
  
  // Find the first paragraph
  const paragraphs = cleanContent.split('\n\n');
  const firstParagraph = paragraphs[0].trim();
  
  if (firstParagraph.length > 160) {
    return firstParagraph.slice(0, 157) + '...';
  }
  return firstParagraph || 'No description provided.';
}

async function fixFrontmatter(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Extract frontmatter and content
    const extracted = extractFrontmatterAndContent(content);
    if (!extracted) {
      console.warn(`No frontmatter found in ${filePath}`);
      return;
    }
    
    const { frontmatter, content: mainContent } = extracted;
    
    // Parse frontmatter and get any content that was incorrectly included
    const { data, contentBuffer } = parseFrontmatter(frontmatter);
    
    // If we found content in the frontmatter, add it to the main content
    const fullContent = [...contentBuffer, mainContent].join('\n').trim();
    
    // Generate title and description from content if they're missing
    if (!data.title || isDefaultValue(data.title)) {
      data.title = generateTitle(fullContent);
    }
    
    if (!data.description || isDefaultValue(data.description)) {
      data.description = generateDescription(fullContent);
    }
    
    // Convert dates and ensure they're not in the future
    if (data.pubDate || data.publishedAt) {
      data.date = ensureValidDate(data.pubDate || data.publishedAt);
      delete data.pubDate;
      delete data.publishedAt;
    }
    
    // If date is in the future or invalid, set it to today
    if (data.date) {
      data.date = ensureValidDate(data.date);
    }
    
    // Ensure required fields
    if (!data.title) data.title = "Untitled";
    if (!data.description) data.description = "No description provided.";
    if (!data.date) data.date = new Date().toISOString().split('T')[0];
    if (!data.author) data.author = "BlueRoad Team";
    
    // Convert tags
    if (data.tags) {
      if (typeof data.tags === 'string') {
        try {
          if (data.tags.startsWith('[')) {
            data.tags = JSON.parse(data.tags.replace(/'/g, '"'));
          } else {
            data.tags = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
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
    const updatedContent = `---\n${newFrontmatter}\n---\n\n${fullContent}\n`;
    await writeFile(filePath, updatedContent, 'utf-8');
    console.log(`✓ Updated ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function main() {
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