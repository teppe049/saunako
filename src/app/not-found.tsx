import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="flex flex-col items-center justify-center px-5 py-16 md:py-24">
        {/* Avatar */}
        <Image
          src="/saunako-avatar.png"
          alt="サウナ子"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full object-cover mb-6"
        />

        {/* 404 Label */}
        <p className="text-saunako text-sm font-semibold tracking-wider mb-2">
          404
        </p>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-3">
          ページが見つかりません
        </h1>
        <p className="text-text-secondary text-sm md:text-base text-center max-w-md mb-2 leading-relaxed">
          あれ？このページは見つからないみたい...
        </p>
        <p className="text-text-tertiary text-xs md:text-sm text-center max-w-md mb-10">
          URLが間違っているか、ページが移動した可能性があります。
        </p>

        {/* Saunako Comment */}
        <div className="bg-saunako-bg border border-saunako-border rounded-xl px-4 py-3 md:px-5 md:py-4 flex items-start gap-2.5 md:gap-3 max-w-md w-full mb-10">
          <Image
            src="/saunako-avatar.png"
            alt="サウナ子"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
          />
          <p className="text-sm text-text-primary leading-relaxed pt-2">
            大丈夫！トップページから、あなたにぴったりのサウナを一緒に探そうよ
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <Link
            href="/"
            className="bg-saunako text-white rounded-[10px] font-semibold px-6 py-3 text-center hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            トップページへ戻る
          </Link>
          <Link
            href="/search"
            className="text-primary font-semibold hover:opacity-80 transition-opacity px-6 py-3 text-center w-full sm:w-auto"
          >
            施設を探す
          </Link>
        </div>
      </main>
    </div>
  );
}
