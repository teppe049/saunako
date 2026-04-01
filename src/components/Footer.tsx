import Link from 'next/link';
import Image from 'next/image';
import { REGION_GROUPS } from '@/lib/types';

const CONDITION_LINKS = [
  { label: 'カップルOK', href: '/search?coupleOk=true' },
  { label: '水風呂あり', href: '/search?waterBath=true' },
  { label: 'セルフロウリュ', href: '/search?selfLoyly=true' },
  { label: '外気浴あり', href: '/search?outdoorAir=true' },
  { label: '3,000円以下', href: '/search?priceMax=3000' },
  { label: '5,000円以下', href: '/search?priceMax=5000' },
];

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
            <a href="https://www.instagram.com/saunako_jp" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="Instagram" data-track-click="sns_follow" data-track-service="instagram">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
          <p className="text-xs text-[#757575] text-center leading-relaxed">
            当サイトは個室サウナの情報をまとめた非公式の検索サービスです。掲載情報は正確性を保証するものではありません。最新の料金・営業時間は各施設の公式サイトをご確認ください。掲載画像の著作権は各施設に帰属します。
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/search" className="text-xs text-[#757575] hover:text-white transition-colors">施設を探す</Link>
            <Link href="/articles" className="text-xs text-[#757575] hover:text-white transition-colors">記事</Link>
            <Link href="/terms" className="text-xs text-[#757575] hover:text-white transition-colors">利用規約</Link>
            <Link href="/privacy" className="text-xs text-[#757575] hover:text-white transition-colors">プライバシーポリシー</Link>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSerWPa3fBFUoKFgce1s2yEu4YIZR0t59auTD1TC_tkjTvKxCA/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="text-xs text-[#757575] hover:text-white transition-colors">お問い合わせ</a>
            <Link href="/about" className="text-xs text-[#757575] hover:text-white transition-colors">サウナ子について</Link>
            <Link href="/faq" className="text-xs text-[#757575] hover:text-white transition-colors">よくある質問</Link>
            <Link href="/for-owners" className="text-xs text-[#757575] hover:text-white transition-colors">施設掲載のご案内</Link>
          </div>
          {/* Area links */}
          <div className="w-full border-t border-[#333333] pt-4">
            <p className="text-[11px] font-semibold text-[#9CA3AF] mb-3 text-center">エリアから探す</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {REGION_GROUPS.map((region) => (
                <div key={region.label}>
                  <p className="text-[10px] text-[#6B7280] mb-1">{region.label}</p>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                    {region.prefectures.map((pref) => (
                      <Link key={pref.code} href={`/area/${pref.code}`} className="text-[11px] text-[#9CA3AF] hover:text-white transition-colors">{pref.label}</Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full border-t border-[#333333] pt-4">
            <p className="text-[11px] font-semibold text-[#9CA3AF] mb-3 text-center">条件から探す</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {CONDITION_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="text-[11px] text-[#9CA3AF] hover:text-white transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#757575]">
            © 2026 サウナ子 All rights reserved.
          </p>
        </div>

        {/* PC: 3-column grid */}
        <div className="hidden md:block">
          {/* Upper: Brand / Service / Disclaimer */}
          <div className="grid grid-cols-3 gap-12 mb-10">
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
                <a href="https://www.instagram.com/saunako_jp" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="Instagram" data-track-click="sns_follow" data-track-service="instagram">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
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
                <li><Link href="/about" className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">サウナ子について</Link></li>
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

          {/* Lower: Area full-width */}
          <div className="mb-10">
            <h3 className="text-[13px] font-semibold text-white mb-4">エリアから探す</h3>
            <div className="flex justify-between">
              {REGION_GROUPS.map((region) => (
                <div key={region.label}>
                  <p className="text-[12px] text-[#6B7280] mb-2">{region.label}</p>
                  <ul className="space-y-2">
                    {region.prefectures.map((pref) => (
                      <li key={pref.code}><Link href={`/area/${pref.code}`} className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">{pref.label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Condition links */}
          <div className="mb-10">
            <h3 className="text-[13px] font-semibold text-white mb-4">条件から探す</h3>
            <div className="flex gap-4">
              {CONDITION_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">{link.label}</Link>
              ))}
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
              <a href="https://www.instagram.com/saunako_jp" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="Instagram" data-track-click="sns_follow" data-track-service="instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
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
