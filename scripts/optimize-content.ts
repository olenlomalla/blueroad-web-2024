import { ContentUpdateJob } from '../src/services/contentUpdateJob';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
const CONTENT_DIR = process.env.CONTENT_DIR || 'src/content';

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set');
  process.exit(1);
}

async function main() {
  try {
    // At this point, OPENAI_API_KEY is guaranteed to be a non-empty string
    const job = new ContentUpdateJob(OPENAI_API_KEY, CONTENT_DIR);
    await job.updateAllContent();
    console.log('Content optimization completed successfully');
  } catch (error) {
    console.error('Error during content optimization:', error);
    process.exit(1);
  }
}

main().catch(console.error); 