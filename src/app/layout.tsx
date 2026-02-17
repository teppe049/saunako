import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { ADSENSE_CLIENT_ID, isAdSenseEnabled } from "@/lib/adsense";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "サウナ子 | 個室サウナ検索",
    template: "%s | サウナ子",
  },
  description:
    "東京・大阪の個室サウナを比較・検索。料金・設備・アクセス情報を一覧で確認。",
  keywords: ["個室サウナ", "プライベートサウナ", "東京", "大阪", "サウナ検索"],
  authors: [{ name: "サウナ子" }],
  metadataBase: new URL("https://saunako.jp"),
  openGraph: {
    title: "サウナ子 | 個室サウナ検索",
    description:
      "東京・大阪の個室サウナを比較・検索。料金・設備・アクセス情報を一覧で確認。",
    url: "https://saunako.jp",
    siteName: "サウナ子",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "サウナ子 | 個室サウナ検索",
    description:
      "東京・大阪の個室サウナを比較・検索。料金・設備・アクセス情報を一覧で確認。",
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
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
};

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'サウナ子',
      url: 'https://saunako.jp',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://saunako.jp/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      name: 'サウナ子',
      url: 'https://saunako.jp',
      logo: 'https://saunako.jp/saunako-avatar.webp',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        {isAdSenseEnabled && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
