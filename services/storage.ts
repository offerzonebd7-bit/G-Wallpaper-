
import { Wallpaper, FAQItem, Category } from '../types';

const KEYS = {
  WALLPAPERS: 'graphico_wallpapers',
  FAQS: 'graphico_faqs',
  LOGO: 'graphico_logo',
  THEME: 'graphico_theme'
};

const INITIAL_WALLPAPERS: Wallpaper[] = [
  {
    id: '1',
    code: 'GG-101',
    title: 'Modern Bismillah',
    imageUrl: 'https://picsum.photos/seed/arabic/1080/1920',
    category: Category.ARABIC,
    price: 0,
    createdAt: Date.now()
  },
  {
    id: '2',
    code: 'GG-102',
    title: 'Bengal Beauty',
    imageUrl: 'https://picsum.photos/seed/bangla/1080/1920',
    category: Category.BANGLA,
    price: 5.99,
    createdAt: Date.now()
  }
];

export const getWallpapers = (): Wallpaper[] => {
  try {
    const data = localStorage.getItem(KEYS.WALLPAPERS);
    if (!data) {
      localStorage.setItem(KEYS.WALLPAPERS, JSON.stringify(INITIAL_WALLPAPERS));
      return INITIAL_WALLPAPERS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Corrupted wallpapers data, resetting...");
    localStorage.setItem(KEYS.WALLPAPERS, JSON.stringify(INITIAL_WALLPAPERS));
    return INITIAL_WALLPAPERS;
  }
};

export const saveWallpaper = (wallpaper: Wallpaper): boolean => {
  try {
    const current = getWallpapers();
    const updated = [wallpaper, ...current];
    localStorage.setItem(KEYS.WALLPAPERS, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Storage Error (likely size limit):", error);
    return false;
  }
};

export const getFAQs = (): FAQItem[] => {
  try {
    const data = localStorage.getItem(KEYS.FAQS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveFAQs = (faqs: FAQItem[]) => {
  localStorage.setItem(KEYS.FAQS, JSON.stringify(faqs));
};

export const getLogo = (): string | null => localStorage.getItem(KEYS.LOGO);
export const saveLogo = (base64: string) => localStorage.setItem(KEYS.LOGO, base64);

export const getTheme = (): string => localStorage.getItem(KEYS.THEME) || 'dark';
export const saveTheme = (theme: string) => localStorage.setItem(KEYS.THEME, theme);
