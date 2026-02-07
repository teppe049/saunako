export interface Facility {
  id: number;
  slug: string;
  name: string;
  prefecture: string;
  prefectureLabel: string;
  city: string;
  area: string;
  address: string;
  nearestStation: string;
  walkMinutes: number;
  priceMin: number;
  duration: number;
  capacity: number;
  features: {
    waterBath: boolean;
    waterBathTemp: string | null;
    selfLoyly: boolean;
    outdoorAir: boolean;
    coupleOk: boolean;
    bluetooth: boolean | null;
    wifi: boolean | null;
  };
  businessHours: string;
  holidays: string;
  website: string;
  phone: string;
  bookingUrl: string | null;
  amenities: string[];
  note: string | null;
  images: string[];
  lat: number | null;
  lng: number | null;
  saunakoCommentShort: string;
  saunakoCommentLong: string;
  updatedAt: string;
}

export interface Prefecture {
  code: string;
  label: string;
}

export const PREFECTURES: Prefecture[] = [
  { code: 'tokyo', label: '東京都' },
  { code: 'osaka', label: '大阪府' },
];
