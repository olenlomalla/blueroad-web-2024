// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://blueroad.ee',
  integrations: [
    tailwind(),
  ],
  output: 'static',
  redirects: {
    '/hotsnow': 'https://hotsnow.blueroad.ee',
    '/zarender': 'https://zarender.blueroad.ee'
  },
  vite: {
    ssr: {
      noExternal: ['@astrojs/prism']
    }
  }
});
