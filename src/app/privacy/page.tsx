import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import ScrollToTop from '@/components/ScrollToTop';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'サウナ子のプライバシーポリシー。個人情報の取り扱い、Cookie、アクセスログ等に関する方針を記載しています。',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-8 md:py-16">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">
          プライバシーポリシー
        </h1>

        <div className="space-y-8 text-text-primary text-[15px] leading-relaxed">
          <p>
            サウナ子（以下「当サイト」）は、個室サウナの情報を提供する検索サービスです。当サイトでは、ユーザーの皆さまのプライバシーを尊重し、個人情報の保護に努めています。本プライバシーポリシーでは、当サイトにおける個人情報の取り扱いについて説明します。
          </p>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3">
              1. 収集する情報
            </h2>
            <p className="mb-3">
              当サイトでは、以下の情報を収集することがあります。
            </p>
            <h3 className="font-semibold text-text-primary mb-2">
              (1) アクセスログ
            </h3>
            <p className="mb-3">
              当サイトへのアクセス時に、以下の情報が自動的に収集されます。
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-text-secondary">
              <li>IPアドレス</li>
              <li>ブラウザの種類・バージョン</li>
              <li>オペレーティングシステム</li>
              <li>参照元URL（リファラー）</li>
              <li>閲覧したページ・閲覧日時</li>
              <li>画面解像度・デバイス情報</li>
            </ul>

            <h3 className="font-semibold text-text-primary mb-2">
              (2) Cookie
            </h3>
            <p className="mb-3">
              当サイトでは、Google Analytics および Google AdSense の利用に伴い、Cookie（クッキー）を使用しています。Cookie はユーザーのブラウザに保存される小さなテキストファイルで、ユーザーを個人として特定するものではありません。
            </p>

            <h3 className="font-semibold text-text-primary mb-2">
              (3) ローカルストレージ
            </h3>
            <p>
              当サイトでは、ユーザーの利便性向上のため、ブラウザのローカルストレージ（localStorage）に「最近見た施設」の閲覧履歴を保存しています。この情報はユーザーのブラウザ内にのみ保存され、サーバーには送信されません。ブラウザの設定からいつでも削除できます。
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3">
              2. 利用目的
            </h2>
            <p className="mb-3">
              収集した情報は、以下の目的で利用します。
            </p>
            <ul className="list-disc pl-6 space-y-1 text-text-secondary">
              <li>アクセス状況の分析およびサービスの改善</li>
              <li>ユーザー体験の向上（閲覧履歴の表示等）</li>
              <li>広告の配信および最適化</li>
              <li>サイトの不正利用の防止</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3">
              3. 第三者サービスの利用
            </h2>

            <h3 className="font-semibold text-text-primary mb-2">
              (1) Google Analytics
            </h3>
            <p className="mb-4">
              当サイトでは、アクセス解析のために Google LLC が提供する Google Analytics を利用しています。Google Analytics は Cookie を使用してユーザーのアクセス情報を収集します。この情報は匿名で収集されており、個人を特定するものではありません。Google Analytics の利用規約については{' '}
              <a
                href="https://marketingplatform.google.com/about/analytics/terms/jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:opacity-80"
              >
                Google Analytics 利用規約
              </a>
              {' '}をご確認ください。Google によるデータの取り扱いについては{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:opacity-80"
              >
                Google のプライバシーポリシー
              </a>
              {' '}をご参照ください。
            </p>

            <h3 className="font-semibold text-text-primary mb-2">
              (2) Google AdSense
            </h3>
            <p>
              当サイトでは、広告配信のために Google LLC が提供する Google AdSense を利用しています。Google AdSense は Cookie を使用して、ユーザーの興味に基づいた広告を配信することがあります。Google AdSense の詳細については{' '}
              <a
                href="https://policies.google.com/technologies/ads?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:opacity-80"
              >
                Google の広告に関するポリシー
              </a>
              {' '}をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3">
              4. Cookie について
            </h2>
            <p className="mb-3">
              当サイトで使用している Cookie の種類は以下のとおりです。
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold text-text-primary">種類</th>
                    <th className="text-left py-2 pr-4 font-semibold text-text-primary">提供元</th>
                    <th className="text-left py-2 font-semibold text-text-primary">目的</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">分析Cookie</td>
                    <td className="py-2 pr-4">Google Analytics</td>
                    <td className="py-2">アクセス解析・サービス改善</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4">広告Cookie</td>
                    <td className="py-2 pr-4">Google AdSense</td>
                    <td className="py-2">パーソナライズド広告の配信</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-text-primary mb-2">
              Cookie の無効化・オプトアウト
            </h3>
            <p className="mb-3">
              ブラウザの設定により Cookie を無効にすることができます。ただし、Cookie を無効にした場合、当サイトの一部機能が正しく動作しない場合があります。
            </p>
            <p>
              Google Analytics によるデータ収集を無効にしたい場合は、Google が提供する{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:opacity-80"
              >
                Google Analytics オプトアウト アドオン
              </a>
              {' '}をご利用ください。また、Google の広告設定は{' '}
              <a
                href="https://adssettings.google.com/authenticated"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:opacity-80"
              >
                広告設定ページ
              </a>
              {' '}から管理できます。
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3">
              5. 個人情報の管理
            </h2>
            <p>
              当サイトでは、収集した情報の漏洩、紛失、改ざんを防止するため、適切な安全管理措置を講じています。個人情報への不正アクセス、紛失、破壊、改ざん、漏洩を防止するため、必要かつ適切な技術的・組織的な安全管理措置を実施しています。
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3">
              6. 第三者への提供
            </h2>
            <p>
              当サイトでは、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供することはありません。ただし、上記「3. 第三者サービスの利用」に記載のとおり、Google Analytics および Google AdSense を通じて、匿名化された情報が Google に送信されます。
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3">
              7. プライバシーポリシーの変更
            </h2>
            <p>
              当サイトは、必要に応じて本プライバシーポリシーの内容を変更することがあります。変更後のプライバシーポリシーは、当ページに掲載した時点から効力を生じるものとします。
            </p>
          </section>

          <section className="pt-4 border-t border-border">
            <p className="text-sm text-text-tertiary">
              制定日: 2026年2月17日
            </p>
          </section>
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
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSerWPa3fBFUoKFgce1s2yEu4YIZR0t59auTD1TC_tkjTvKxCA/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#757575] hover:text-white transition-colors">お問い合わせ</a>
          </div>
          <p className="text-[11px] text-[#757575]">&copy; 2026 サウナ子 All rights reserved.</p>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
