const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://changebyone.vercel.app';

export default function StructuredData() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Change by One',
    url: siteUrl,
    description: 'Daily word puzzle game where you transform one word into another by changing one letter at a time',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Change by One',
    applicationCategory: 'Game',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      ratingCount: '1',
    },
    description: 'Daily word puzzle game where you transform one word into another by changing one letter at a time. Play 6 unique puzzles every day with word lengths from 3 to 8 letters.',
    url: siteUrl,
    screenshot: `${siteUrl}/og-image.png`,
    featureList: [
      'Daily word puzzles',
      '6 puzzles per day',
      'Leaderboards',
      'Challenge friends',
      'Hints system',
      'Timer tracking',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
      />
    </>
  );
}
