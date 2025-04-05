import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const PORTFOLIO_DIR = 'src/content/portfolio';

async function fixTrailingNewline(filePath: string): Promise<void> {
  try {
    const content = await readFile(filePath, 'utf-8');
    // Ensure file ends with exactly one newline
    const fixedContent = content.replace(/\n*$/, '\n');
    await writeFile(filePath, fixedContent, 'utf-8');
    console.log(`✓ Fixed trailing newline in ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function main() {
  const files = [
    'case-study-halycon-chemicals.md',
    'mydogdna.md',
    'sample-project.md',
    'smart-svenska.md'
  ];

  for (const file of files) {
    const filePath = path.join(process.cwd(), PORTFOLIO_DIR, file);
    await fixTrailingNewline(filePath);
  }
}

main().catch(console.error);