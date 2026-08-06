import { getSongsAndStats, updateStats } from './lib/supabase';
import { isAdminAuthenticated } from './lib/auth';
import { setCorsHeaders } from './lib/cors';

export default async function handler(req: any, res: any) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const { curatorNote, instagramHandle } = body || {};

    await updateStats({
      curatorNote: typeof curatorNote === 'string' ? curatorNote.trim().slice(0, 2000) : undefined,
      instagramHandle: typeof instagramHandle === 'string' ? instagramHandle.trim().slice(0, 100) : undefined,
    });

    const data = await getSongsAndStats();

    return res.status(200).json({
      success: true,
      stats: data.stats,
    });
  } catch (err: any) {
    console.error('API /api/stats PUT error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to update stats' });
  }
}
