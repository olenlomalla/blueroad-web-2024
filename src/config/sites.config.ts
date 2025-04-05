import { ContentSource, ContentType } from '../../scripts/content-retriever';

export const siteConfigs = {
  tilda: {
    source: ContentSource.TILDA,
    baseUrl: 'https://blueroadnext.netlify.app',
    contentTypes: [ContentType.BLOG, ContentType.PORTFOLIO],
    selectors: {
      title: ['.t-entry__title', '.t-title h1', '.t-title', 'h1'],
      date: ['.t-entry__date', '.t-date', 'time'],
      content: ['.t-entry__post', '.t-text', 'article', '.t-content'],
      images: ['img[src*="static"]', 'img[src*="uploads"]'],
      author: ['.t-author', '.author-name'],
      description: ['meta[name="description"]', '.t-entry__descr', '.t-descr'],
      category: ['.t-category', '.category-tag']
    }
  },
  // Add your other site configurations here
  // Example:
  // wordpress: {
  //   source: ContentSource.WORDPRESS,
  //   baseUrl: 'your-wordpress-site.com',
  //   contentTypes: [ContentType.BLOG],
  //   selectors: {
  //     title: ['.entry-title', 'h1'],
  //     date: ['.entry-date', 'time'],
  //     content: ['.entry-content', 'article'],
  //     images: ['img.wp-post-image', 'img.attachment-post-thumbnail'],
  //     author: ['.author-name', '.entry-author'],
  //     description: ['meta[name="description"]'],
  //     category: ['.cat-links', '.entry-categories']
  //   }
  // }
}; 