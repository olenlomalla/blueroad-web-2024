# Development Guide

## Project Overview
BlueRoad Web 2024 is a modern web application built with Astro, React, and TypeScript. The project includes a portfolio system with case studies, a blog, and an admin interface.

## Getting Started

### Prerequisites
- Node.js 18+
- npm 8+
- Environment variables (see `.env.example`)

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

## Project Structure

### Key Directories
- `src/content/` - Content collections (portfolio, blog)
- `src/lib/` - Shared utilities and business logic
- `src/pages/` - Astro pages and API routes
- `public/` - Static assets

### Configuration
All project configuration is centralized in `src/config/project.config.ts`

## Features

### Case Study System
The case study system supports:
- RSS feed imports
- Manual submissions through admin interface
- Automatic image optimization
- SEO monitoring and optimization

#### Import Process
1. RSS feed is parsed
2. Images are downloaded and optimized
3. Markdown files are generated
4. SEO analysis is performed

### Content Management
- Use the admin interface at `/admin/case-studies`
- All content is version controlled
- Images are automatically optimized

## Development Workflow

### Making Changes
1. Create a new branch
2. Update CHANGELOG.md
3. Make your changes
4. Update tests
5. Create a pull request

### Configuration Changes
1. Update `project.config.ts`
2. Update `CHANGELOG.md`
3. Update documentation if needed

## Troubleshooting

### Common Issues
1. Missing environment variables
2. Image processing errors
3. RSS feed parsing issues

### Debug Tools
- Check logs in `npm run dev`
- Use the admin interface debug panel
- Check the network tab for image loading issues

## Best Practices

### Code Style
- Use TypeScript
- Follow ESLint configuration
- Use Zod for runtime validation

### Content Management
- Always use ISO 8601 dates
- Optimize images before import
- Follow the case study template

### Performance
- Lazy load images
- Use appropriate image sizes
- Implement proper caching

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Required variables:
- `OPENAI_API_KEY`
- `NODE_ENV`

## Monitoring

### SEO Performance
- Daily automated checks
- Manual analysis in admin panel
- Automatic improvement suggestions

### Image Optimization
- Size and quality metrics
- Loading performance
- Optimization suggestions 