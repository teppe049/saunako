import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
