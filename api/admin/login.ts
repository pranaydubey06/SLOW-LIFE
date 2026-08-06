import crypto from 'crypto';
import { generateAdminToken } from '../lib/auth';
import { setCorsHeaders } from '../lib/cors';

export default async function handler(req: any, res: any) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (_) {}
    }

    const password = body?.password;
    if (typeof password !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    const adminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.replace(/^["']|["']$/g, '').trim() : '';
    if (!adminPassword) {
      return res.status(500).json({
        success: false,
        message: 'ADMIN_PASSWORD environment variable is not configured on the server.',
      });
    }

    const inputTrimmed = password.trim();
    const configTrimmed = adminPassword.trim();

    let isMatch = false;
    try {
      const inputBuffer = Buffer.from(inputTrimmed);
      const adminBuffer = Buffer.from(configTrimmed);
      if (inputBuffer.length === adminBuffer.length) {
        isMatch = crypto.timingSafeEqual(inputBuffer, adminBuffer);
      }
    } catch (_) {
      isMatch = (inputTrimmed === configTrimmed);
    }

    if (isMatch) {
      const token = generateAdminToken();
      return res.status(200).json({
        success: true,
        token,
        message: 'Welcome back to SLOW LIFE Admin',
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin Password',
      });
    }
  } catch (err: any) {
    console.error('Login handler error:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Internal server error during authentication',
    });
  }
}
