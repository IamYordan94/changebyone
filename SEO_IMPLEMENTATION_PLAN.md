# SEO Implementation Plan for Google Crawling

## Overview
Implement comprehensive SEO features to improve Google indexing and discoverability of the "Change by One" word puzzle game.

## Current State
- Basic metadata only (title and description)
- No sitemap
- No robots.txt
- No structured data
- No Open Graph/Twitter Cards

## Implementation Tasks

### 1. Enhanced Metadata (app/layout.tsx)
- Add comprehensive metadata object with:
  - Open Graph tags for social sharing
  - Twitter Card tags
  - SEO keywords
  - Canonical URLs
  - Robots directives
  - Google verification (placeholder for Search Console)

### 2. Sitemap Generation (app/sitemap.ts)
- Generate sitemap with:
  - Homepage (/)
  - Static pages (/privacy, /terms, /cookies)
  - Proper priorities and change frequencies
- Use Next.js 14 App Router sitemap.ts convention

### 3. Robots.txt (app/robots.ts)
- Allow all crawlers
- Reference sitemap location
- Disallow API routes

### 4. Structured Data (components/StructuredData.tsx)
- Add JSON-LD for:
  - WebSite schema
  - SoftwareApplication/Game schema
  - Enables rich snippets in search results

### 5. Page-Specific Metadata
- Update key pages with specific metadata:
  - Homepage (app/page.tsx)
  - Challenge pages (app/challenge/[code]/page.tsx)
  - Legal pages

### 6. Environment Configuration
- Add NEXT_PUBLIC_SITE_URL to .env.local
- Use for all absolute URLs in metadata

### 7. Documentation (SEO_SETUP.md)
- Instructions for Google Search Console setup
- How to verify site ownership
- How to submit sitemap
- How to monitor indexing

## Files to Create/Modify

**Create:**
- app/sitemap.ts
- app/robots.ts
- components/StructuredData.tsx
- SEO_SETUP.md

**Modify:**
- app/layout.tsx (enhanced metadata)
- app/page.tsx (page-specific metadata)
- app/challenge/[code]/page.tsx (dynamic metadata)
- env.example (add NEXT_PUBLIC_SITE_URL)

## Next Steps After Implementation

1. Deploy to production
2. Verify site in Google Search Console
3. Submit sitemap
4. Request indexing
5. Monitor over 1-2 weeks

## Questions for User

1. What is your production domain URL? (e.g., https://changebyone.com or Vercel domain)
2. Do you want to include challenge pages in the sitemap? (may be many URLs)
3. Do you have a Google Search Console account set up?
