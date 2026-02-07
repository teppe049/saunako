import Link from 'next/link';
import { User, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-20 h-14 md:h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-[18px] flex items-center justify-center text-white text-lg"
            style={{ background: 'linear-gradient(135deg, #E85A4F, #FF8A80)' }}
          >
            ♨
          </div>
          <span className="font-bold text-[20px] text-text-primary">サウナ子</span>
        </Link>
        {/* Mobile: Hamburger menu */}
        <button className="md:hidden flex items-center justify-center text-text-primary">
          <Menu size={24} />
        </button>
        {/* PC: Login button */}
        <button className="hidden md:flex items-center gap-2 border border-border rounded-lg px-6 py-2.5 text-text-primary hover:bg-bg transition-colors">
          <User size={16} />
          <span className="text-sm font-medium">ログイン</span>
        </button>
      </div>
    </header>
  );
}
