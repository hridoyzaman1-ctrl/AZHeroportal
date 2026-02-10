
export type Category = string;
export type SubCategory = 'Marvel' | 'DC' | 'Top Rated' | 'Indie' | 'Other';
export type ContentType = 'Article' | 'Trailer' | 'Review' | 'Blog';
export type UserRole = 'Admin' | 'Author' | 'Editor' | 'Guest';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  address?: string;
  mobile?: string;
  dob?: string;
  role: UserRole;
  avatar: string;
  joinedDate: string;
  isVerified: boolean;
  isApproved: boolean;
  isRejected: boolean;
  verificationCode?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  date: string;
}

export interface Comment {
  id: string;
  author: string;
  email?: string;
  date: string;
  text: string;
  avatar: string;
  userScore?: number;
  isVisible: boolean;
  replies?: Comment[];
}

export interface VaultItem {
  id: string;
  type: ContentType;
  title: string;
  categories: string[];
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  content: string;
  summary?: string;
  rating?: string;
  userRatings: number[];
  likes: number;
  comments: Comment[];
  status: 'Published' | 'Draft' | 'Archived';
  views: number;
  isHero?: boolean;
  isScroller?: boolean;
  isTrending?: boolean;
  isVideoSection?: boolean;
  isMainFeed?: boolean;
  isMarvelTrending?: boolean;
  isDCTrending?: boolean;
}

export interface RankingList {
  id: string;
  title: string;
  description: string;
  type: 'Best' | 'Worst' | 'Personal' | 'Trending';
  items: {
    vaultItemId: string;
    rank: number;
    overrideDescription?: string;
  }[];
}

export interface SocialLink {
  id: string;
  platform: 'Facebook' | 'WhatsApp' | 'YouTube' | 'X' | 'TikTok' | 'Instagram' | 'Discord';
  url: string;
  icon: string;
  visible: boolean;
}

export interface SiteSettings {
  address: string;
  showAddress: boolean;
  contactEmail: string;
  socialLinks: SocialLink[];
  copyrightYear: string;
}
