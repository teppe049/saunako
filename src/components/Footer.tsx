import Link from 'next/link';
import Image from 'next/image';
import { PREFECTURES } from '@/lib/types';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white py-8 md:pt-12 md:pb-8">
      <div className="max-w-7xl mx-auto px-5 md:px-20">
        {/* Mobile: centered single column */}
        <div className="flex flex-col items-center gap-4 md:hidden">
          <span className="font-bold text-base text-white">サウナ子</span>
          <div className="flex items-center gap-3">
            <a href="https://x.com/saunako_jp" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="X (Twitter)" data-track-click="sns_follow" data-track-service="x">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </div>
          <p className="text-xs text-[#757575] text-center leading-relaxed">
            当サイトは個室サウナの情報をまとめた非公式の検索サービスです。掲載情報は正確性を保証するものではありません。最新の料金・営業時間は各施設の公式サイトをご確認ください。掲載画像の著作権は各施設に帰属します。
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {PREFECTURES.map((pref) => (
              <Link key={pref.code} href={`/area/${pref.code}`} className="text-xs text-[#9CA3AF] hover:text-white transition-colors">{pref.label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/search" className="text-xs text-[#757575] hover:text-white transition-colors">施設を探す</Link>
            <Link href="/articles" className="text-xs text-[#757575] hover:text-white transition-colors">記事</Link>
            <Link href="/terms" className="text-xs text-[#757575] hover:text-white transition-colors">利用規約</Link>
            <Link href="/privacy" className="text-xs text-[#757575] hover:text-white transition-colors">プライバシーポリシー</Link>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSerWPa3fBFUoKFgce1s2yEu4YIZR0t59auTD1TC_tkjTvKxCA/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="text-xs text-[#757575] hover:text-white transition-colors">お問い合わせ</a>
            <Link href="/faq" className="text-xs text-[#757575] hover:text-white transition-colors">よくある質問</Link>
            <Link href="/for-owners" className="text-xs text-[#757575] hover:text-white transition-colors">施設掲載のご案内</Link>
          </div>
          <p className="text-xs text-[#757575]">
            © 2026 サウナ子 All rights reserved.
          </p>
        </div>

        {/* PC: 3-column grid */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-12 mb-10">
            {/* Brand Column */}
            <div className="max-w-[320px]">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/saunako-avatar.webp"
                  alt="サウナ子"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-bold text-base">サウナ子</span>
              </div>
              <p className="text-[13px] text-[#9CA3AF] leading-relaxed">
                あなたの「整い」を見つける、プライベートサウナ専門の比較・検索サービス。水風呂の温度からロウリュの有無まで、サウナ好きが気になるポイントを徹底比較。
              </p>
              <div className="flex items-center gap-3 mt-4">
                <a href="https://x.com/saunako_jp" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="X (Twitter)" data-track-click="sns_follow" data-track-service="x">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              </div>
            </div>

            {/* Service Column */}
            <div>
              <h3 className="text-[13px] font-semibold text-white mb-4">サービス</h3>
              <ul className="space-y-3">
                <li><Link href="/search" className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">施設を探す</Link></li>
                <li><Link href="/articles" className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">記事</Link></li>
                <li><Link href="/faq" className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">よくある質問</Link></li>
              </ul>
            </div>

            {/* Area Column */}
            <div>
              <h3 className="text-[13px] font-semibold text-white mb-4">エリアから探す</h3>
              <ul className="space-y-3">
                {PREFECTURES.map((pref) => (
                  <li key={pref.code}><Link href={`/area/${pref.code}`} className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">{pref.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Disclaimer Column */}
            <div>
              <h3 className="text-[13px] font-semibold text-white mb-4">ご注意</h3>
              <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
                当サイトは個室サウナの情報をまとめた非公式の検索サービスです。掲載情報は正確性を保証するものではありません。最新の料金・営業時間は各施設の公式サイトをご確認ください。掲載画像の著作権は各施設に帰属します。
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#333333] pt-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-[12px] text-[#6B7280] hover:text-white transition-colors">利用規約</Link>
              <Link href="/privacy" className="text-[12px] text-[#6B7280] hover:text-white transition-colors">プライバシーポリシー</Link>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSerWPa3fBFUoKFgce1s2yEu4YIZR0t59auTD1TC_tkjTvKxCA/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#6B7280] hover:text-white transition-colors">お問い合わせ</a>
              <Link href="/for-owners" className="text-[12px] text-[#6B7280] hover:text-white transition-colors">施設掲載のご案内</Link>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://x.com/saunako_jp" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="X (Twitter)" data-track-click="sns_follow" data-track-service="x">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            </div>
            <p className="text-[12px] text-[#6B7280] text-center">
              © 2026 サウナ子 All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
