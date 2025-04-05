# Changelog

All notable changes to the BlueRoad Web project will be documented in this file.

## [Unreleased]

### Added

- Case study import system with RSS feed support
- Image processing pipeline using Sharp
- Automatic SEO optimization system integration with OpenAI
- Admin interface for case study submissions
- GitHub Actions workflow for CI/CD
- Automated content validation
- Automated image optimization
- Automated SEO analysis and improvements
- Daily optimization runs via GitHub Actions

### Changed

- Updated case study schema to include gallery images
- Modified date format in frontmatter to ISO 8601
- Centralized project configuration
- Improved development documentation

### Environment Variables

```shell
OPENAI_API_KEY=<your-api-key>
CLOUDFLARE_API_TOKEN=<your-cloudflare-token>
```

### File Structure

```text
src/
  ├── content/
  │   └── portfolio/          # Case study markdown files
  ├── lib/
  │   └── case-studies/
  │       ├── import-rss.ts   # RSS import functionality
  │       └── seo/
  │           └── monitor.ts  # SEO monitoring system
  └── pages/
      └── admin/
          └── case-studies/   # Admin interface components
public/
  └── images/
      └── portfolio/         # Processed case study images
scripts/
  ├── validate-content.ts    # Content validation script
  ├── optimize-images.ts     # Image optimization script
  └── analyze-seo.ts        # SEO analysis script
.github/
  └── workflows/
      └── main.yml          # GitHub Actions workflow
```

### Dependencies

```json
{
  "sharp": "^0.32.6",
  "fast-xml-parser": "^4.3.2",
  "node-fetch": "^3.3.2",
  "openai": "^4.0.0",
  "yaml": "^2.3.4"
}
```

## [2024-03-12]

### New Features

- Implemented RSS feed import system
- Added image processing pipeline
- Created demo script for testing imports
- Added GitHub Actions automation
- Added content validation system
- Added automated SEO optimization

### Fixed

- Updated image paths in case study markdown files
- Fixed date format in frontmatter
- Improved error handling in automation scripts

### Technical Decisions

1. Using Sharp for image processing to ensure consistent quality and size
2. Implementing file-based import for local development
3. Using ISO 8601 date format for better compatibility
4. Using GitHub Actions for automated optimization
5. Implementing OpenAI for SEO suggestions

### Known Issues

1. Need to handle image download failures gracefully
2. Consider implementing image optimization queue for large imports
3. Add validation for RSS feed structure
4. Add retry mechanism for OpenAI API calls
