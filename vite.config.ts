import { defineConfig } from 'vite';
import react from '@astrojs/react/vite';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  plugins: [react(), mdx(), tailwind()],
  build: {
    rollupOptions: {
      external: ['jsdom', 'node-fetch', 'node-html-parser', 'turndown', 'sanitize-filename', 'gray-matter'],
    },
  },
  optimizeDeps: {
    exclude: ['jsdom', 'node-fetch', 'node-html-parser', 'turndown', 'sanitize-filename', 'gray-matter'],
  },
}); 