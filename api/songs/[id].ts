import { getSongsAndStats, updateSong, deleteSong } from '../lib/supabase.js';
import { getAdminToken, verifyAdminToken, isAdminAuthenticated } from '../lib/auth.js';
import { setCorsHeaders } from '../lib/cors.js';
import { SongCategory } from '../../src/types.js';

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

  // Retrieve id from req.query.id or req.url path
  let id = req.query?.id;
  if (!id && req.url) {
    const parts = req.url.split('?')[0].split('/');
    id = parts[parts.length - 1];
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Song ID is required' });
  }

  if (req.method === 'PUT') {
    try {
      const token = getAdminToken(req);
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Authentication token is missing' });
      }

      const isAdmin = verifyAdminToken(token);
      const isGuest = token === 'guest_token';

      if (!isAdmin && !isGuest) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }

      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (_) {}
      }

      let updates: any = {};
      if (isAdmin) {
        const { title, artist, coverUrl, category, spotifyUrl, youtubeUrl, audioUrl, description, isFavorite } = body || {};
        if (typeof title === 'string') updates.title = title.trim().slice(0, 150);
        if (typeof artist === 'string') updates.artist = artist.trim().slice(0, 150);
        if (typeof coverUrl === 'string') updates.coverUrl = coverUrl.trim().slice(0, 500);
        if (category !== undefined) updates.category = getValidCategory(category);
        if (typeof spotifyUrl === 'string') updates.spotifyUrl = spotifyUrl.trim().slice(0, 500);
        if (typeof youtubeUrl === 'string') updates.youtubeUrl = youtubeUrl.trim().slice(0, 500);
        if (typeof audioUrl === 'string') updates.audioUrl = audioUrl.trim().slice(0, 500);
        if (typeof description === 'string') updates.description = description.trim().slice(0, 1000);
        if (typeof isFavorite === 'boolean') updates.isFavorite = isFavorite;
      } else {
        const { isFavorite } = body || {};
        if (typeof isFavorite !== 'boolean') {
          return res.status(400).json({ error: 'Invalid payload: guest users can only toggle isFavorite' });
        }
        updates.isFavorite = isFavorite;
      }

      const updated = await updateSong(id, updates);
      const data = await getSongsAndStats();

      return res.status(200).json({
        success: true,
        song: updated,
        songs: data.songs,
        stats: data.stats,
      });
    } catch (err: any) {
      console.error(`API /api/songs/${id} PUT error:`, err);
      return res.status(500).json({ error: err?.message || 'Failed to update song' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      if (!isAdminAuthenticated(req)) {
        return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
      }

      await deleteSong(id);
      const data = await getSongsAndStats();

      return res.status(200).json({
        success: true,
        songs: data.songs,
        stats: data.stats,
      });
    } catch (err: any) {
      console.error(`API /api/songs/${id} DELETE error:`, err);
      return res.status(500).json({ error: err?.message || 'Failed to delete song' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
