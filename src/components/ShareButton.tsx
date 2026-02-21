'use client';

interface ShareButtonProps {
  name: string;
  url: string;
  area?: string;
  priceMin?: number;
}

export default function ShareButton({ name, url, area, priceMin }: ShareButtonProps) {
  const fullUrl = `https://saunako.jp${url}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url: fullUrl });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(fullUrl);
      alert('URLをコピーしました');
    }
  };

  const handleXShare = () => {
    const details = [
      area && `📍${area}`,
      priceMin && priceMin > 0 && `💰${priceMin.toLocaleString()}円〜`,
    ].filter(Boolean).join(' ');
    const text = encodeURIComponent(`${name}${details ? `\n${details}` : ''}\n\n#サウナ子 #個室サウナ`);
    const shareUrl = encodeURIComponent(fullUrl);
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${shareUrl}`,
      '_blank',
      'noopener,noreferrer,width=550,height=420'
    );
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleXShare}
        className="flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm rounded-lg px-3 py-2.5 md:px-3 md:py-2"
        style={{ background: '#F0F0F0' }}
        data-track-click="share_x"
        aria-label="Xでシェア"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        <span className="hidden md:inline">Xでシェア</span>
      </button>
      <button
        onClick={handleShare}
        className="flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm rounded-lg px-3 py-2.5 md:px-3 md:py-2"
        style={{ background: '#F0F0F0' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="hidden md:inline">共有</span>
      </button>
    </div>
  );
}
