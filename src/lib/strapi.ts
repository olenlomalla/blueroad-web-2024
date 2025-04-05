const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN;

export type BlogCategory = 
  | 'design-sprint'
  | 'product-management'
  | 'ux-design'
  | 'web-development'
  | 'mobile-development'
  | 'agile'
  | 'digital-transformation'
  | 'case-study'
  | 'tutorial'
  | 'industry-insights';

export interface BlogPost {
  id: number;
  documentId: string;
  Title: string;
  Slug: string | null;
  Description: string;
  Content: any[];
  Category: BlogCategory;
  Tags: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Image: {
    id: number;
    name: string;
    url: string;
    formats?: any;
    width: number;
    height: number;
  };
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export async function getBlogPosts() {
  try {
    const url = `${STRAPI_URL}/api/blog-posts?populate=*&sort=publishedAt:desc&pagination[pageSize]=100`;
    console.log('Fetching blog posts from:', url);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch blog posts. Status:', response.status);
      console.error('Error details:', errorText);
      throw new Error(`Failed to fetch blog posts: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched blog posts:', data);
    
    if (!data.data) {
      console.error('No data property in response:', data);
      return [];
    }

    // Log the number of posts found
    console.log(`Found ${data.data.length} blog posts`);
    console.log('Pagination info:', data.meta?.pagination);

    return data.data as BlogPost[];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function getBlogPost(slug: string) {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/blog-posts?filters[slug][$eq]=${slug}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch blog post');
    }

    const data = await response.json();
    return data.data[0] as BlogPost;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
} 