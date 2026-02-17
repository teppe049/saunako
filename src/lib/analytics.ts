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

/**
 * 施設詳細ページ閲覧を GA4 に送信
 */
export function trackFacilityView(
  facilityId: number,
  facilityName: string,
  area: string
): void {
  sendGAEvent('view_facility', {
    facility_id: facilityId,
    facility_name: facilityName,
    area,
  });
}

/**
 * 施設カードクリックを GA4 に送信
 */
export function trackFacilityCardClick(
  facilityId: number,
  facilityName: string,
  listPosition: number
): void {
  sendGAEvent('click_facility_card', {
    facility_id: facilityId,
    facility_name: facilityName,
    list_position: listPosition,
  });
}

/**
 * 検索実行を GA4 に送信
 */
export function trackSearch(
  searchTerm: string,
  resultsCount: number
): void {
  sendGAEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

/**
 * フィルター変更を GA4 に送信
 */
export function trackFilterChange(
  filterType: string,
  filterValue: string
): void {
  sendGAEvent('filter_change', {
    filter_type: filterType,
    filter_value: filterValue,
  });
}

/**
 * 外部リンククリックを GA4 に送信
 */
export function trackExternalLinkClick(
  facilityId: number,
  linkType: string,
  destinationUrl: string
): void {
  sendGAEvent('click_external_link', {
    facility_id: facilityId,
    link_type: linkType,
    destination_url: destinationUrl,
  });
}
