import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { ADSENSE_CLIENT_ID, isAdSenseEnabled } from "@/lib/adsense";
import dynamic from "next/dynamic";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import WebVitalsReporter from "@/components/WebVitalsReporter";
const CookieConsentBanner = dynamic(() => import("@/components/CookieConsentBanner"));
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
    default: "サウナ子 | 個室・プライベートサウナを全国から比較・検索",
    template: "%s | サウナ子",
  },
  description:
    "全国47都道府県487施設以上の個室・プライベートサウナを比較・検索できるポータルサイト。東京・大阪・北海道・愛知・福岡など全国の料金・水風呂温度・ロウリュ・外気浴などの設備情報を一覧で比較。カップルや友人同士で楽しめる貸切サウナも多数掲載。あなたにぴったりの個室サウナが見つかります。",
  keywords: ["個室サウナ", "プライベートサウナ", "貸切サウナ", "東京", "大阪", "北海道", "愛知", "福岡", "サウナ検索", "サウナ比較"],
  authors: [{ name: "サウナ子" }],
  metadataBase: new URL("https://www.saunako.jp"),
  openGraph: {
    title: "サウナ子 | 個室・プライベートサウナを全国から比較・検索",
    description:
      "全国47都道府県487施設以上の個室・プライベートサウナを比較・検索できるポータルサイト。東京・大阪・北海道・愛知・福岡など全国の料金・水風呂温度・ロウリュ・外気浴などの設備情報を一覧で比較。カップルや友人同士で楽しめる貸切サウナも多数掲載。あなたにぴったりの個室サウナが見つかります。",
    url: "https://www.saunako.jp",
    siteName: "サウナ子",
    locale: "ja_JP",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "サウナ子 | 個室・プライベートサウナを全国から比較・検索",
    description:
      "全国47都道府県487施設以上の個室・プライベートサウナを比較・検索できるポータルサイト。東京・大阪・北海道・愛知・福岡など全国の料金・水風呂温度・ロウリュ・外気浴などの設備情報を一覧で比較。カップルや友人同士で楽しめる貸切サウナも多数掲載。あなたにぴったりの個室サウナが見つかります。",
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
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
      url: 'https://www.saunako.jp',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.saunako.jp/search?prefecture={prefecture}',
        'query-input': 'required name=prefecture',
      },
    },
    {
      '@type': 'Organization',
      name: 'サウナ子',
      alternateName: 'saunako',
      url: 'https://www.saunako.jp',
      logo: 'https://www.saunako.jp/saunako-avatar.webp',
      description: '全国47都道府県の個室・プライベートサウナを網羅する比較・検索サービス',
      foundingDate: '2026-01',
      sameAs: [
        'https://x.com/saunako_jp',
        'https://www.instagram.com/saunako_jp/',
      ],
      knowsAbout: ['個室サウナ', 'プライベートサウナ', '貸切サウナ'],
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
            strategy="lazyOnload"
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
        <main>{children}</main>
        <AnalyticsTracker />
        <WebVitalsReporter />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
