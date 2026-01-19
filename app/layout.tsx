import type { Metadata } from "next";
import "./globals.css";
import WordLoader from "@/components/WordLoader";
import SiteFooter from "@/components/SiteFooter";
import StructuredData from "@/components/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://changebyone.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Change by One - Daily Word Puzzle Game",
    template: "%s | Change by One",
  },
  description: "Daily word puzzle game where you transform one word into another by changing one letter at a time. Play 6 unique puzzles every day with word lengths from 3 to 8 letters. Compete on leaderboards, use hints, and challenge friends!",
  keywords: [
    "word puzzle",
    "daily puzzle",
    "word game",
    "word ladder",
    "word chain",
    "puzzle game",
    "daily challenge",
    "word transformation",
    "brain game",
    "word puzzle online",
    "free word game",
  ],
  authors: [{ name: "Change by One" }],
  creator: "Change by One",
  publisher: "Change by One",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Change by One",
    title: "Change by One - Daily Word Puzzle Game",
    description: "Transform one word into another by changing one letter at a time. Play 6 daily puzzles and compete on leaderboards!",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Change by One - Daily Word Puzzle Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Change by One - Daily Word Puzzle Game",
    description: "Transform one word into another by changing one letter at a time. Play 6 daily puzzles and compete on leaderboards!",
    images: [`${siteUrl}/og-image.png`],
    creator: "@changebyone",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "MWJ5vDKob13gLK1UR0iRYySlW0-vpvTAOwhUZItvLVk",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StructuredData />
        <WordLoader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
