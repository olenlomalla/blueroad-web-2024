import { SEOMonitoringService } from '../../../services/seo-monitoring';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { url, content } = await request.json();
    
    if (!url || !content) {
      return new Response(
        JSON.stringify({ error: 'URL and content are required' }),
        { status: 400 }
      );
    }
    
    const seoService = SEOMonitoringService.getInstance();
    const results = await seoService.analyzePage(url, content);
    
    return new Response(JSON.stringify(results));
  } catch (error) {
    console.error('Error in SEO monitoring API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const seoService = SEOMonitoringService.getInstance();
    const results = seoService.getAllResults();
    
    return new Response(JSON.stringify(results));
  } catch (error) {
    console.error('Error fetching SEO monitoring results:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}; 