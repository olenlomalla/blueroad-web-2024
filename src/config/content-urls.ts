import { ContentType } from '../../scripts/content-retriever';

export const contentUrls = {
  tilda: {
    [ContentType.BLOG]: [
      // Add your blog post URLs here
      // Example: 'https://blueroad.ee/blog/post1',
      // Example: 'https://blueroad.ee/blog/post2',
    ],
    [ContentType.PORTFOLIO]: [
      // Add your portfolio project URLs here
      // Example: 'https://blueroad.ee/portfolio/project1',
      // Example: 'https://blueroad.ee/portfolio/project2',
    ]
  },
  // Add URLs for other sites here
  // Example:
  // wordpress: {
  //   [ContentType.BLOG]: [
  //     'https://your-wordpress-site.com/blog/post1',
  //     'https://your-wordpress-site.com/blog/post2',
  //   ]
  // }
}; 