import { OpenAI } from 'openai';
import { aiCmsConfig, aiContentSchema } from '../../../config/ai-cms.config';
import type { APIRoute } from 'astro';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message, context } = await request.json();
    
    // Prepare the conversation context
    const conversation = [
      {
        role: 'system',
        content: aiCmsConfig.contentGeneration.systemPrompt,
      },
      {
        role: 'user',
        content: message,
      },
    ];
    
    // Add context if provided
    if (context) {
      conversation.unshift({
        role: 'system',
        content: `Context: Page type: ${context.pageType}, Target keywords: ${context.targetKeywords?.join(', ') || 'none'}`,
      });
    }
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: aiCmsConfig.contentGeneration.model,
      messages: conversation,
      temperature: aiCmsConfig.contentGeneration.temperature,
      max_tokens: aiCmsConfig.contentGeneration.maxTokens,
    });
    
    const response = completion.choices[0].message.content;
    
    // Generate suggestions based on the response
    const suggestions = await generateSuggestions(response, context);
    
    return new Response(
      JSON.stringify({
        response,
        suggestions,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

async function generateSuggestions(response: string, context: any) {
  const suggestions = [];
  
  // Generate content improvement suggestions
  if (context?.currentContent) {
    const contentAnalysis = await openai.chat.completions.create({
      model: aiCmsConfig.contentGeneration.model,
      messages: [
        {
          role: 'system',
          content: 'Analyze the content and provide specific improvement suggestions.',
        },
        {
          role: 'user',
          content: `Current content: ${context.currentContent}\n\nResponse: ${response}\n\nProvide 3 specific suggestions for improvement.`,
        },
      ],
    });
    
    suggestions.push(...contentAnalysis.choices[0].message.content.split('\n'));
  }
  
  // Generate SEO suggestions
  if (context?.targetKeywords) {
    const seoAnalysis = await openai.chat.completions.create({
      model: aiCmsConfig.contentGeneration.model,
      messages: [
        {
          role: 'system',
          content: 'Provide SEO optimization suggestions based on the target keywords.',
        },
        {
          role: 'user',
          content: `Target keywords: ${context.targetKeywords.join(', ')}\n\nResponse: ${response}\n\nProvide 3 SEO optimization suggestions.`,
        },
      ],
    });
    
    suggestions.push(...seoAnalysis.choices[0].message.content.split('\n'));
  }
  
  return suggestions;
} 