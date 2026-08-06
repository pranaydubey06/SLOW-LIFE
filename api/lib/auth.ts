import crypto from 'crypto';

export function getTokenSecret(): string {
  const secret = process.env.TOKEN_SECRET ? process.env.TOKEN_SECRET.replace(/^["']|["']$/g, '').trim() : '';
  if (secret) return secret;
  const adminPass = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.replace(/^["']|["']$/g, '').trim() : '';
  if (adminPass) return `token_secret_${adminPass}`;
  return 'slowlife_default_jwt_signing_secret_2026';
}

export function generateAdminToken(): string {
  const secret = getTokenSecret();
  if (!secret) {
    throw new Error('TOKEN_SECRET environment variable is not configured on the server.');
  }
  const payload = { role: 'admin', exp: Date.now() + 24 * 60 * 60 * 1000 };
  const str = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret).update(str).digest('hex');
  return `admin_token_${Buffer.from(str).toString('base64')}.${signature}`;
}

export function verifyAdminToken(token: string): boolean {
  if (!token || !token.startsWith('admin_token_')) return false;
  const secret = getTokenSecret();
  if (!secret) return false;

  try {
    const parts = token.slice('admin_token_'.length).split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, signature] = parts;
    const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf8');
    const expectedSig = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
    if (signature !== expectedSig) return false;

    const payload = JSON.parse(payloadStr);
    if (payload.role === 'admin' && payload.exp > Date.now()) {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}

export function getAdminToken(req: any): string | null {
  const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return authHeader;
}

export function isAdminAuthenticated(req: any): boolean {
  const token = getAdminToken(req);
  if (!token) return false;
  return verifyAdminToken(token);
}
