import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));

export const metadata: Metadata = {
  title: '利用規約',
  description: 'サウナ子の利用規約です。本サービスをご利用いただく前に、必ずお読みください。',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'TOP', item: 'https://saunako.jp/' },
            { '@type': 'ListItem', position: 2, name: '利用規約', item: 'https://saunako.jp/terms' },
          ],
        }) }}
      />

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-16">
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">利用規約</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">
          利用規約
        </h1>

        <div className="space-y-8 text-[15px] leading-relaxed text-text-primary">
          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">第1条（適用範囲）</h2>
            <p className="text-text-secondary">
              本利用規約（以下「本規約」といいます）は、サウナ子（以下「本サービス」といいます）が提供するすべてのサービスの利用に関する条件を定めるものです。本サービスを利用するすべてのユーザーに適用されます。本サービスをご利用いただいた時点で、本規約に同意したものとみなします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">第2条（サービス内容）</h2>
            <p className="text-text-secondary">
              本サービスは、個室サウナ（プライベートサウナ）に関する情報の検索・比較サービスです。料金・設備・アクセス情報等を一覧で閲覧・比較いただけます。本サービスは情報提供を目的としており、施設の予約代行や決済機能は提供しておりません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">第3条（免責事項）</h2>
            <ol className="list-decimal list-inside space-y-3 text-text-secondary">
              <li>
                本サービスに掲載される情報（料金、営業時間、設備内容等）について、その正確性、最新性、完全性を保証するものではありません。最新の情報は各施設の公式サイト等でご確認ください。
              </li>
              <li>
                本サービスから外部サイト（施設公式サイト、予約サイト等）へのリンクを提供する場合がありますが、リンク先のサイトにおけるトラブル（予約に関する紛争、個人情報の取り扱い等）について、当方は一切の責任を負いません。
              </li>
              <li>
                施設の予約・決済は、各施設と利用者間の直接取引であり、本サービスはこれに関与いたしません。取引に関するトラブルは当事者間で解決していただくものとします。
              </li>
              <li>
                システムの保守、天災、その他やむを得ない事由により、本サービスの提供を中断・停止する場合があります。これによりユーザーに生じた損害について、当方は一切の責任を負いません。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">第4条（禁止事項）</h2>
            <p className="text-text-secondary mb-3">
              本サービスの利用にあたり、以下の行為を禁止します。
            </p>
            <ol className="list-decimal list-inside space-y-3 text-text-secondary">
              <li>
                スクレイピング、クローリング等による本サービスのデータの自動収集、またはデータの無断転載・複製
              </li>
              <li>
                本サービスへの不正アクセス、またはこれを試みる行為
              </li>
              <li>
                本サービスのサーバーやネットワークに過度の負荷をかける行為、その他サービスの運営を妨害する行為
              </li>
              <li>
                虚偽の情報を提供する行為
              </li>
              <li>
                その他、当方が不適切と判断する行為
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">第5条（知的財産権）</h2>
            <ol className="list-decimal list-inside space-y-3 text-text-secondary">
              <li>
                本サービスに掲載されるコンテンツ（テキスト、デザイン、ロゴ、プログラム等）の著作権その他の知的財産権は、当方に帰属します。
              </li>
              <li>
                本サービスに掲載される施設の画像の著作権は、各施設またはその権利者に帰属します。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">第6条（リンクについて）</h2>
            <p className="text-text-secondary">
              本サービスへのリンクは、原則として自由に行っていただけます。ただし、本サービスの名誉・信用を毀損する態様でのリンクはお断りいたします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">第7条（規約の変更）</h2>
            <p className="text-text-secondary">
              当方は、必要と判断した場合に、ユーザーへの事前の通知なく本規約を変更することがあります。変更後の規約は、本サービス上に掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-primary mb-3">第8条（準拠法・管轄裁判所）</h2>
            <p className="text-text-secondary">
              本規約の解釈および適用は、日本法に準拠するものとします。本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-text-tertiary">
              制定日: 2026年2月17日
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-6 md:py-8">
        <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <Image src="/saunako-avatar.webp" alt="サウナ子" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
            <span className="font-bold text-sm text-white">サウナ子</span>
          </Link>
          <p className="text-[11px] text-[#757575] max-w-lg mx-auto mb-3 leading-relaxed">
            当サイトは個室サウナの情報をまとめた非公式の検索サービスです。掲載情報は正確性を保証するものではありません。最新の料金・営業時間は各施設の公式サイトをご確認ください。
          </p>
          <div className="flex items-center justify-center gap-4 mb-3">
            <Link href="/terms" className="text-[11px] text-[#757575] hover:text-white transition-colors">利用規約</Link>
            <Link href="/privacy" className="text-[11px] text-[#757575] hover:text-white transition-colors">プライバシーポリシー</Link>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSerWPa3fBFUoKFgce1s2yEu4YIZR0t59auTD1TC_tkjTvKxCA/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#757575] hover:text-white transition-colors">お問い合わせ</a>
          </div>
          <p className="text-[11px] text-[#757575]">&copy; 2026 サウナ子 All rights reserved.</p>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
