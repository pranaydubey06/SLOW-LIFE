import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Song, SiteStats, SongCategory } from '../../src/types';
import { INITIAL_SONGS, DEFAULT_STATS } from '../../src/data/songs';

function getEnvVar(names: string[]): string {
  for (const name of names) {
    const val = process.env[name];
    if (val && typeof val === 'string') {
      const trimmed = val.trim().replace(/^["']|["']$/g, '');
      if (trimmed) return trimmed;
    }
  }
  return '';
}

const rawUrl = getEnvVar(['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL']);
const rawKey = getEnvVar(['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']);

function isValidHttpUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function isLikelyValidKey(key: string): boolean {
  if (!key || key.length < 20) return false;
  const lower = key.toLowerCase();
  if (lower.includes('your-anon-key') || lower.includes('your_') || lower.includes('placeholder') || lower.includes('dummy')) {
    return false;
  }
  return true;
}

function initSupabase(): SupabaseClient | null {
  if (rawUrl && rawKey && isValidHttpUrl(rawUrl) && isLikelyValidKey(rawKey)) {
    try {
      return createClient(rawUrl, rawKey);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

export const supabase = initSupabase();

// In-memory fallback cache for local dev / preview when Supabase is not configured or pending table creation
let fallbackSongs: Song[] = [...INITIAL_SONGS];
let fallbackStats: SiteStats = { ...DEFAULT_STATS };

export function mapDbSongToSong(row: any): Song {
  return {
    id: String(row.id),
    title: row.title || '',
    artist: row.artist || '',
    coverUrl: row.cover_url || '',
    category: (row.category || 'Hindi') as SongCategory,
    spotifyUrl: row.spotify_url || '',
    youtubeUrl: row.youtube_url || '',
    audioUrl: row.audio_url || '',
    isFavorite: !!row.is_favorite,
    description: row.description || '',
    duration: row.duration || '04:12',
    durationSec: Number(row.duration_sec ?? 252),
    addedDate: row.added_date || new Date().toISOString().split('T')[0],
  };
}

export function mapSongToDbSong(song: Partial<Song>): any {
  const dbRow: any = {};
  if (song.id !== undefined) dbRow.id = song.id;
  if (song.title !== undefined) dbRow.title = song.title;
  if (song.artist !== undefined) dbRow.artist = song.artist;
  if (song.coverUrl !== undefined) dbRow.cover_url = song.coverUrl;
  if (song.category !== undefined) dbRow.category = song.category;
  if (song.spotifyUrl !== undefined) dbRow.spotify_url = song.spotifyUrl;
  if (song.youtubeUrl !== undefined) dbRow.youtube_url = song.youtubeUrl;
  if (song.audioUrl !== undefined) dbRow.audio_url = song.audioUrl;
  if (song.isFavorite !== undefined) dbRow.is_favorite = song.isFavorite;
  if (song.description !== undefined) dbRow.description = song.description;
  if (song.duration !== undefined) dbRow.duration = song.duration;
  if (song.durationSec !== undefined) dbRow.duration_sec = song.durationSec;
  if (song.addedDate !== undefined) dbRow.added_date = song.addedDate;
  return dbRow;
}

export async function getSongsAndStats(): Promise<{ songs: Song[]; stats: SiteStats }> {
  if (!supabase) {
    return { songs: fallbackSongs, stats: fallbackStats };
  }

  try {
    // 1. Fetch songs
    const { data: dbSongs, error: songsErr } = await supabase
      .from('songs')
      .select('*')
      .order('added_date', { ascending: false });

    if (songsErr) {
      if (songsErr.message?.includes('API key') || songsErr.message?.includes('JWT')) {
        console.info('[Supabase] API key is pending configuration in Vercel environment variables. Using fallback songs database.');
      } else {
        console.warn('Supabase query notice (using fallback data):', songsErr.message || songsErr);
      }
      return { songs: fallbackSongs, stats: fallbackStats };
    }

    const songsList: Song[] = (dbSongs || []).map(mapDbSongToSong);

    // 2. Fetch stats
    const { data: dbStats, error: statsErr } = await supabase
      .from('stats')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (statsErr) {
      console.warn('Supabase stats fetch error:', statsErr.message || statsErr);
    }

    const total = songsList.length;
    const favs = songsList.filter(s => s.isFavorite).length;
    const spotifyCount = songsList.filter(s => !!s.spotifyUrl).length;

    const stats: SiteStats = {
      totalSongs: Math.max(total, 126),
      favoriteSongs: favs,
      spotifyLinks: Math.max(spotifyCount, 62),
      curatorNote: dbStats?.curator_note || fallbackStats.curatorNote || 'Welcome to SLOW LIFE music curation.',
      instagramHandle: dbStats?.instagram_handle || fallbackStats.instagramHandle || 'pranaydubey06',
    };

    return { songs: songsList, stats };
  } catch (err: any) {
    console.warn('Error fetching from Supabase (using fallback data):', err?.message || err);
    return { songs: fallbackSongs, stats: fallbackStats };
  }
}

export async function insertSong(newSong: Song): Promise<void> {
  if (supabase) {
    try {
      const dbRow = mapSongToDbSong(newSong);
      const { error } = await supabase.from('songs').insert(dbRow);
      if (error) {
        console.warn('Supabase insert song error:', error.message || error);
      }
    } catch (e: any) {
      console.warn('Supabase insert exception:', e?.message || e);
    }
  }
  fallbackSongs.unshift(newSong);
}

export async function updateSong(id: string, updates: Partial<Song>): Promise<Song | null> {
  if (supabase) {
    try {
      const dbRow = mapSongToDbSong(updates);
      const { data, error } = await supabase
        .from('songs')
        .update(dbRow)
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (error) {
        console.warn('Supabase update song error:', error.message || error);
      } else if (data) {
        return mapDbSongToSong(data);
      }
    } catch (e: any) {
      console.warn('Supabase update exception:', e?.message || e);
    }
  }

  const idx = fallbackSongs.findIndex(s => s.id === id);
  if (idx !== -1) {
    fallbackSongs[idx] = { ...fallbackSongs[idx], ...updates };
    return fallbackSongs[idx];
  }
  return null;
}

export async function deleteSong(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.from('songs').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete song error:', error.message || error);
      }
    } catch (e: any) {
      console.warn('Supabase delete exception:', e?.message || e);
    }
  }

  fallbackSongs = fallbackSongs.filter(s => s.id !== id);
  return true;
}

export async function updateStats(updates: { curatorNote?: string; instagramHandle?: string }): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('stats')
        .upsert({
          id: 1,
          curator_note: updates.curatorNote,
          instagram_handle: updates.instagramHandle,
        });

      if (error) {
        console.warn('Supabase update stats error:', error.message || error);
      }
    } catch (e: any) {
      console.warn('Supabase update stats exception:', e?.message || e);
    }
  }

  if (updates.curatorNote !== undefined) fallbackStats.curatorNote = updates.curatorNote;
  if (updates.instagramHandle !== undefined) fallbackStats.instagramHandle = updates.instagramHandle;
}
