# SEO Setup Guide - Google Search Console

This guide will help you set up Google Search Console to get your site indexed and appearing in Google search results.

## Prerequisites

- Your site must be deployed and accessible at: https://changebyone.vercel.app/
- You need a Google account

## Step 1: Access Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click "Add Property" or "Start now"

## Step 2: Verify Site Ownership

You have several options to verify ownership:

### Option A: HTML Tag (Recommended)

1. In Google Search Console, select "HTML tag" verification method
2. Copy the verification code (looks like: `<meta name="google-site-verification" content="ABC123..." />`)
3. Add it to `app/layout.tsx` in the metadata verification object:
   ```typescript
   verification: {
     google: "ABC123...", // Paste your verification code here
   },
   ```
4. Deploy the changes
5. Click "Verify" in Google Search Console

### Option B: Domain Verification (If you have a custom domain)

1. Select "Domain" verification
2. Follow the DNS record instructions
3. Add the TXT record to your domain's DNS settings
4. Wait for DNS propagation (can take up to 48 hours)
5. Click "Verify" in Google Search Console

## Step 3: Submit Your Sitemap

1. Once verified, go to "Sitemaps" in the left sidebar
2. Enter your sitemap URL: `https://changebyone.vercel.app/sitemap.xml`
3. Click "Submit"
4. Google will start crawling your sitemap (this can take a few days)

## Step 4: Request Indexing (Optional but Recommended)

1. Go to "URL Inspection" in the left sidebar
2. Enter your homepage URL: `https://changebyone.vercel.app/`
3. Click "Request Indexing"
4. This tells Google to prioritize crawling your homepage

You can also request indexing for other important pages:
- `https://changebyone.vercel.app/privacy`
- `https://changebyone.vercel.app/terms`
- `https://changebyone.vercel.app/cookies`

## Step 5: Monitor Your Site

### Check Indexing Status

1. Go to "Coverage" in the left sidebar
2. This shows which pages Google has indexed
3. Check for any errors or warnings

### Monitor Performance

1. Go to "Performance" in the left sidebar
2. After a few weeks, you'll see:
   - How many times your site appeared in search results
   - Click-through rates
   - Average position in search results
   - Top search queries

### Check for Issues

1. Go to "Enhancements" in the left sidebar
2. Check for any mobile usability issues
3. Review structured data (should show your JSON-LD schemas)

## Step 6: Additional Optimization (Optional)

### Submit to Other Search Engines

- **Bing Webmaster Tools**: https://www.bing.com/webmasters
- **Yandex Webmaster**: https://webmaster.yandex.com/ (if targeting Russian market)

### Create an Open Graph Image

1. Create an image (1200x630px) for social sharing
2. Save it as `public/og-image.png`
3. This will be used when your site is shared on social media

### Set Up Google Analytics (Optional)

1. Create a Google Analytics account
2. Get your tracking ID
3. Add it to your site (you may need to add a script to `app/layout.tsx`)

## Timeline Expectations

- **Verification**: Immediate to 48 hours
- **Initial Crawling**: 1-3 days
- **First Indexing**: 3-7 days
- **Search Results**: 1-4 weeks (depending on site authority and content)

## Troubleshooting

### Sitemap Not Found

- Verify your site is deployed
- Check that `app/sitemap.ts` exists
- Visit `https://changebyone.vercel.app/sitemap.xml` directly to confirm it's accessible

### Pages Not Indexing

- Ensure pages are accessible (no authentication required for crawlers)
- Check robots.txt doesn't block the pages
- Request indexing manually for important pages
- Be patient - indexing can take time

### Verification Fails

- Make sure you deployed the changes with the verification code
- Clear your browser cache
- Try a different verification method

## Best Practices

1. **Keep Content Fresh**: Daily puzzles help with freshness signals
2. **Monitor Regularly**: Check Search Console weekly for issues
3. **Fix Errors Promptly**: Address any crawl errors quickly
4. **Add More Content**: Consider adding a blog or game tips page
5. **Get Backlinks**: Share on social media, submit to game directories

## Resources

- [Google Search Console Help](https://support.google.com/webmasters)
- [Google's SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Next.js SEO Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

## Next Steps

After setting up Google Search Console:

1. ✅ Verify site ownership
2. ✅ Submit sitemap
3. ✅ Request indexing for homepage
4. ⏳ Wait for initial crawl (1-3 days)
5. ⏳ Monitor coverage and performance
6. 🎯 Optimize based on search data

Good luck with your SEO journey!
