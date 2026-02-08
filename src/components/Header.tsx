import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-20 h-14 md:h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/saunako-avatar.png"
            alt="サウナ子"
            width={36}
            height={36}
            className="w-9 h-9 rounded-[18px] object-cover"
          />
          <span className="font-bold text-[20px] text-text-primary">サウナ子</span>
        </Link>
      </div>
    </header>
  );
}
