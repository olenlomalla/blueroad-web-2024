// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://blueroad.ee',
  output: 'static',
  integrations: [
    react(),
    mdx(),
    tailwind(),
    sitemap(),
  ],
  redirects: {
    '/zarender': 'https://zarender.blueroad.ee',
    '/hotsnow': 'https://hotsnow.blueroad.ee'
  },
  server: {
    port: 3000,
    host: true
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['jsdom', 'node-fetch', 'node-html-parser', 'turndown', 'sanitize-filename', 'gray-matter'],
      },
    },
    optimizeDeps: {
      exclude: ['jsdom', 'node-fetch', 'node-html-parser', 'turndown', 'sanitize-filename', 'gray-matter'],
    },
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
        schema: {
          title: { type: 'string', required: true },
          date: { type: 'date', required: true },
          description: { type: 'string', required: true },
          tags: { type: 'array', items: { type: 'string' } },
          draft: { type: 'boolean', default: false },
        },
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
