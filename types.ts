
export enum Category {
  ARABIC = 'Arabic',
  BANGLA = 'Bangla',
  CALLIGRAPHY = 'Calligraphy',
  NORMAL = 'Normal',
  FREE = 'Free',
  PREMIUM = 'Premium'
}

export interface Wallpaper {
  id: string;
  code: string;
  title: string;
  description?: string; // নতুন: ওয়ালপেপারের বিবরণ
  imageUrl: string;
  category: Category;
  price: number; // 0 for free
  createdAt: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
