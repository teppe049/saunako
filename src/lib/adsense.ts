// AdSense ヘルパー

/**
 * AdSense クライアントID
 * 環境変数 NEXT_PUBLIC_ADSENSE_CLIENT_ID で設定する
 */
export const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '';

/**
 * AdSense が有効かどうか
 * プレースホルダー (ca-pub-XXXXXXXXXXXXXXXX) の場合は無効とみなす
 */
export const isAdSenseEnabled =
  !!ADSENSE_CLIENT_ID && !ADSENSE_CLIENT_ID.includes('XXXXXXXXXXXXXXXX');
