import { isAdminAuthenticated } from '../lib/auth';
import { setCorsHeaders } from '../lib/cors';

export default async function handler(req: any, res: any) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const isAuth = isAdminAuthenticated(req);
  return res.status(200).json({ success: isAuth });
}
