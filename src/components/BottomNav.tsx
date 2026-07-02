'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, BookOpen } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  Icon: typeof Home;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'ホーム', Icon: Home },
  { href: '/search', label: 'さがす', Icon: Search },
  { href: '/favorites', label: 'お気に入り', Icon: Heart },
  { href: '/articles', label: '記事', Icon: BookOpen },
];

function isActive(pathname: string, href: string): boolean {
  // トップは完全一致のみ（/search 等に誤マッチさせない）
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();

  // 施設詳細・外部リンクリダイレクトは固定予約CTAバーと競合するため非表示
  if (pathname.startsWith('/facilities/') || pathname.startsWith('/go/')) {
    return null;
  }

  return (
    <>
      {/* fixed バーで隠れる分の余白（safe-area も含めて確保） */}
      <div
        className="h-14 pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-hidden="true"
      />
      <nav
        aria-label="モバイルナビゲーション"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden h-14 pb-[env(safe-area-inset-bottom)] bg-surface border-t border-border flex items-stretch"
      >
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                active ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
