import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-primary text-2xl">●</span>
          <span className="font-bold text-lg text-text-primary">サウナ子</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          <Link href="/area/tokyo" className="text-text-secondary hover:text-text-primary">
            東京
          </Link>
          <Link href="/area/osaka" className="text-text-secondary hover:text-text-primary">
            大阪
          </Link>
        </nav>
      </div>
    </header>
  );
}
