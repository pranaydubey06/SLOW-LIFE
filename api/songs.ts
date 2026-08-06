import { getSongsAndStats, insertSong } from './lib/supabase.js';
import { isAdminAuthenticated } from './lib/auth.js';
import { setCorsHeaders } from './lib/cors.js';
import { Song, SongCategory } from '../src/types.js';

const VALID_CATEGORIES: SongCategory[] = ['Old', 'Sad', 'Ghazal', 'Hindi', 'Romantic', 'Bengali', 'Classics'];

function getValidCategory(cat: unknown, fallback: SongCategory = 'Hindi'): SongCategory {
  if (typeof cat === 'string' && VALID_CATEGORIES.includes(cat as SongCategory)) {
    return cat as SongCategory;
  }
  return fallback;
}

export default async function handler(req: any, res: any) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const data = await getSongsAndStats();
      return res.status(200).json(data);
    } catch (err: any) {
      console.error('API /api/songs GET error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to fetch songs' });
    }
  }

  if (req.method === 'POST') {
    try {
      if (!isAdminAuthenticated(req)) {
        return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
      }

      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (_) {}
      }

      const { title, artist, coverUrl, category, spotifyUrl, youtubeUrl, audioUrl, description, isFavorite } = body || {};

      if (!title || typeof title !== 'string' || !artist || typeof artist !== 'string') {
        return res.status(400).json({ error: 'Title and Artist are required and must be non-empty strings' });
      }

      const newSong: Song = {
        id: `song-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim().slice(0, 150),
        artist: artist.trim().slice(0, 150),
        coverUrl: (typeof coverUrl === 'string' && coverUrl.trim()) ? coverUrl.trim() : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        category: getValidCategory(category),
        spotifyUrl: (typeof spotifyUrl === 'string') ? spotifyUrl.trim() : '',
        youtubeUrl: (typeof youtubeUrl === 'string') ? youtubeUrl.trim() : '',
        audioUrl: (typeof audioUrl === 'string' && audioUrl.trim()) ? audioUrl.trim() : 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-chill-112194.mp3',
        isFavorite: !!isFavorite,
        description: (typeof description === 'string') ? description.trim().slice(0, 1000) : '',
        duration: '04:12',
        durationSec: 252,
        addedDate: new Date().toISOString().split('T')[0],
      };

      await insertSong(newSong);
      const data = await getSongsAndStats();

      return res.status(200).json({
        success: true,
        song: newSong,
        songs: data.songs,
        stats: data.stats,
      });
    } catch (err: any) {
      console.error('API /api/songs POST error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to add song' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
