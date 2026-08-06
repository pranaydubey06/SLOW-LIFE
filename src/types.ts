export type SongCategory = 'Old' | 'Sad' | 'Ghazal' | 'Hindi' | 'Romantic' | 'Bengali' | 'Classics';

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  category: SongCategory;
  spotifyUrl?: string;
  youtubeUrl?: string;
  audioUrl?: string;
  isFavorite: boolean;
  featuredOrder?: number;
  description?: string;
  duration: string;
  durationSec: number;
  addedDate?: string;
}

export interface SiteStats {
  totalSongs: number;
  favoriteSongs: number;
  spotifyLinks: number;
  curatorNote?: string;
  instagramHandle?: string;
}

export type AdminTab = 'dashboard' | 'favorites' | 'songs' | 'add' | 'settings';
