import { APIRoute } from 'astro';
import { z } from 'zod';
import { ContentRetriever } from '../../../scripts/content-retriever';
import { siteConfigs } from '../../config/sites.config';

// Request schema for onboarding
const onboardingRequestSchema = z.object({
  siteType: z.enum(['tilda', 'wordpress', 'custom']),
  baseUrl: z.string().url(),
  contentTypes: z.array(z.enum(['blog', 'portfolio', 'case-studies'])),
  selectors: z.object({
    title: z.array(z.string()),
    date: z.array(z.string()),
    content: z.array(z.string()),
    images: z.array(z.string()),
    author: z.array(z.string()).optional(),
    description: z.array(z.string()).optional(),
    category: z.array(z.string()).optional(),
  }),
  urls: z.array(z.string().url()),
  stagingMode: z.boolean().default(false),
  stagingDomain: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validatedData = onboardingRequestSchema.parse(body);

    // Create a new site configuration
    const siteConfig = {
      source: validatedData.siteType,
      baseUrl: validatedData.baseUrl,
      contentTypes: validatedData.contentTypes,
      selectors: validatedData.selectors,
      stagingMode: validatedData.stagingMode,
      stagingDomain: validatedData.stagingDomain,
    };

    // Initialize content retriever
    const retriever = new ContentRetriever(siteConfig);

    // Process URLs
    const results = await Promise.all(
      validatedData.urls.map(async (url) => {
        try {
          const content = await retriever.retrieveContent(url);
          
          // If in staging mode, modify URLs to point to staging domain
          if (validatedData.stagingMode && validatedData.stagingDomain) {
            content.url = content.url.replace(
              new URL(validatedData.baseUrl).hostname,
              validatedData.stagingDomain
            );
          }

          return {
            url,
            status: 'success',
            content,
            stagingUrl: validatedData.stagingMode ? content.url : undefined,
          };
        } catch (error) {
          return {
            url,
            status: 'error',
            error: error.message,
          };
        }
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        results,
        stagingMode: validatedData.stagingMode,
        stagingDomain: validatedData.stagingDomain,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}; 