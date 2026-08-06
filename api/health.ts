import { setCorsHeaders } from './lib/cors';

export default async function handler(req: any, res: any) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({ status: 'ok', name: 'SLOW LIFE API' });
}
