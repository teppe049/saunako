// GA4 Analytics ヘルパー

// gtag の型宣言
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      targetOrAction: string | Date,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * GA4 Measurement ID
 * 環境変数 NEXT_PUBLIC_GA_MEASUREMENT_ID で設定するか、
 * 未設定の場合はプレースホルダーを使用
 */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

/**
 * GA4 にイベントを送信する汎用関数
 */
export function sendGAEvent(
  action: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;

  window.gtag('event', action, params);
}

/**
 * 予約リンクのクリックを GA4 に送信
 */
export function trackReservationClick(
  facilityId: number,
  facilityName: string,
  destinationUrl: string
): void {
  sendGAEvent('click_reservation_link', {
    facility_id: facilityId,
    facility_name: facilityName,
    destination_url: destinationUrl,
  });
}
