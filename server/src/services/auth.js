import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export async function authenticateGoogle(credential) {
  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
  const info = ticket.getPayload();
  if (!info?.email_verified) throw Object.assign(new Error('A verified Google email is required'), { status: 401 });
  const email = info.email.toLowerCase();
  const domains = (process.env.ALLOWED_EMAIL_DOMAINS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  const allowlist = (process.env.ALLOWED_EMAILS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  if (!domains.some(domain => email.endsWith(`@${domain}`)) && !allowlist.includes(email)) throw Object.assign(new Error('This account is not authorized for RVCE Academic Hub'), { status: 403 });
  // Any verified email on the configured institutional domain may create its
  // own student account at first sign-in. Staff roles remain admin-managed.
  let user = await User.findOne({ email });
  if (!user) {
    try {
      user = await User.create({
        googleId: info.sub,
        name: info.name || email.split('@')[0],
        email,
        role: 'student',
        isActive: true,
        approvalStatus: 'approved',
      });
    } catch (error) {
      // A concurrent first sign-in may have created the same unique email.
      if (error.code !== 11000) throw error;
      user = await User.findOne({ email });
      if (!user) throw error;
    }
  }
  if (!user.isActive || user.approvalStatus !== 'approved') throw Object.assign(new Error('Account is pending approval or inactive'), { status: 403 });
  user.googleId = info.sub; user.lastLoginAt = new Date(); await user.save();
  return { user, token: jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TTL || '4h' }) };
}
