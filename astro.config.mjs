// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://blueroadnext.netlify.app',
  integrations: [mdx(), tailwind()],
  output: 'static',
  redirects: {
    '/zarender': 'https://zarender.blueroad.ee',
    '/hotsnow': 'https://hotsnow.blueroad.ee'
  },
  server: {
    port: 3000,
    host: true
  },
  vite: {
    server: {
      watch: {
        usePolling: true
      },
      hmr: {
        protocol: 'ws'
      }
    },
    ssr: {
      noExternal: ['path-to-regexp']
    }
  },
  // Image optimization
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.blueroad.ee'
      },
      {
        protocol: 'https',
        hostname: 'placehold.co'
      }
    ],
  },
  // Content Collections
  content: {
    collections: {
      portfolio: {
        type: 'content',
        directory: 'src/content/portfolio',
      },
      blog: {
        type: 'content',
        directory: 'src/content/blog',
      },
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'dracula',
      wrap: true
    }
  }
});
