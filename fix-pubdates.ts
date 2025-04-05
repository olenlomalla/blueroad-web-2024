import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';

function formatDate(dateStr: string): string {
    // Remove any quotes
    dateStr = dateStr.replace(/['"]/g, '');
    
    // If it's already a full ISO string, just wrap in quotes
    if (dateStr.includes('T')) {
        return `"${dateStr}"`;
    }
    
    // For simple dates, convert to full ISO string
    return `"${dateStr}T00:00:00.000Z"`;
}

function processFile(filePath: string) {
    console.log(`Processing ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find the pubDate line
    const pubDateRegex = /^(pubDate:\s*)(.+)$/m;
    const match = content.match(pubDateRegex);
    
    if (match) {
        const [fullMatch, prefix, dateValue] = match;
        const formattedDate = formatDate(dateValue.trim());
        const newContent = content.replace(pubDateRegex, `${prefix}${formattedDate}`);
        
        if (newContent !== content) {
            fs.writeFileSync(filePath, newContent);
            console.log(`Updated ${filePath}`);
            console.log(`  From: ${fullMatch}`);
            console.log(`  To:   ${prefix}${formattedDate}`);
        } else {
            console.log(`No changes needed for ${filePath}`);
        }
    } else {
        console.log(`No pubDate found in ${filePath}`);
    }
}

// Find all markdown files in src/content
const files = globSync('src/content/**/*.md');

// Process each file
files.forEach(processFile);

console.log('Done processing all files.'); 