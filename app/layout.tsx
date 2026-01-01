import type { Metadata } from "next";
import "./globals.css";
import WordLoader from "@/components/WordLoader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Change by One",
  description: "Daily word puzzle - transform one word into another by changing one letter at a time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WordLoader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
